import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-temporadas',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="content-wrapper">
      <main class="main-content">
        <section class="basic-info">
          <h1>Guía de Temporadas</h1>
          <p class="persuasive-text">Tu hoja de ruta para cada estreno estacional.</p>
          
          <div class="neon-animated-box" style="padding: 30px;">
            <h3>Invierno 2026</h3>
            <p>Descubre qué series terminan y cuáles comienzan.</p>
          </div>

          <section id="foro" style="margin-top: 50px;">
            <h2>💬 Foro de la Comunidad</h2>
            <p>Únete a la discusión con otros fans.</p>
            <div class="neon-animated-box" style="padding: 20px;">
              <p>Tema destacado: ¿Cuál fue el mejor anime de 2025?</p>
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
export class Temporadas {}
