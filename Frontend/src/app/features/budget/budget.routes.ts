import { Routes } from '@angular/router';

export const BUDGET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/budget-page/budget-page.component').then(m => m.BudgetPageComponent),
    title: 'Solicitar Presupuesto | Unión Pegaso'
  }
];
