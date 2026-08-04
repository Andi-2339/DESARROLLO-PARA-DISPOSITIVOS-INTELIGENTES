import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-mangas',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="content-wrapper">
      <main class="main-content">
        <section class="basic-info">
          <h1>Biblioteca de Mangas</h1>
          <p class="persuasive-text">Todo sobre el mundo del papel y la tinta japonesa.</p>
          
          <div class="neon-animated-box" style="padding: 30px;">
            <h3>Lanzamientos de la semana</h3>
            <p>Consulta las novedades de Shonen Jump y más.</p>
          </div>

          <section id="convenciones" style="margin-top: 50px;">
            <h2> Guía de Convenciones</h2>
            <p>Prepárate para los eventos más grandes del año.</p>
            <div class="neon-animated-box" style="padding: 20px;">
              <p>Próximo evento: Anime Expo 2026</p>
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
export class Mangas {}
