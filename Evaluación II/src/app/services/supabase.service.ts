import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // NUEVA URL DEL PROYECTO LIMPIO
    const supabaseUrl = 'https://mtwhobrdwjlffflxnrud.supabase.co';
    // NUEVA CLAVE ANON PUBLIC
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10d2hvYnJkd2psZmZmbHhucnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjYzMzIsImV4cCI6MjA5MTI0MjMzMn0.IZy-nH12l9pbiDcu94jdPhwhTNks8-9ts01wd2-A5g4';
    
    console.log('[Supabase] Conectado al nuevo proyecto:', supabaseUrl);
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  // --- MÉTODOS DE USUARIOS ---
  
  async getUserProfile(uid: string) {
    const { data, error } = await this.supabase
      .from('perfiles')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('[Supabase] Error al obtener perfil:', error);
    }
    return data;
  }

  async syncUser(userData: any) {
    const { data, error } = await this.supabase
      .from('perfiles')
      .upsert(userData)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error en sync:', error);
      throw error;
    }
    return data;
  }

  async updateProfile(uid: string, profileData: any) {
    const { data, error } = await this.supabase
      .from('perfiles')
      .update(profileData)
      .eq('id', uid)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error en update:', error);
      throw error;
    }
    return data;
  }

  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('perfiles')
      .select('*')
      .order('fecha_creacion', { ascending: false });
    if (error) throw error;
    return data;
  }

  // --- GESTIÓN DE CUENTAS (Prácticas 11-13) ---

  /** Crear un usuario nuevo desde el panel admin */
  async createUserProfile(profileData: any) {
    const { data, error } = await this.supabase
      .from('perfiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Activar o desactivar una cuenta (eliminación lógica) */
  async toggleUserActive(uid: string, activo: boolean) {
    const { data, error } = await this.supabase
      .from('perfiles')
      .update({ activo })
      .eq('id', uid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Cambiar el rol de un usuario */
  async changeUserRole(uid: string, newRole: string) {
    const { data, error } = await this.supabase
      .from('perfiles')
      .update({ rol: newRole })
      .eq('id', uid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Marcar que requiere cambio de contraseña */
  async setRequirePasswordChange(uid: string, required: boolean) {
    const { data, error } = await this.supabase
      .from('perfiles')
      .update({ requiere_cambio_password: required })
      .eq('id', uid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Registrar último acceso */
  async updateLastAccess(uid: string) {
    await this.supabase
      .from('perfiles')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', uid);
  }

  /** Registrar intento fallido de login */
  async registerFailedAttempt(uid: string) {
    // Primero obtener el perfil actual
    const profile = await this.getUserProfile(uid);
    if (!profile) return;

    const intentos = (profile.intentos_fallidos || 0) + 1;
    const updateData: any = { intentos_fallidos: intentos };

    // Si llega a 5 intentos, bloquear por 5 minutos
    if (intentos >= 5) {
      const bloqueoHasta = new Date();
      bloqueoHasta.setMinutes(bloqueoHasta.getMinutes() + 5);
      updateData.bloqueado_hasta = bloqueoHasta.toISOString();
    }

    await this.supabase
      .from('perfiles')
      .update(updateData)
      .eq('id', uid);
  }

  /** Resetear intentos fallidos */
  async resetFailedAttempts(uid: string) {
    await this.supabase
      .from('perfiles')
      .update({ intentos_fallidos: 0, bloqueado_hasta: null })
      .eq('id', uid);
  }

  /** Obtener usuario por email */
  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('perfiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Supabase] Error buscando por email:', error);
    }
    return data;
  }

  // --- BITÁCORA DE AUDITORÍA ---

  async getAuditLogs(limit: number = 200) {
    const { data, error } = await this.supabase
      .from('bitacora')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // --- CRUD MODERACIÓN (POSTS & REPORTES) ---

  async getPosts(isAdmin: boolean = false) {
    let query = this.supabase.from('posts').select('*').order('created_at', { ascending: false });
    
    // Si no es admin, solo traemos los posts que NO están ocultos
    if (!isAdmin) {
      query = query.eq('is_hidden', false);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async deletePost(postId: string) {
    const { error } = await this.supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
  }

  async togglePostVisibility(postId: string, currentHiddenStatus: boolean) {
    const { error } = await this.supabase
      .from('posts')
      .update({ is_hidden: !currentHiddenStatus })
      .eq('id', postId);
    if (error) throw error;
  }

  async createReport(postId: string, reporterId: string, motivo: string) {
    const { error } = await this.supabase
      .from('reports')
      .insert({
        post_id: postId,
        reporter_id: reporterId,
        motivo: motivo
      });
    if (error) throw error;
  }

  async getReports() {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*, posts(titulo)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}
