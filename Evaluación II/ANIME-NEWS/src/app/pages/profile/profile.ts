import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="profile-container neon-animated-box">
        <div class="profile-header">
          <div class="avatar-placeholder">
            {{ authService.userName().charAt(0) }}
          </div>
          <h2>Panel de Usuario</h2>
          <p class="role-badge">{{ authService.userRole() }}</p>
        </div>

        <div class="profile-section">
          <h3>Información Personal</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>Nombre(s)</label>
              <input type="text" [(ngModel)]="editData.nombres" [disabled]="!editing" class="profile-input">
            </div>
            <div class="info-item">
              <label>Apellidos</label>
              <input type="text" [(ngModel)]="editData.apellidos" [disabled]="!editing" class="profile-input">
            </div>
            <div class="info-item">
              <label>Edad</label>
              <input type="number" [(ngModel)]="editData.edad" [disabled]="true" class="profile-input">
              <small *ngIf="editing" style="color: #666; font-size: 0.7em;">La edad no se puede cambiar después del registro.</small>
            </div>
            <div class="info-item">
              <label>Nombre de Avatar (Display)</label>
              <input type="text" [(ngModel)]="editData.avatarName" [disabled]="!editing" class="profile-input">
            </div>
            <div class="info-item">
              <label>Correo</label>
              <p>{{ user()?.email }}</p>
            </div>
            <div class="info-item">
              <label>Teléfono Verificado</label>
              <p class="status" [class.verified]="dbData()?.phone_verified">
                {{ dbData()?.telefono ? 'SÍ (' + dbData()?.telefono + ')' : 'NO' }}
              </p>
            </div>
          </div>

          <div class="profile-actions">
            <button *ngIf="!editing" (click)="editing = true" class="btn-edit">Editar Perfil</button>
            <button *ngIf="editing" (click)="saveProfile()" class="btn-save" [disabled]="loading">Guardar Cambios</button>
            <button *ngIf="editing" (click)="cancelEdit()" class="btn-cancel">Cancelar</button>
          </div>
        </div>

        <div class="danger-zone">
          <hr>
          <h3>Zona de Peligro</h3>
          <p>Estas acciones son irreversibles.</p>
          
          <div class="danger-actions" *ngIf="!confirmDelete">
            <button (click)="confirmDelete = true" class="btn-delete">Cerrar Sesión Segura</button>
          </div>

          <div class="delete-confirmation" *ngIf="confirmDelete">
            <p class="warning-text">¿Estás seguro de que quieres salir?</p>
            <button (click)="finalLogout()" class="btn-delete-final">CERRAR SESIÓN AHORA</button>
            <button (click)="confirmDelete = false" class="btn-cancel-danger">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: 80px 20px; color: white; display: flex; justify-content: center; }
    .profile-container { max-width: 800px; width: 100%; background: #0a0a0a; border-radius: 15px; padding: 40px; }
    .profile-header { text-align: center; margin-bottom: 40px; }
    .avatar-placeholder { width: 80px; height: 80px; background: var(--pink); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2em; margin: 0 auto 15px; box-shadow: 0 0 20px rgba(255, 0, 187, 0.4); }
    .role-badge { display: inline-block; padding: 4px 12px; background: #222; border: 1px solid var(--blue); border-radius: 20px; font-size: 0.8em; text-transform: uppercase; color: var(--blue); }
    
    .profile-section { margin-bottom: 40px; }
    h3 { color: var(--pink); margin-bottom: 20px; border-bottom: 1px solid #222; padding-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .info-item label { display: block; color: #666; font-size: 0.85em; margin-bottom: 5px; }
    .profile-input { width: 100%; background: #1a1a1a; border: 1px solid #333; color: white; padding: 10px; border-radius: 5px; }
    .profile-input:disabled { background: transparent; border-color: transparent; padding-left: 0; }
    
    .status { font-weight: bold; }
    .verified { color: #00ff88; }
    
    .profile-actions { margin-top: 30px; display: flex; gap: 10px; }
    .btn-edit, .btn-save { padding: 10px 25px; border: none; border-radius: 5px; cursor: pointer; transition: 0.3s; }
    .btn-edit { background: var(--blue); color: white; }
    .btn-save { background: #00ff88; color: black; font-weight: bold; }
    .btn-cancel { background: transparent; color: #888; border: 1px solid #444; padding: 10px 20px; border-radius: 5px; cursor: pointer; }

    .danger-zone { margin-top: 60px; opacity: 0.8; }
    .warning-text { color: #ff4444; margin: 15px 0; }
    .btn-delete { background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 8px 15px; border-radius: 5px; cursor: pointer; }
    .btn-delete:hover { background: #ff4444; color: white; }
    .btn-delete-final { background: #ff0000; color: white; border: none; padding: 12px; width: 100%; border-radius: 5px; margin-top: 15px; font-weight: bold; }
    .btn-cancel-danger { background: transparent; border: none; color: #888; margin-left: 15px; cursor: pointer; }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);
  supabase = inject(SupabaseService);
  router = inject(Router);

  user = this.authService.user;
  dbData = signal<any>(null);
  
  editing = false;
  loading = false;
  
  editData = {
    nombres: '',
    apellidos: '',
    edad: 0,
    avatarName: ''
  };
  
  confirmDelete = false;

  constructor() {
    this.loadDbData();
  }

  async loadDbData() {
    const u = this.user();
    if (u) {
      this.loading = true;
      try {
        const data = await this.supabase.getUserProfile(u.id);
        if (data) {
          this.dbData.set(data);
          this.editData = {
            nombres: data['nombre'] || '',
            apellidos: data['apellidos'] || '',
            edad: data['edad'] || 0,
            avatarName: data['avatar_name'] || ''
          };
        }
      } catch (err) {
        console.error('[Profile] Error loading data:', err);
      } finally {
        this.loading = false;
      }
    }
  }

  cancelEdit() {
    const data = this.dbData();
    if (data) {
      this.editData = {
        nombres: data['nombre'] || '',
        apellidos: data['apellidos'] || '',
        edad: data['edad'] || 0,
        avatarName: data['avatar_name'] || ''
      };
    }
    this.editing = false;
  }

  async saveProfile() {
    this.loading = true;
    try {
      const u = this.user();
      if (u) {
        // Mapeo a nombres de Supabase
        const updatedFields = {
          nombre: this.editData.nombres,
          apellidos: this.editData.apellidos,
          avatar_name: this.editData.avatarName
        };
        
        await this.supabase.updateProfile(u.id, updatedFields);
        await this.loadDbData();
        alert('Perfil actualizado con éxito');
        this.editing = false;
      }
    } catch (err) {
      console.error(err);
      alert('Error al actualizar perfil');
    } finally {
      this.loading = false;
    }
  }

  async finalLogout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
