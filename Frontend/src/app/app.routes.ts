import { Routes } from '@angular/router';
import { LayoutComponent } from './nucleo/layout/layout/layout.component';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./paginas/administracion/administracion.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [() => import('./paginas/administracion/guards/administracion.guard').then(m => m.adminGuard)]
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./paginas/inicio/inicio.routes').then(m => m.HOME_ROUTES)
      },
      {
        path: 'servicios',
        loadChildren: () => import('./paginas/servicios/servicios.routes').then(m => m.SERVICES_ROUTES)
      },
      {
        path: 'casos-exito',
        loadChildren: () => import('./paginas/casos-exito/casos-exito.routes').then(m => m.CASE_STUDIES_ROUTES)
      },
      {
        path: 'presupuesto',
        loadChildren: () => import('./paginas/presupuesto/presupuesto.routes').then(m => m.BUDGET_ROUTES)
      },
      {
        path: 'contacto',
        loadChildren: () => import('./paginas/contacto/contacto.routes').then(m => m.CONTACT_ROUTES)
      },
      {
        path: '',
        loadChildren: () => import('./paginas/acceso/acceso.routes').then(m => m.AUTH_ROUTES)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./paginas/perfil/perfil').then(m => m.Perfil)
      },
      {
        path: 'mis-servicios',
        loadComponent: () => import('./paginas/mis-servicios/mis-servicios').then(m => m.MisServicios)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
