import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="content-wrapper">
      <main class="main-content">
        <section class="basic-info">
          <h1>Catálogo de Anime</h1>
          <p class="persuasive-text">Explora nuestra base de datos completa de series y películas.</p>
          
          <div class="neon-animated-box" style="padding: 40px; text-align: center;">
            <p>Directorio de Series (Próximamente...)</p>
          </div>

          <section id="autores" style="margin-top: 50px;">
            <h2>Directorio de Autores</h2>
            <p>Conoce a las mentes maestras detrás de tus historias favoritas.</p>
            <div class="neon-animated-box" style="padding: 20px;">
              <p>Eiichiro Oda (One Piece)</p>
              <p>Hajime Isayama (Attack on Titan)</p>
            </div>
          </section>
        </section>
      </main>
      
      <aside class="sidebar-root">
        <app-sidebar></app-sidebar>
      </aside>
    </div>
  `
})
export class Catalogo { }
