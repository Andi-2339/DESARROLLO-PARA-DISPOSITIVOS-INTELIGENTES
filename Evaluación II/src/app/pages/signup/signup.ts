import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="signup-page">
      <div class="signup-container neon-animated-box">
        
        <!-- CABECERA -->
        <div class="header-section">
          <h1>{{ isLoginMode ? 'Inicia Sesión' : 'Crea tu Cuenta' }}</h1>
          <p class="persuasive-text">
            {{ isLoginMode ? 'Bienvenido de nuevo a Anime-News' : 'Únete a la mejor comunidad de anime' }}
          </p>
        </div>

        <!-- ERROR MESSAGE -->
        <div *ngIf="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <!-- SUCCESS MESSAGE -->
        <div *ngIf="successMessage" class="success-banner">
          {{ successMessage }}
        </div>

        <!-- LOGIN / SIGNUP TOGGLE -->
        <div class="mode-toggle">
          <button [class.active]="isLoginMode" (click)="isLoginMode = true; errorMessage=''">LOGIN</button>
          <button [class.active]="!isLoginMode" (click)="isLoginMode = false; errorMessage=''">REGISTRO</button>
        </div>

        <!-- FORMULARIO -->
        <div class="form-container">
          
          <!-- EMAIL Y PASS (SIEMPRE VISIBLES) -->
          <div class="input-group">
            <label>Correo Electrónico</label>
            <input type="email" [(ngModel)]="authData.email" placeholder="usuario@ejemplo.com">
          </div>
          
          <div class="input-group">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="authData.password" placeholder="••••••••">
          </div>

          <!-- DATOS DE PERFIL (SOLO EN REGISTRO) -->
          <ng-container *ngIf="!isLoginMode">
            <div class="profile-extra-fields">
              <div class="input-row">
                <div class="input-group">
                  <label>Nombre(s)</label>
                  <input type="text" [(ngModel)]="profile.nombres" placeholder="Ej. Juan">
                </div>
                <div class="input-group">
                  <label>Apellidos</label>
                  <input type="text" [(ngModel)]="profile.apellidos" placeholder="Ej. Pérez">
                </div>
              </div>

              <div class="input-row">
                <div class="input-group">
                  <label>Edad</label>
                  <input type="number" [(ngModel)]="profile.edad" placeholder="13+">
                </div>
                <div class="input-group">
                  <label>Nombre de Avatar</label>
                  <input type="text" [(ngModel)]="profile.avatarName" placeholder="Goku777">
                </div>
              </div>
            </div>
          </ng-container>

          <button (click)="handleSubmit()" [disabled]="loading" class="main-btn">
            <span *ngIf="!loading">{{ isLoginMode ? 'ENTRAR' : 'REGISTRARME AHORA' }}</span>
            <span *ngIf="loading" class="spinner-small"></span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .signup-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: #050505; color: white; }
    .signup-container { max-width: 550px; width: 100%; padding: 40px; border-radius: 20px; background: #0a0a0a; text-align: center; }
    
    h1 { font-size: 2.2em; margin-bottom: 10px; background: linear-gradient(45deg, var(--blue), var(--pink)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .persuasive-text { color: #888; font-size: 0.95em; margin-bottom: 25px; }

    .error-banner { background: rgba(255, 68, 68, 0.1); color: #ff4444; padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ff4444; font-size: 0.9em; }
    .success-banner { background: rgba(0, 255, 136, 0.1); color: #00ff88; padding: 12px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #00ff88; font-size: 0.9em; }

    /* Mode Toggle */
    .mode-toggle { display: flex; background: #111; border-radius: 10px; padding: 5px; margin-bottom: 30px; }
    .mode-toggle button { flex: 1; padding: 10px; border: none; background: transparent; color: #555; font-weight: bold; cursor: pointer; transition: 0.3s; border-radius: 8px; }
    .mode-toggle button.active { background: #222; color: var(--blue); box-shadow: 0 0 10px rgba(0, 149, 255, 0.3); }

    /* Form Styles */
    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .input-group { text-align: left; margin-bottom: 18px; }
    .input-group label { display: block; color: #666; font-size: 0.75em; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
    .input-group input { width: 100%; background: #111; border: 1px solid #222; padding: 12px; border-radius: 8px; color: white; transition: 0.3s; }
    .input-group input:focus { border-color: var(--pink); outline: none; }

    .main-btn { width: 100%; padding: 15px; border-radius: 10px; border: none; background: linear-gradient(45deg, var(--blue), var(--purple)); color: white; font-weight: bold; cursor: pointer; margin-top: 10px; display: flex; align-items: center; justify-content: center; }
    .main-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0, 149, 255, 0.4); }

    .spinner-small { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SignupComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  cdr = inject(ChangeDetectorRef);

  isLoginMode = true;
  loading = false;
  errorMessage = '';
  successMessage = '';

  authData = {
    email: '',
    password: ''
  };

  profile = {
    nombres: '',
    apellidos: '',
    edad: 0,
    avatarName: '',
    phoneNumber: ''
  };

  ngOnInit() {
    // Detectamos si venimos de "Login" o "Registro" desde la cabecera
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'signup') {
        this.isLoginMode = false;
      } else {
        this.isLoginMode = true;
      }
    });
  }

  async handleSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const timeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.errorMessage = '⌛ Error de conexión: El servidor de Supabase no responde. Revisa que el ID del proyecto sea correcto o intenta usar otra red.';
        this.cdr.detectChanges();
      }
    }, 10000);

    try {
      if (this.isLoginMode) {
        // --- LOGIN ---
        await this.authService.loginWithEmail(this.authData.email, this.authData.password);
        clearTimeout(timeout);
        this.router.navigate(['/home']);
      } else {
        // --- REGISTRO ---
        // Validación de EDAD
        if (this.profile.edad < 13) {
          throw new Error('Lo sentimos, debes ser mayor de 13 años para registrarte en Anime-News.');
        }

        if (!this.profile.nombres || !this.profile.avatarName) {
          throw new Error('Nombre y Avatar son obligatorios.');
        }

        await this.authService.signUpWithEmail(this.authData.email, this.authData.password, this.profile);
        
        clearTimeout(timeout);
        this.successMessage = '¡Registro exitoso! Ya puedes iniciar sesión.';
        this.isLoginMode = true;
      }
    } catch (err: any) {
      clearTimeout(timeout);
      this.errorMessage = err.message || 'Error de autenticación.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
