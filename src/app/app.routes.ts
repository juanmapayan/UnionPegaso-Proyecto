import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout/layout.component';
import { adminRoutes } from './admin/admin.routes';

export const routes: Routes = [
  // Admin routes (sin layout)
  ...adminRoutes,
  // Main routes (con layout)
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
      },
      {
        path: 'servicios',
        loadChildren: () => import('./features/services/services.routes').then(m => m.SERVICES_ROUTES)
      },
      {
        path: 'casos-exito',
        loadChildren: () => import('./features/case-studies/case-studies.routes').then(m => m.CASE_STUDIES_ROUTES)
      },
      {
        path: 'presupuesto',
        loadChildren: () => import('./features/budget/budget.routes').then(m => m.BUDGET_ROUTES)
      },
      {
        path: 'contacto',
        loadChildren: () => import('./features/contact/contact.routes').then(m => m.CONTACT_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
