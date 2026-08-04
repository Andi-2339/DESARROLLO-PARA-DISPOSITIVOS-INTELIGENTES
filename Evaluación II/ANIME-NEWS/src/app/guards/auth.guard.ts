import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Si no está logueado en Firebase -> Al Landing
  if (!authService.user()) {
    router.navigate(['/']);
    return false;
  }

  // 2. Si está logueado pero su perfil está incompleto -> Al Signup
  if (!authService.isProfileComplete()) {
    // Evitar redirección infinita si ya está en path de registro
    return true; 
  }

  return true;
};
