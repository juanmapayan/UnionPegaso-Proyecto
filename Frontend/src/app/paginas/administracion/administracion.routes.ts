import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/panel/admin-dashboard.component';
import { AdminServicesListComponent } from './pages/servicios/admin-services-list.component';
import { AdminCasesListComponent } from './pages/casos/admin-cases-list.component';

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