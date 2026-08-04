import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  console.warn('[Guard] Acceso ADMIN denegado.');
  alert('No tienes permisos de Administrador.');
  router.navigate(['/home']);
  return false;
};