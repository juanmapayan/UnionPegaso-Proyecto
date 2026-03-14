import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { AdminServicesListComponent } from './pages/services/admin-services-list.component';
import { AdminCasesListComponent } from './pages/cases/admin-cases-list.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'services', component: AdminServicesListComponent },
            { path: 'cases', component: AdminCasesListComponent }
        ]
    }
];