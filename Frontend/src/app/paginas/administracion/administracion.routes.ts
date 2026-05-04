import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/panel/admin-dashboard.component';
import { AdminServicesListComponent } from './pages/servicios/admin-services-list.component';
import { AdminCasesListComponent } from './pages/casos/admin-cases-list.component';
import { AdminOrdersListComponent } from './pages/orders/admin-orders-list.component';
import { AdminOrderDetailComponent } from './pages/orders/admin-order-detail.component';
import { AdminInvoicesListComponent } from './pages/invoices/admin-invoices-list.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'services', component: AdminServicesListComponent },
            { path: 'cases', component: AdminCasesListComponent },
            { path: 'orders', component: AdminOrdersListComponent },
            { path: 'orders/:id', component: AdminOrderDetailComponent },
            { path: 'invoices', component: AdminInvoicesListComponent },
        ]
    }
];