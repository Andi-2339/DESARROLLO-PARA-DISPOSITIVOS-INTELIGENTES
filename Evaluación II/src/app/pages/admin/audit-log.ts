import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../services/audit.service';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="content-wrapper">
      <main class="main-content">
        <section class="basic-info">
          <h1>📝 Bitácora de Auditoría</h1>
          <p class="persuasive-text">Registro completo de actividades del sistema — Seguimiento de seguridad</p>

          <!-- FILTROS -->
          <div class="audit-filters neon-animated-box">
            <div class="audit-filters-inner">
              <h3>Filtros</h3>
              <div class="filter-row">
                <div class="filter-group">
                  <label>Acción</label>
                  <select [(ngModel)]="filterAction" (change)="applyFilters()" class="filter-select">
                    <option value="">Todas</option>
                    <option value="INICIO_SESION">Inicio de Sesión</option>
                    <option value="CIERRE_SESION">Cierre de Sesión</option>
                    <option value="SESION_EXPIRADA">Sesión Expirada</option>
                    <option value="ALTA_USUARIO">Alta de Usuario</option>
                    <option value="BAJA_USUARIO">Baja de Usuario</option>
                    <option value="CAMBIO_PASSWORD">Cambio de Contraseña</option>
                    <option value="CAMBIO_ROL">Cambio de Rol</option>
                    <option value="ACTIVAR_CUENTA">Activar Cuenta</option>
                    <option value="DESACTIVAR_CUENTA">Desactivar Cuenta</option>
                    <option value="EDITAR_USUARIO">Editar Usuario</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Buscar usuario</label>
                  <input type="text" [(ngModel)]="filterEmail" (input)="applyFilters()"
                         placeholder="Correo del usuario...">
                </div>
                <div class="filter-group">
                  <button class="btn-clear-filters" (click)="clearFilters()">🔄 Limpiar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- TABLA DE REGISTROS -->
          <div class="neon-animated-box" style="padding: 0; overflow-x: auto;">
            <div style="padding: 5px;">
              @if (loading()) {
                <div class="status-msg">Cargando registros...</div>
              } @else if (filteredLogs().length === 0) {
                <div class="status-msg">No hay registros que coincidan con los filtros.</div>
              } @else {
                <table class="audit-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Usuario</th>
                      <th>Acción</th>
                      <th>Detalles</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (log of filteredLogs(); track log.id) {
                      <tr [class]="getActionClass(log.accion)">
                        <td>{{ formatDate(log.created_at) }}</td>
                        <td>{{ formatTime(log.created_at) }}</td>
                        <td class="user-cell">{{ log.usuario_email || 'N/A' }}</td>
                        <td>
                          <span class="action-badge" [class]="'badge-' + getActionType(log.accion)">
                            {{ getActionIcon(log.accion) }} {{ log.accion }}
                          </span>
                        </td>
                        <td class="details-cell">{{ log.detalles || '—' }}</td>
                        <td class="ip-cell">{{ log.ip || 'N/A' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          </div>

          <div class="audit-summary" style="margin-top: 20px;">
            <small style="color: #555;">Mostrando {{ filteredLogs().length }} de {{ allLogs().length }} registros</small>
          </div>
        </section>
      </main>

      <aside class="sidebar-root">
        <app-sidebar></app-sidebar>
      </aside>
    </div>
  `,
  styles: [`
    .audit-filters-inner { padding: 25px; }
    .audit-filters-inner h3 { color: var(--blue); margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 10px; text-shadow: 0 0 10px var(--blue); }
    
    .filter-row { display: flex; gap: 20px; align-items: flex-end; flex-wrap: wrap; }
    .filter-group { flex: 1; min-width: 180px; }
    .filter-group label { display: block; color: #888; font-size: 0.8em; margin-bottom: 5px; }
    .filter-select { width: 100%; background: #111; border: 1px solid #333; color: white; padding: 8px 12px; border-radius: 6px; }
    .filter-select option { background: #111; }
    .btn-clear-filters { padding: 8px 20px; background: transparent; border: 1px solid #444; color: #888; border-radius: 6px; cursor: pointer; font-size: 0.85em; box-shadow: none; transition: 0.3s; }
    .btn-clear-filters:hover { border-color: var(--blue); color: var(--blue); transform: none; }

    .audit-table { width: 100%; border-collapse: collapse; color: white; text-align: left; font-size: 0.88em; }
    .audit-table thead tr { border-bottom: 2px solid #222; background: rgba(155, 77, 255, 0.08); }
    .audit-table th { padding: 14px 12px; color: var(--blue); text-transform: uppercase; font-size: 0.8em; letter-spacing: 1px; white-space: nowrap; }
    .audit-table td { padding: 12px; border-bottom: 1px solid #151515; }
    .audit-table tbody tr { transition: 0.2s; }
    .audit-table tbody tr:hover { background: rgba(0, 234, 255, 0.05); }

    .user-cell { color: var(--blue); font-size: 0.85em; }
    .details-cell { color: #888; font-size: 0.85em; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ip-cell { color: #555; font-family: monospace; font-size: 0.85em; }

    .action-badge {
      padding: 3px 10px; border-radius: 12px; font-size: 0.8em; font-weight: bold;
      display: inline-block; white-space: nowrap;
    }
    .badge-login { background: rgba(0, 255, 136, 0.15); color: #00ff88; border: 1px solid rgba(0, 255, 136, 0.3); }
    .badge-logout { background: rgba(255, 170, 0, 0.15); color: #ffaa00; border: 1px solid rgba(255, 170, 0, 0.3); }
    .badge-security { background: rgba(255, 68, 68, 0.15); color: #ff4444; border: 1px solid rgba(255, 68, 68, 0.3); }
    .badge-user { background: rgba(0, 234, 255, 0.15); color: var(--blue); border: 1px solid rgba(0, 234, 255, 0.3); }
    .badge-role { background: rgba(155, 77, 255, 0.15); color: var(--purple); border: 1px solid rgba(155, 77, 255, 0.3); }

    .status-msg { padding: 30px; text-align: center; color: #555; font-style: italic; }

    @media (max-width: 768px) {
      .filter-row { flex-direction: column; }
      .audit-table { font-size: 0.75em; }
    }
  `]
})
export class AuditLogComponent implements OnInit {
  private auditService = inject(AuditService);

  allLogs = signal<any[]>([]);
  filteredLogs = signal<any[]>([]);
  loading = signal(true);

  filterAction = '';
  filterEmail = '';

  ngOnInit() {
    this.loadLogs();
  }

  async loadLogs() {
    this.loading.set(true);
    try {
      const data = await this.auditService.getAuditLogs();
      this.allLogs.set(data);
      this.filteredLogs.set(data);
    } catch (err) {
      console.error('[Audit] Error:', err);
    } finally {
      this.loading.set(false);
    }
  }

  applyFilters() {
    let result = this.allLogs();

    if (this.filterAction) {
      result = result.filter(l => l.accion === this.filterAction);
    }
    if (this.filterEmail.trim()) {
      const query = this.filterEmail.trim().toLowerCase();
      result = result.filter(l => (l.usuario_email || '').toLowerCase().includes(query));
    }

    this.filteredLogs.set(result);
  }

  clearFilters() {
    this.filterAction = '';
    this.filterEmail = '';
    this.filteredLogs.set(this.allLogs());
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-MX');
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      'INICIO_SESION': '🟢',
      'CIERRE_SESION': '🔴',
      'SESION_EXPIRADA': '⏰',
      'ALTA_USUARIO': '👤',
      'BAJA_USUARIO': '❌',
      'CAMBIO_PASSWORD': '🔑',
      'CAMBIO_ROL': '🛡️',
      'ACTIVAR_CUENTA': '✅',
      'DESACTIVAR_CUENTA': '🚫',
      'EDITAR_USUARIO': '✏️'
    };
    return icons[action] || '📌';
  }

  getActionType(action: string): string {
    if (['INICIO_SESION'].includes(action)) return 'login';
    if (['CIERRE_SESION', 'SESION_EXPIRADA'].includes(action)) return 'logout';
    if (['CAMBIO_PASSWORD', 'DESACTIVAR_CUENTA', 'BAJA_USUARIO'].includes(action)) return 'security';
    if (['CAMBIO_ROL'].includes(action)) return 'role';
    return 'user';
  }

  getActionClass(action: string): string {
    return '';
  }
}
