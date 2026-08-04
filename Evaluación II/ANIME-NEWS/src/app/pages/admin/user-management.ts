import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { SupabaseService } from '../../services/supabase.service';
import { AuditService } from '../../services/audit.service';
import { AuthService } from '../../services/auth.service';

interface UserItem {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: 'admin' | 'editor' | 'cliente' | 'invitado';
  profile_complete: boolean;
  activo: boolean;
  ultimo_acceso: string;
  fecha_creacion: string;
  intentos_fallidos: number;
  requiere_cambio_password: boolean;
  telefono: string;
  edad: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="content-wrapper">
      <main class="main-content">
        <section class="basic-info">
          <h1>👥 Gestión de Usuarios</h1>
          <p class="persuasive-text">Administración completa de cuentas — CRUD, Roles, Activación y Seguridad</p>

          @if (loading) {
            <div class="status-msg">Cargando lista de usuarios...</div>
          }

          <!-- BOTÓN CREAR USUARIO -->
          <div class="action-bar">
            <button class="btn-create" (click)="showCreateForm = !showCreateForm">
              {{ showCreateForm ? '✕ Cancelar' : '➕ Crear Usuario' }}
            </button>
            <div class="user-stats">
              <span class="stat-badge active-stat">{{ activeCount() }} activos</span>
              <span class="stat-badge inactive-stat">{{ inactiveCount() }} inactivos</span>
            </div>
          </div>

          <!-- FORMULARIO DE CREACIÓN -->
          @if (showCreateForm) {
            <div class="neon-animated-box create-form-box">
              <div class="create-form-inner">
                <h3>Crear Nuevo Usuario</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Email *</label>
                    <input type="email" [(ngModel)]="newUser.email" placeholder="correo@ejemplo.com">
                  </div>
                  <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" [(ngModel)]="newUser.nombre" placeholder="Nombre(s)">
                  </div>
                  <div class="form-group">
                    <label>Apellidos</label>
                    <input type="text" [(ngModel)]="newUser.apellidos" placeholder="Apellidos">
                  </div>
                  <div class="form-group">
                    <label>Edad</label>
                    <input type="number" [(ngModel)]="newUser.edad" placeholder="18">
                  </div>
                  <div class="form-group">
                    <label>Teléfono</label>
                    <input type="text" [(ngModel)]="newUser.telefono" placeholder="+52...">
                  </div>
                  <div class="form-group">
                    <label>Rol</label>
                    <select [(ngModel)]="newUser.rol" class="select-field">
                      <option value="cliente">Cliente</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      <option value="invitado">Invitado</option>
                    </select>
                  </div>
                </div>
                @if (createError) {
                  <div class="error-banner">{{ createError }}</div>
                }
                <button class="btn-submit-create" (click)="createUser()">✅ Registrar Usuario</button>
              </div>
            </div>
          }

          <!-- TABLA DE USUARIOS -->
          <div class="neon-animated-box" style="padding: 0; overflow-x: auto;">
            <div style="padding: 3px;">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Perfil</th>
                    <th>Último Acceso</th>
                    <th>Creado</th>
                    <th style="text-align: center;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users(); track user.id) {
                    <tr [class.row-inactive]="!user.activo" 
                        [class.row-highlight]="highlightedUserId === user.id"
                        (mouseenter)="highlightedUserId = user.id"
                        (mouseleave)="highlightedUserId = ''">
                      <td>
                        <span class="status-dot" [class.dot-active]="user.activo" [class.dot-inactive]="!user.activo"
                              [title]="user.activo ? 'Activo' : 'Deshabilitado'"></span>
                      </td>
                      <td>
                        <strong>{{ user.nombre || 'Sin nombre' }}</strong>
                        <br><small style="color: #555;">{{ user.apellidos || '' }}</small>
                      </td>
                      <td style="font-size: 0.85em;">{{ user.email }}</td>
                      <td>
                        <span class="role-badge" [class]="'role-' + user.rol">{{ user.rol?.toUpperCase() }}</span>
                      </td>
                      <td>
                        <small [style.color]="user.profile_complete ? '#00ff88' : '#ff4444'">
                          {{ user.profile_complete ? '✓ COMPLETO' : '✗ PENDIENTE' }}
                        </small>
                      </td>
                      <td style="font-size: 0.8em; color: #888;">
                        {{ user.ultimo_acceso ? (user.ultimo_acceso | date:'short') : 'Nunca' }}
                      </td>
                      <td style="font-size: 0.8em; color: #666;">
                        {{ user.fecha_creacion ? (user.fecha_creacion | date:'shortDate') : '—' }}
                      </td>
                      <td class="actions-cell">
                        <!-- EDITAR -->
                        <button class="action-btn btn-edit-user" (click)="openEditModal(user)" title="Editar">✏️</button>
                        <!-- CAMBIAR ROL -->
                        <button class="action-btn btn-role" (click)="openRoleModal(user)" title="Cambiar Rol">🛡️</button>
                        <!-- ACTIVAR/DESACTIVAR -->
                        <button class="action-btn" [class.btn-activate]="!user.activo" [class.btn-deactivate]="user.activo"
                                (click)="toggleActive(user)" [title]="user.activo ? 'Desactivar' : 'Activar'">
                          {{ user.activo ? '🚫' : '✅' }}
                        </button>
                        <!-- ELIMINAR -->
                        <button class="action-btn btn-delete-user" (click)="deleteUser(user)" title="Eliminar">🗑️</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- TABLA DE PERMISOS POR ROL -->
          <div class="neon-animated-box permissions-box" style="margin-top: 40px;">
            <div style="padding: 30px;">
              <h3 style="color: var(--pink); margin-bottom: 20px; border-bottom: 1px solid #222; padding-bottom: 10px;">🛡️ Matriz de Permisos por Rol</h3>
              <table class="permissions-table">
                <thead>
                  <tr>
                    <th>Permiso</th>
                    <th>Admin</th>
                    <th>Editor</th>
                    <th>Cliente</th>
                    <th>Invitado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Ver contenido</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
                  <tr><td>Editar perfil propio</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td></tr>
                  <tr><td>Cambiar contraseña</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td></tr>
                  <tr><td>Crear publicaciones</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
                  <tr><td>Moderar contenido</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
                  <tr><td>Gestionar usuarios</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
                  <tr><td>Asignar roles</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
                  <tr><td>Ver bitácora</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
                  <tr><td>Activar/desactivar cuentas</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
                  <tr><td>Eliminar usuarios</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- MODAL EDITAR USUARIO -->
          @if (editingUser) {
            <div class="modal-overlay" (click)="closeEditModal()">
              <div class="modal-box" (click)="$event.stopPropagation()">
                <h3>✏️ Editar Usuario</h3>
                <div class="modal-form">
                  <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" [(ngModel)]="editData.nombre">
                  </div>
                  <div class="form-group">
                    <label>Apellidos</label>
                    <input type="text" [(ngModel)]="editData.apellidos">
                  </div>
                  <div class="form-group">
                    <label>Teléfono</label>
                    <input type="text" [(ngModel)]="editData.telefono">
                  </div>
                  <div class="form-group">
                    <label>
                      <input type="checkbox" [(ngModel)]="editData.requiere_cambio_password">
                      Requiere cambio de contraseña
                    </label>
                  </div>
                </div>
                <div class="modal-actions">
                  <button class="btn-save-modal" (click)="saveEdit()">💾 Guardar</button>
                  <button class="btn-cancel-modal" (click)="closeEditModal()">Cancelar</button>
                </div>
              </div>
            </div>
          }

          <!-- MODAL CAMBIAR ROL -->
          @if (roleUser) {
            <div class="modal-overlay" (click)="closeRoleModal()">
              <div class="modal-box" (click)="$event.stopPropagation()">
                <h3>🛡️ Cambiar Rol — {{ roleUser.nombre }}</h3>
                <p style="color: #888; margin-bottom: 20px;">Rol actual: <strong style="color: var(--pink);">{{ roleUser.rol }}</strong></p>
                <div class="role-options">
                  @for (role of availableRoles; track role) {
                    <button class="role-option-btn" [class.role-selected]="selectedRole === role"
                            (click)="selectedRole = role">
                      {{ getRoleIcon(role) }} {{ role.toUpperCase() }}
                    </button>
                  }
                </div>
                <div class="modal-actions">
                  <button class="btn-save-modal" (click)="saveRole()">✅ Aplicar Rol</button>
                  <button class="btn-cancel-modal" (click)="closeRoleModal()">Cancelar</button>
                </div>
              </div>
            </div>
          }

        </section>
      </main>

      <aside class="sidebar-root">
        <app-sidebar></app-sidebar>
      </aside>
    </div>
  `,
  styles: [`
    .action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
    .btn-create { padding: 10px 25px; font-size: 0.95em; font-weight: bold; cursor: pointer; }
    .user-stats { display: flex; gap: 10px; }
    .stat-badge { padding: 5px 14px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
    .active-stat { background: rgba(0, 255, 136, 0.15); color: #00ff88; border: 1px solid #00ff88; }
    .inactive-stat { background: rgba(255, 68, 68, 0.15); color: #ff4444; border: 1px solid #ff4444; }

    /* CREATE FORM */
    .create-form-box { margin-bottom: 25px; }
    .create-form-inner { padding: 30px; }
    .create-form-inner h3 { color: var(--blue); margin-bottom: 20px; border-bottom: 1px solid #222; padding-bottom: 10px; text-shadow: 0 0 10px var(--blue); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .form-group { margin-bottom: 10px; }
    .form-group label { display: block; color: #888; font-size: 0.8em; margin-bottom: 5px; }
    .form-group input, .select-field { width: 100%; background: #111; border: 1px solid #333; color: white; padding: 10px 12px; border-radius: 6px; font-size: 0.9em; }
    .select-field option { background: #111; }
    .btn-submit-create { margin-top: 15px; padding: 10px 30px; font-weight: bold; cursor: pointer; }

    /* TABLE */
    .users-table { width: 100%; border-collapse: collapse; color: white; text-align: left; font-size: 0.88em; }
    .users-table thead tr { border-bottom: 2px solid #222; background: rgba(255, 46, 209, 0.06); }
    .users-table th { padding: 14px 12px; color: var(--blue); text-transform: uppercase; font-size: 0.78em; letter-spacing: 1px; white-space: nowrap; }
    .users-table td { padding: 14px 12px; border-bottom: 1px solid #151515; }
    .users-table tbody tr { transition: 0.2s; }
    .users-table tbody tr:hover { background: rgba(0, 234, 255, 0.04); }
    .row-inactive { opacity: 0.45; }
    .row-highlight { background: rgba(155, 77, 255, 0.08) !important; }

    .status-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
    .dot-active { background: #00ff88; box-shadow: 0 0 6px #00ff88; }
    .dot-inactive { background: #ff4444; box-shadow: 0 0 6px #ff4444; }

    .role-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.75em; font-weight: bold; }
    .role-admin { background: rgba(255, 46, 209, 0.2); color: var(--pink); border: 1px solid var(--pink); }
    .role-editor { background: rgba(155, 77, 255, 0.2); color: var(--purple); border: 1px solid var(--purple); }
    .role-cliente { background: rgba(0, 234, 255, 0.2); color: var(--blue); border: 1px solid var(--blue); }
    .role-invitado { background: rgba(255, 255, 255, 0.1); color: #888; border: 1px solid #555; }

    .actions-cell { display: flex; gap: 5px; justify-content: center; flex-wrap: nowrap; }
    .action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: transparent; border: 1px solid #222; border-radius: 6px; cursor: pointer; font-size: 0.85em; transition: 0.3s; padding: 0; box-shadow: none; }
    .action-btn:hover { transform: none; }
    .btn-edit-user:hover { border-color: var(--blue); background: rgba(0, 234, 255, 0.1); }
    .btn-role:hover { border-color: var(--purple); background: rgba(155, 77, 255, 0.1); }
    .btn-activate:hover { border-color: #00ff88; background: rgba(0, 255, 136, 0.1); }
    .btn-deactivate:hover { border-color: #ffaa00; background: rgba(255, 170, 0, 0.1); }
    .btn-delete-user:hover { border-color: #ff4444; background: rgba(255, 68, 68, 0.1); }

    /* PERMISSIONS TABLE */
    .permissions-table { width: 100%; border-collapse: collapse; color: white; text-align: center; font-size: 0.85em; }
    .permissions-table th { padding: 10px; color: var(--blue); border-bottom: 1px solid #222; }
    .permissions-table td { padding: 10px; border-bottom: 1px solid #111; }
    .permissions-table td:first-child { text-align: left; color: #ccc; }

    /* MODALS */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 5000; }
    .modal-box { background: #0a0a0a; border: 2px solid var(--purple); border-radius: 15px; padding: 35px; max-width: 500px; width: 90%; box-shadow: 0 0 30px rgba(155, 77, 255, 0.3); }
    .modal-box h3 { color: #fff; margin-bottom: 25px; border-bottom: 1px solid #222; padding-bottom: 10px; text-shadow: 0 0 10px var(--blue); }
    .modal-form .form-group { margin-bottom: 15px; }
    .modal-actions { display: flex; gap: 10px; margin-top: 25px; }
    .btn-save-modal { padding: 10px 25px; font-weight: bold; cursor: pointer; }
    .btn-cancel-modal { padding: 10px 25px; background: transparent; border: 1px solid #444; color: #888; border-radius: 20px; cursor: pointer; box-shadow: none; }

    .role-options { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
    .role-option-btn { padding: 10px 20px; background: transparent; border: 1px solid #333; color: #888; border-radius: 8px; cursor: pointer; transition: 0.3s; font-size: 0.9em; box-shadow: none; }
    .role-option-btn:hover { border-color: var(--blue); color: var(--blue); transform: none; }
    .role-selected { background: var(--purple) !important; color: white !important; border-color: var(--purple) !important; }

    .status-msg { margin: 20px 0; color: var(--blue); font-style: italic; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .action-bar { flex-direction: column; }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private auditService = inject(AuditService);
  private authService = inject(AuthService);
  
  users = signal<UserItem[]>([]);
  loading = true;

  // Create form
  showCreateForm = false;
  createError = '';
  newUser = {
    email: '', nombre: '', apellidos: '', edad: 18, telefono: '', rol: 'cliente' as string
  };

  // Edit modal
  editingUser: UserItem | null = null;
  editData = { nombre: '', apellidos: '', telefono: '', requiere_cambio_password: false };

  // Role modal
  roleUser: UserItem | null = null;
  selectedRole = '';
  availableRoles = ['admin', 'editor', 'cliente', 'invitado'];

  // Highlight
  highlightedUserId = '';

  // Stats
  activeCount = signal(0);
  inactiveCount = signal(0);

  ngOnInit() {
    this.refreshUsers();
  }

  async refreshUsers() {
    this.loading = true;
    try {
      const data: any = await this.supabase.getAllUsers();
      this.users.set(data || []);
      this.updateStats();
    } catch (err) {
      console.error(err);
      alert('Error cargando usuarios');
    } finally {
      this.loading = false;
    }
  }

  private updateStats() {
    const all = this.users();
    this.activeCount.set(all.filter(u => u.activo !== false).length);
    this.inactiveCount.set(all.filter(u => u.activo === false).length);
  }

  // === CREAR USUARIO ===
  async createUser() {
    this.createError = '';

    if (!this.newUser.email || !this.newUser.nombre) {
      this.createError = 'Email y nombre son obligatorios';
      return;
    }

    try {
      const profileData = {
        id: crypto.randomUUID(),
        email: this.newUser.email,
        nombre: this.newUser.nombre,
        apellidos: this.newUser.apellidos,
        edad: this.newUser.edad,
        telefono: this.newUser.telefono,
        rol: this.newUser.rol,
        activo: true,
        profile_complete: true,
        fecha_creacion: new Date().toISOString()
      };

      await this.supabase.createUserProfile(profileData);

      // Auditoría
      const adminEmail = this.authService.user()?.email || 'admin';
      const adminId = this.authService.user()?.id || null;
      await this.auditService.logAction(adminId, adminEmail, 'ALTA_USUARIO', `Creó usuario: ${this.newUser.email}`);

      this.showCreateForm = false;
      this.newUser = { email: '', nombre: '', apellidos: '', edad: 18, telefono: '', rol: 'cliente' };
      await this.refreshUsers();
      alert('Usuario creado exitosamente');
    } catch (err: any) {
      this.createError = err.message || 'Error al crear usuario';
    }
  }

  // === EDITAR USUARIO ===
  openEditModal(user: UserItem) {
    this.editingUser = user;
    this.editData = {
      nombre: user.nombre || '',
      apellidos: user.apellidos || '',
      telefono: user.telefono || '',
      requiere_cambio_password: user.requiere_cambio_password || false
    };
  }

  closeEditModal() {
    this.editingUser = null;
  }

  async saveEdit() {
    if (!this.editingUser) return;

    try {
      await this.supabase.updateProfile(this.editingUser.id, {
        nombre: this.editData.nombre,
        apellidos: this.editData.apellidos,
        telefono: this.editData.telefono,
        requiere_cambio_password: this.editData.requiere_cambio_password
      });

      const adminEmail = this.authService.user()?.email || 'admin';
      const adminId = this.authService.user()?.id || null;
      await this.auditService.logAction(adminId, adminEmail, 'EDITAR_USUARIO', `Editó usuario: ${this.editingUser.email}`);

      this.closeEditModal();
      await this.refreshUsers();
      alert('Usuario actualizado');
    } catch (err) {
      alert('Error al editar usuario');
    }
  }

  // === CAMBIAR ROL ===
  openRoleModal(user: UserItem) {
    this.roleUser = user;
    this.selectedRole = user.rol;
  }

  closeRoleModal() {
    this.roleUser = null;
  }

  async saveRole() {
    if (!this.roleUser || !this.selectedRole) return;

    try {
      const oldRole = this.roleUser.rol;
      await this.supabase.changeUserRole(this.roleUser.id, this.selectedRole);

      const adminEmail = this.authService.user()?.email || 'admin';
      const adminId = this.authService.user()?.id || null;
      await this.auditService.logAction(adminId, adminEmail, 'CAMBIO_ROL',
        `${this.roleUser.email}: ${oldRole} → ${this.selectedRole}`);

      this.closeRoleModal();
      await this.refreshUsers();
      alert('Rol actualizado');
    } catch (err) {
      alert('Error al cambiar rol');
    }
  }

  getRoleIcon(role: string): string {
    return { admin: '👑', editor: '📝', cliente: '👤', invitado: '👁️' }[role] || '❓';
  }

  // === ACTIVAR/DESACTIVAR ===
  async toggleActive(user: UserItem) {
    const newState = !user.activo;
    const action = newState ? 'Activar' : 'Desactivar';

    if (!confirm(`¿${action} la cuenta de ${user.nombre || user.email}?`)) return;

    try {
      await this.supabase.toggleUserActive(user.id, newState);

      const adminEmail = this.authService.user()?.email || 'admin';
      const adminId = this.authService.user()?.id || null;
      await this.auditService.logAction(adminId, adminEmail,
        newState ? 'ACTIVAR_CUENTA' : 'DESACTIVAR_CUENTA',
        `${action} cuenta: ${user.email}`);

      await this.refreshUsers();
      alert(`Cuenta ${newState ? 'activada' : 'desactivada'}`);
    } catch (err) {
      alert('Error al cambiar estado');
    }
  }

  // === ELIMINAR USUARIO (lógica) ===
  async deleteUser(user: UserItem) {
    if (!confirm(`¿Eliminar el registro de "${user.nombre || user.email}"? Esta acción eliminará sus datos de la base de datos.`)) return;

    try {
      const { error } = await this.supabase.client
        .from('perfiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      const adminEmail = this.authService.user()?.email || 'admin';
      const adminId = this.authService.user()?.id || null;
      await this.auditService.logAction(adminId, adminEmail, 'BAJA_USUARIO', `Eliminó usuario: ${user.email}`);

      await this.refreshUsers();
    } catch (err) {
      alert('Error al borrar usuario');
    }
  }
}
