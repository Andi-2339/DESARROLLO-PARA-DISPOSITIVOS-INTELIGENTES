import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="content-wrapper">
      <main class="main-content">
        <section class="basic-info">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>Noticias de Anime y Manga</h1>
          </div>
          <p class="persuasive-text">Las últimas novedades del mundo otaku, moderadas para ti.</p>
          
          <div *ngIf="loading()" class="loader-container">
            <span class="spinner-small"></span> Cargando noticias...
          </div>
          
          <!-- LISTA DINÁMICA DE POSTS -->
          <article *ngFor="let post of posts()" class="news-item neon-animated-box" [class.hidden-post]="post.is_hidden">
            <div class="news-item-content">
              <div class="news-text">
                <h2>
                  {{ post.titulo }}
                  <span *ngIf="post.is_hidden" class="badge-hidden">(Oculto)</span>
                </h2>
                <p>{{ post.contenido }}</p>
              </div>
              
              <!-- PANEL DE MODERACIÓN -->
              <div class="post-actions" *ngIf="authService.isLoggedIn()">
                <!-- Opciones para ADMIN -->
                <ng-container *ngIf="authService.isAdmin()">
                  <button (click)="toggleVisibility(post)" class="action-btn btn-warn">
                    {{ post.is_hidden ? '👁️ Mostrar' : '🚫 Ocultar' }}
                  </button>
                  <button (click)="deletePost(post.id)" class="action-btn btn-danger">
                    ❌ Eliminar
                  </button>
                </ng-container>
                
                <!-- Opciones para USUARIO NORMAL -->
                <ng-container *ngIf="!authService.isAdmin()">
                  <button (click)="reportPost(post.id)" class="action-btn btn-report">
                    ⚠️ Reportar Inapropiado
                  </button>
                </ng-container>
              </div>
            </div>
          </article>

          <section id="calendario" style="margin-top: 50px;">
            <h2>📅 Calendario de Emisiones</h2>
            <div class="neon-animated-box" style="padding: 20px;">
              <p>Lunes: Neon Nights</p>
              <p>Miércoles: Cyber Origins</p>
              <p>Viernes: Final Fantasy Echoes</p>
            </div>
          </section>
        </section>
      </main>
      
      <aside class="sidebar-root">
        <app-sidebar></app-sidebar>
      </aside>
    </div>
  `,
  styles: [`
    .content-wrapper { display: flex; gap: 20px; padding: 20px; max-width: 1200px; margin: 0 auto; color: white; }
    .main-content { flex: 1; }
    h1 { color: var(--pink); text-shadow: 0 0 10px rgba(255, 0, 187, 0.5); }
    .news-item { margin-bottom: 20px; padding: 20px; background: #111; border-radius: 10px; border-left: 4px solid var(--blue); }
    
    .hidden-post { opacity: 0.5; border-color: #666; }
    .badge-hidden { color: #ffaa00; font-size: 0.6em; vertical-align: middle; margin-left: 10px; padding: 2px 6px; border: 1px solid #ffaa00; border-radius: 4px; }
    
    .post-actions { margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end; padding-top: 10px; border-top: 1px solid #222; }
    .action-btn { padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer; font-size: 0.85em; transition: 0.3s; }
    .btn-danger { background: transparent; color: #ff4444; border: 1px solid #ff4444; }
    .btn-danger:hover { background: #ff4444; color: white; }
    .btn-warn { background: transparent; color: #ffaa00; border: 1px solid #ffaa00; }
    .btn-warn:hover { background: #ffaa00; color: black; }
    .btn-report { background: transparent; color: #888; border: 1px solid #444; }
    .btn-report:hover { color: white; border-color: #888; }
    
    .loader-container { padding: 20px; color: #888; }
  `]
})
export class Noticias implements OnInit {
  supabase = inject(SupabaseService);
  authService = inject(AuthService);
  
  posts = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadPosts();
  }

  async loadPosts() {
    this.loading.set(true);
    try {
      // Pasamos isAdmin para saber si traemos o no los ocultos
      const data = await this.supabase.getPosts(this.authService.isAdmin());
      this.posts.set(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  async deletePost(id: string) {
    if (confirm('¿Estás seguro de eliminar permanentemente esta publicación?')) {
      await this.supabase.deletePost(id);
      this.loadPosts();
    }
  }

  async toggleVisibility(post: any) {
    await this.supabase.togglePostVisibility(post.id, post.is_hidden);
    this.loadPosts();
  }

  async reportPost(id: string) {
    const motivo = prompt('¿Por qué reportas esta publicación?');
    if (motivo) {
      const userId = this.authService.user()?.id;
      if (userId) {
        await this.supabase.createReport(id, userId, motivo);
        alert('Gracias. Reporte enviado a moderación.');
      } else {
        alert('Debes iniciar sesión para reportar.');
      }
    }
  }
}
