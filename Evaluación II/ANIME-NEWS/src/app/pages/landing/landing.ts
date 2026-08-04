import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-gateway">
      <div class="neon-bg-glow"></div>
      
      <div class="gateway-content">
        <img src="assets/logo.png" class="gateway-logo" alt="Anime News">
        <h1 class="premium-title">BIENVENIDO A ANIME NEWS</h1>
        <p class="premium-subtitle">Tu portal definitivo al universo del Anime y Manga.</p>
        
        <div class="gateway-actions">
          <button class="btn-neon-primary" (click)="goToLogin()">INICIAR SESIÓN</button>
          <button class="btn-neon-outline" (click)="goToSignup()">CREAR CUENTA</button>
        </div>
      </div>
    </div>
  `
})
export class LandingComponent {

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/signup'], { queryParams: { mode: 'login' } });
  }

  goToSignup() {
    this.router.navigate(['/signup'], { queryParams: { mode: 'signup' } });
  }
}