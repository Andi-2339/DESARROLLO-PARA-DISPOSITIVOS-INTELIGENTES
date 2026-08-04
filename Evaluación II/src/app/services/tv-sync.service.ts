import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';

export interface DeviceSyncData {
  heart_rate: number;
  hype_level: number;
  episodes: number;
  critical_alert: boolean;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TvSyncService {
  private supabaseService = inject(SupabaseService);
  
  private syncDataSubject = new BehaviorSubject<DeviceSyncData | null>(null);
  public syncData$ = this.syncDataSubject.asObservable();

  constructor() {
    this.initRealtimeSubscription();
  }

  private initRealtimeSubscription() {
    // Escuchar cambios en la tabla 'device_sync'
    this.supabaseService.client
      .channel('public:device_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'device_sync' },
        (payload) => {
          if (payload.new) {
            const data = payload.new as any;
            this.syncDataSubject.next({
              heart_rate: data.heart_rate || 0,
              hype_level: data.hype_level || 0,
              episodes: data.episodes || 0,
              critical_alert: data.critical_alert || false
            });
          }
        }
      )
      .subscribe();
      
    // Intento inicial de obtener datos
    this.fetchInitialData();
  }
  
  private async fetchInitialData() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('device_sync')
        .select('*')
        .eq('id', 1) // ID del dispositivo que estamos usando
        .single();
        
      if (data && !error) {
         this.syncDataSubject.next({
            heart_rate: data.heart_rate || 0,
            hype_level: data.hype_level || 0,
            episodes: data.episodes || 0,
            critical_alert: data.critical_alert || false
         });
      }
    } catch (e) {
      console.error('Error fetching initial sync data', e);
    }
  }
}
