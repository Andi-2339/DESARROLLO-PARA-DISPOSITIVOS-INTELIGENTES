import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private supabase = inject(SupabaseService);

  /**
   * Registra una acción en la bitácora de auditoría.
   * Captura automáticamente la IP pública del usuario.
   */
  async logAction(userId: string | null, email: string, accion: string, detalles: string = '') {
    try {
      const ip = await this.getPublicIP();

      const { error } = await this.supabase.client
        .from('bitacora')
        .insert({
          user_id: userId,
          usuario_email: email,
          accion: accion,
          detalles: detalles,
          ip: ip
        });

      if (error) {
        console.error('[Audit] Error al registrar en bitácora:', error);
      }
    } catch (err) {
      console.error('[Audit] Error general:', err);
    }
  }

  /**
   * Obtiene los registros de la bitácora (solo admins)
   */
  async getAuditLogs(filters?: { userId?: string; accion?: string; desde?: string; hasta?: string }) {
    let query = this.supabase.client
      .from('bitacora')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.accion) {
      query = query.eq('accion', filters.accion);
    }
    if (filters?.desde) {
      query = query.gte('created_at', filters.desde);
    }
    if (filters?.hasta) {
      query = query.lte('created_at', filters.hasta);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Intenta obtener la IP pública del usuario
   */
  private async getPublicIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'N/A';
    } catch {
      return 'N/A';
    }
  }
}
