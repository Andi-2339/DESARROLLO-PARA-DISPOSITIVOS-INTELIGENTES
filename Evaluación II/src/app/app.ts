import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { PopupBannerComponent } from './components/popup-banner/popup-banner';
import { AuthService } from './services/auth.service';
import { SeasonalThemeService } from './services/seasonal-theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Footer, PopupBannerComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  authService = inject(AuthService);
  themeService = inject(SeasonalThemeService);
  private router = inject(Router);

  // Lógica para mostrar la UI solo si el usuario ha iniciado sesión
  showUI = computed(() => {
    return this.authService.isLoggedIn();
  });

  ngOnInit() {
    // Aplicar tema estacional al body
    this.themeService.applyTheme();
  }
}
