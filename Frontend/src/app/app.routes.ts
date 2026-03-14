import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout/layout.component';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [() => import('./features/admin/guards/admin.guard').then(m => m.adminGuard)]
  },
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
      },
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
