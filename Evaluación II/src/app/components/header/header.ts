import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SeasonalThemeService } from '../../services/seasonal-theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.html'
})
export class Header {

  authService = inject(AuthService);
  themeService = inject(SeasonalThemeService);
  router = inject(Router);
  searchQuery = '';

  // Dropdown hover state
  activeDropdown = signal<string | null>(null);

  login() {
    this.authService.loginWithGoogle()
      .then(() => {
        this.router.navigate(['/home']);
      });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/']);
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Buscar:', this.searchQuery);
    }
  }

  openDropdown(name: string) {
    this.activeDropdown.set(name);
  }

  closeDropdown() {
    this.activeDropdown.set(null);
  }
}