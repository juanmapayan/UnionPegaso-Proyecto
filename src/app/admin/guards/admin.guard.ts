import { Injectable } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

/**
 * Guard que protege rutas admin
 * Solo permite acceso si:
 * 1. Usuario está autenticado
 * 2. Usuario es admin (email === unionpegaso@gmail.com)
 */
export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Redirigir a login si no está autenticado o no es admin
  router.navigate(['/admin/login']);
  return false;
};
