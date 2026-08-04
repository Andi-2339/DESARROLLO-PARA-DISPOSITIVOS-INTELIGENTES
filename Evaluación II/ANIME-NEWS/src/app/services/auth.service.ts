import { Injectable, signal, inject, computed, NgZone } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuditService } from './audit.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService).client;
  private sbService = inject(SupabaseService);
  private auditService = inject(AuditService);
  private ngZone = inject(NgZone);

  // Señales de estado
  user = signal<User | null>(null);
  userProfile = signal<any>(null); // Datos de la tabla 'perfiles'
  userRole = signal<'admin' | 'editor' | 'cliente' | 'invitado' | null>(null);
  isProfileComplete = signal<boolean>(false);
  loading = signal<boolean>(true);

  // Computados para UI
  isAdmin = computed(() => this.userRole() === 'admin');
  isLoggedIn = computed(() => !!this.user());
  userName = computed(() => this.userProfile()?.nombre || this.user()?.user_metadata?.['full_name'] || this.user()?.email?.split('@')[0] || 'Usuario');

  // ============================
  // SEGURIDAD: Expiración de sesión
  // ============================
  private inactivityTimer: any = null;
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

  constructor() {
    this.initAuth();
    this.initInactivityDetection();
  }

  private async initAuth() {
    // 1. Obtener sesión inicial
    const { data: { session } } = await this.supabase.auth.getSession();
    this.handleAuthStateChange(session?.user ?? null);

    // 2. Escuchar cambios futuros
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.handleAuthStateChange(session?.user ?? null);
    });
  }

  private async handleAuthStateChange(user: User | null) {
    this.user.set(user);
    
    if (user) {
      try {
        const profile = await this.sbService.getUserProfile(user.id);
        if (profile) {
          this.userProfile.set(profile);
          this.userRole.set(profile.rol || 'cliente');
          this.isProfileComplete.set(!!profile.profile_complete);

          // Registrar último acceso
          await this.sbService.updateLastAccess(user.id);
        } else {
          // Si no tiene perfil, lo marcamos como incompleto
          this.isProfileComplete.set(false);
          this.userRole.set('cliente');
        }
      } catch (error) {
        console.error('[Auth] Error al sincronizar perfil:', error);
      }
    } else {
      this.userProfile.set(null);
      this.userRole.set(null);
      this.isProfileComplete.set(false);
    }
    this.loading.set(false);
  }

  // ============================
  // SEGURIDAD: Detección de inactividad
  // ============================
  private initInactivityDetection() {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer(), { passive: true });
    });

    this.resetInactivityTimer();
  }

  private resetInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    if (this.isLoggedIn()) {
      this.ngZone.runOutsideAngular(() => {
        this.inactivityTimer = setTimeout(() => {
          this.ngZone.run(() => {
            this.handleSessionExpired();
          });
        }, this.SESSION_TIMEOUT_MS);
      });
    }
  }

  private async handleSessionExpired() {
    if (this.isLoggedIn()) {
      const email = this.user()?.email || 'desconocido';
      const uid = this.user()?.id || null;
      
      await this.auditService.logAction(uid, email, 'SESION_EXPIRADA', 'Sesión cerrada por inactividad (30 min)');
      await this.logout();
      alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión de nuevo.');
    }
  }

  // ============================
  // SEGURIDAD: Validación de contraseña
  // ============================
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos 1 letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos 1 letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Al menos 1 número');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Al menos 1 carácter especial (!@#$%...)');
    }

    return { valid: errors.length === 0, errors };
  }

  // ============================
  // SEGURIDAD: Bloqueo temporal
  // ============================
  isAccountLocked(): boolean {
    const lockData = localStorage.getItem('login_lock');
    if (!lockData) return false;

    const { until, attempts } = JSON.parse(lockData);
    if (attempts >= 5 && new Date(until) > new Date()) {
      return true;
    }

    // Si ya pasó el tiempo de bloqueo, limpiar
    if (new Date(until) <= new Date()) {
      localStorage.removeItem('login_lock');
    }
    return false;
  }

  getRemainingLockTime(): number {
    const lockData = localStorage.getItem('login_lock');
    if (!lockData) return 0;

    const { until } = JSON.parse(lockData);
    const remaining = new Date(until).getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  private registerFailedLoginAttempt() {
    const lockData = localStorage.getItem('login_lock');
    let attempts = 0;

    if (lockData) {
      attempts = JSON.parse(lockData).attempts || 0;
    }

    attempts++;

    if (attempts >= 5) {
      const until = new Date();
      until.setMinutes(until.getMinutes() + 5);
      localStorage.setItem('login_lock', JSON.stringify({ attempts, until: until.toISOString() }));
    } else {
      localStorage.setItem('login_lock', JSON.stringify({ attempts, until: null }));
    }
  }

  private clearLoginAttempts() {
    localStorage.removeItem('login_lock');
  }

  // =========================
  // LOGIN / SIGNUP METHODS
  // =========================
  
  async signUpWithEmail(email: string, pass: string, profileData: any) {
    // Validar contraseña antes de crear
    const validation = this.validatePassword(pass);
    if (!validation.valid) {
      throw new Error('Contraseña insegura: ' + validation.errors.join(', '));
    }

    // 1. Crear usuario en Auth de Supabase
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: profileData.nombres + ' ' + (profileData.apellidos || '')
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Error al crear usuario');

    // 2. Crear inmediatamente el perfil en la tabla 'perfiles'
    const newProfile = {
      id: data.user.id,
      email: email,
      nombre: profileData.nombres,
      apellidos: profileData.apellidos,
      edad: parseInt(profileData.edad),
      telefono: profileData.phoneNumber,
      avatar_name: profileData.avatarName,
      profile_complete: true, // Lo marcamos como completo de una vez
      rol: 'cliente',
      activo: true,
      fecha_creacion: new Date().toISOString()
    };

    const savedProfile = await this.sbService.syncUser(newProfile);
    this.userProfile.set(savedProfile);
    this.isProfileComplete.set(true);

    // Registrar en bitácora
    await this.auditService.logAction(data.user.id, email, 'ALTA_USUARIO', 'Registro de nuevo usuario');
    
    // Desloguear automáticamente después del registro para forzar el Log In manual
    await this.supabase.auth.signOut();
    this.user.set(null);
    this.userProfile.set(null);
    this.isProfileComplete.set(false);
    
    return data;
  }

  async loginWithEmail(email: string, pass: string) {
    // Verificar bloqueo temporal
    if (this.isAccountLocked()) {
      const remaining = this.getRemainingLockTime();
      throw new Error(`Cuenta bloqueada temporalmente. Intenta de nuevo en ${remaining} segundos.`);
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        this.registerFailedLoginAttempt();

        // Intentar registrar en Supabase también
        const profile = await this.sbService.getUserByEmail(email);
        if (profile) {
          await this.sbService.registerFailedAttempt(profile.id);
        }

        throw error;
      }

      // Login exitoso — limpiar intentos
      this.clearLoginAttempts();
      if (data.user) {
        await this.sbService.resetFailedAttempts(data.user.id);
        await this.auditService.logAction(data.user.id, email, 'INICIO_SESION', 'Login exitoso');
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  async loginWithGoogle() {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/signup'
      }
    });
    if (error) throw error;
  }

  async logout() {
    const email = this.user()?.email || 'desconocido';
    const uid = this.user()?.id || null;

    // Registrar en bitácora antes de cerrar sesión
    await this.auditService.logAction(uid, email, 'CIERRE_SESION', 'Logout manual');

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    await this.supabase.auth.signOut();
  }

  // =========================
  // UPDATES
  // =========================
  async updateProfileData(uid: string, profileData: any) {
    const formattedData = {
      nombre: profileData.nombres,
      apellidos: profileData.apellidos,
      edad: parseInt(profileData.edad),
      telefono: profileData.phoneNumber,
      avatar_name: profileData.avatarName,
      profile_complete: true,
      email: this.user()?.email
    };
    
    const data = await this.sbService.updateProfile(uid, formattedData);
    this.userProfile.set(data);
    this.isProfileComplete.set(true);
    return data;
  }

  async changePassword(newPassword: string) {
    const validation = this.validatePassword(newPassword);
    if (!validation.valid) {
      throw new Error('Contraseña insegura: ' + validation.errors.join(', '));
    }

    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    // Registrar en bitácora
    const email = this.user()?.email || 'desconocido';
    const uid = this.user()?.id || null;
    await this.auditService.logAction(uid, email, 'CAMBIO_PASSWORD', 'Contraseña actualizada');

    // Quitar flag de cambio requerido
    if (uid) {
      await this.sbService.setRequirePasswordChange(uid, false);
    }
  }
}