import { Routes } from '@angular/router';

export const CASE_STUDIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/case-studies-page/case-studies-page.component').then(m => m.CaseStudiesPageComponent),
    title: 'Casos de Éxito | Unión Pegaso'
  }
];
