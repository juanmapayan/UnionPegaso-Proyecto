import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { AdminServicesListComponent } from './pages/services/admin-services-list.component';
import { AdminCasesListComponent } from './pages/cases/admin-cases-list.component';
import { AdminOrdersListComponent } from './pages/orders/admin-orders-list.component';
import { AdminOrderDetailComponent } from './pages/orders/admin-order-detail.component';
import { AdminReviewsListComponent } from './pages/reviews/admin-reviews-list.component';
import { AdminReviewDetailComponent } from './pages/reviews/admin-review-detail.component';
import { AdminInvoicesListComponent } from './pages/invoices/admin-invoices-list.component';

/**
 * ACTIVE ADMIN ROUTES
 *
 * This is the primary admin area used by the `/admin` entry in `app.routes.ts`.
 * New admin-related work should be added here, not under `app/admin`.
 */
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
            { path: 'reviews', component: AdminReviewsListComponent },
            { path: 'reviews/:id', component: AdminReviewDetailComponent }
        ]
    }
];
