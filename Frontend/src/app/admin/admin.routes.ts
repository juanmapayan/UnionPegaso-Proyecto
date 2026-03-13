import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

/**
 * LEGACY ADMIN ROUTES
 *
 * These routes belong to the old admin implementation under `app/admin`.
 * They are **not** referenced from the root `app.routes.ts`, where the
 * active admin area is `features/admin` (loaded via `ADMIN_ROUTES`).
 *
 * Kept for reference only. Do not add new behavior here; use
 * `features/admin` for the current admin panel.
 */
export const adminRoutes: Routes = [
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
      },
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        children: [
          {
            path: 'services',
            loadComponent: () => import('./components/services-editor/services-editor.component').then(m => m.ServicesEditorComponent)
          },
          {
            path: 'portfolio',
            loadComponent: () => import('./components/portfolio-editor/portfolio-editor.component').then(m => m.PortfolioEditorComponent)
          },
          {
            path: 'case-studies',
            loadComponent: () => import('./components/case-studies-editor/case-studies-editor.component').then(m => m.CaseStudiesEditorComponent)
          }
        ]
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  }
];
