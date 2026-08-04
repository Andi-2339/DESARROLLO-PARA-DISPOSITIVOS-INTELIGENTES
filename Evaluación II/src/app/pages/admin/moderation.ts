import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="moderation-container neon-animated-box">
      <h1>Panel de Moderación</h1>
      <p>Revisa los reportes de los usuarios y toma acciones sobre el contenido inapropiado.</p>
      
      <div *ngIf="loading()" class="loader">Cargando reportes...</div>

      <div class="reports-list" *ngIf="!loading()">
        <div *ngIf="reports().length === 0" class="no-data">
          No hay reportes pendientes.
        </div>

        <article *ngFor="let report of reports()" class="report-card">
          <div class="report-header">
            <span class="report-date">{{ report.created_at | date:'short' }}</span>
            <span class="status-badge" [class.resolved]="report.resuelto">
              {{ report.resuelto ? 'Resuelto' : 'Pendiente' }}
            </span>
          </div>
          <div class="report-body">
            <h3>Reporte sobre: "{{ report.posts?.titulo || 'Publicación Eliminada' }}"</h3>
            <p><strong>Motivo:</strong> {{ report.motivo }}</p>
          </div>
          <div class="report-actions" *ngIf="!report.resuelto">
            <button class="btn-warn" (click)="resolveReport(report.id)">✅ Marcar como Resuelto</button>
            <button class="btn-danger" *ngIf="report.posts" (click)="deletePost(report.post_id)">❌ Eliminar Publicación Original</button>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .moderation-container { padding: 30px; color: white; background: #0a0a0a; border-radius: 12px; margin: 20px; }
    h1 { color: var(--pink); border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 20px; }
    .reports-list { display: flex; flex-direction: column; gap: 15px; }
    .report-card { background: #111; border-left: 4px solid var(--blue); padding: 15px; border-radius: 8px; }
    .report-header { display: flex; justify-content: space-between; font-size: 0.8em; color: #888; margin-bottom: 10px; }
    .status-badge { padding: 3px 8px; border-radius: 12px; border: 1px solid #ffaa00; color: #ffaa00; }
    .status-badge.resolved { border-color: #00ff88; color: #00ff88; }
    .report-body h3 { color: white; font-size: 1.1em; margin-bottom: 5px; }
    .report-body p { color: #ccc; font-size: 0.9em; }
    .report-actions { margin-top: 15px; display: flex; gap: 10px; }
    button { padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; font-size: 0.85em; transition: 0.3s; }
    .btn-warn { background: transparent; color: #00ff88; border: 1px solid #00ff88; }
    .btn-warn:hover { background: #00ff88; color: black; }
    .btn-danger { background: transparent; color: #ff4444; border: 1px solid #ff4444; }
    .btn-danger:hover { background: #ff4444; color: white; }
    .no-data { color: #888; font-style: italic; }
  `]
})
export class ModerationComponent implements OnInit {
  supabase = inject(SupabaseService);
  reports = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadReports();
  }

  async loadReports() {
    this.loading.set(true);
    try {
      const data = await this.supabase.getReports();
      this.reports.set(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  async resolveReport(reportId: string) {
    try {
      await this.supabase.client.from('reports').update({ resuelto: true }).eq('id', reportId);
      this.loadReports();
    } catch (e) {
      console.error(e);
    }
  }

  async deletePost(postId: string) {
    if (confirm('Eliminar la publicación original eliminará el contenido del portal. ¿Continuar?')) {
      try {
        await this.supabase.deletePost(postId);
        this.loadReports();
      } catch (e) {
        console.error(e);
      }
    }
  }
}
