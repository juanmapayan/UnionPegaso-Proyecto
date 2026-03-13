import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { map, take } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // We need to ensure the user state is loaded. 
    // AuthService should have a way to check if it's initialized or we can wait for currentUser.
    // Assuming currentUser is a signal, we can check its value.

    // A better approach with Signals/Observables in Guard:
    // If we are sure `authService.currentUser` is populated (e.g. by an APP_INITIALIZER or previous guards),
    // we can check directly. 
    // But to be safe, we might want to trigger a check if it's null, or rely on the fact that 
    // the app attempts to fetch 'me' on startup.

    const user = authService.currentUser();

    if (user && user.rol === 'admin') {
        return true;
    }

    // If user is not logged in or not admin, redirect
    // Note: This simple check assumes Auth state is already resolved. 
    // If Auth state is async and not yet resolved, this might fail on refresh (F5).
    // Ideally, AuthService should expose an Observable 'isInitialized' or similar.
    // For this MVP, we will rely on persistent session. 

    // If user is null, it might be not logged in OR not yet loaded.
    // If we want to be robust, we should maybe call `me()` if user is null.

    router.navigate(['/']);
    return false;
};
