import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

interface Order {
    id: number;
    user_id: number;
    user_nombre: string;
    user_email: string;
    total: string;
    currency: string;
    status: string;
    created_at: string;
    items_count?: number; // Opcional, quizás lo calculemos u obtengamos del backend si es necesario, pero para el listado puede no ser estrictamente necesario a menos que hagamos un join
}

@Component({
    selector: 'app-admin-orders-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Pedidos</h2>
        
        <div class="flex gap-2">
            <select [(ngModel)]="filterStatus" (change)="loadOrders()" class="px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
            </select>
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="loadOrders()" placeholder="Buscar ID, Cliente..." class="px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
            <button (click)="loadOrders()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                Buscar
            </button>
        </div>
      </div>

      <!-- List -->
      <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-400">
                <thead class="bg-purple-500/10 text-purple-300 uppercase font-medium">
                    <tr>
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">Cliente</th>
                        <th class="px-6 py-4">Fecha</th>
                        <th class="px-6 py-4">Total</th>
                        <th class="px-6 py-4">Estado</th>
                        <th class="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-purple-500/10">
                    @for (order of orders(); track order.id) {
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 font-mono text-xs">#{{ order.id }}</td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-white">{{ order.user_nombre }}</div>
                                <div class="text-xs text-gray-500">{{ order.user_email }}</div>
                            </td>
                            <td class="px-6 py-4">{{ order.created_at | date:'short' }}</td>
                            <td class="px-6 py-4 font-medium text-white">{{ order.total | currency:order.currency }}</td>
                            <td class="px-6 py-4">
                                <span [class]="getStatusClass(order.status)">
                                    {{ getStatusLabel(order.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a [routerLink]="['/admin/orders', order.id]" class="text-purple-400 hover:text-purple-300 transition-colors">Ver Detalle</a>
                            </td>
                        </tr>
                    } @empty {
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-gray-500">No hay pedidos registrados.</td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
      </div>
    </div>
  `
})
export class AdminOrdersListComponent implements OnInit {
    http = inject(HttpClient);

    orders = signal<Order[]>([]);
    filterStatus = signal('');
    searchQuery = signal('');
    loading = signal(false);

    private apiUrl = `${environment.apiUrl}/admin/orders`;

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading.set(true);
        const params: any = {};
        if (this.filterStatus()) params.status = this.filterStatus();
        if (this.searchQuery()) params.q = this.searchQuery();

        this.http.get<Order[]>(this.apiUrl, { params, withCredentials: true }).subscribe({
            next: (data) => {
                this.orders.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading orders', err);
                this.loading.set(false);
            }
        });
    }

    getStatusClass(status: string): string {
        const base = 'px-2 py-1 rounded-full text-xs ';
        switch (status) {
            case 'pending': return base + 'bg-yellow-500/20 text-yellow-400';
            case 'paid': return base + 'bg-blue-500/20 text-blue-400';
            case 'completed': return base + 'bg-green-500/20 text-green-400';
            case 'cancelled': return base + 'bg-red-500/20 text-red-400';
            default: return base + 'bg-gray-500/20 text-gray-400';
        }
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'completed': 'Completado',
            'cancelled': 'Cancelado'
        };
        return labels[status] || status;
    }
}
