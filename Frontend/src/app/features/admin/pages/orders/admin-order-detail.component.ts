import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface OrderItem {
    id: number;
    name_snapshot: string;
    price_snapshot: string;
    quantity: number;
}

interface Order {
    id: number;
    user_id: number;
    user_nombre: string;
    user_email: string;
    total: string;
    currency: string;
    status: string;
    created_at: string;
    customer_nombre: string;
    customer_email: string;
    customer_telefono: string;
    customer_empresa: string;
    items: OrderItem[];
    invoice?: {
        id: number;
        invoice_number: string;
    };
}

@Component({
    selector: 'app-admin-order-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    @if (order()) {
        <div class="mb-4">
            <a routerLink="/admin/orders" class="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Volver a Pedidos
            </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Info -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Order Header -->
                <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold text-white mb-1">Pedido #{{ order()!.id }}</h2>
                            <p class="text-gray-400">{{ order()!.created_at | date:'medium' }}</p>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                            <span [class]="getStatusClass(order()!.status) + ' text-sm px-3 py-1 rounded-full'">
                                {{ getStatusLabel(order()!.status) }}
                            </span>
                            @if (order()!.status === 'pending') {
                                <button (click)="updateStatus('paid')" class="text-sm text-blue-400 hover:text-blue-300">Marcar como Pagado</button>
                            }
                            @if (order()!.status === 'paid') {
                                <button (click)="updateStatus('completed')" class="text-sm text-green-400 hover:text-green-300">Marcar como Completado</button>
                            }
                        </div>
                    </div>
                </div>

                <!-- Items -->
                <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl overflow-hidden">
                    <div class="p-4 border-b border-purple-500/10">
                        <h3 class="text-lg font-bold text-white">Items del Pedido</h3>
                    </div>
                    <table class="w-full text-left text-sm text-gray-400">
                        <thead class="bg-purple-500/10 text-purple-300 uppercase font-medium">
                            <tr>
                                <th class="px-6 py-4">Descripción</th>
                                <th class="px-6 py-4 text-center">Cant.</th>
                                <th class="px-6 py-4 text-right">Precio</th>
                                <th class="px-6 py-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-purple-500/10">
                            @for (item of order()!.items; track item.id) {
                                <tr>
                                    <td class="px-6 py-4 font-medium text-white">{{ item.name_snapshot }}</td>
                                    <td class="px-6 py-4 text-center">{{ item.quantity }}</td>
                                    <td class="px-6 py-4 text-right">{{ item.price_snapshot | currency:order()!.currency }}</td>
                                    <td class="px-6 py-4 text-right">{{ (item.quantity * +item.price_snapshot) | currency:order()!.currency }}</td>
                                </tr>
                            }
                        </tbody>
                        <tfoot class="bg-purple-500/5">
                            <tr>
                                <td colspan="3" class="px-6 py-4 text-right font-bold text-white">Total</td>
                                <td class="px-6 py-4 text-right font-bold text-purple-400 text-lg">
                                    {{ order()!.total | currency:order()!.currency }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Sidebar Info -->
            <div class="space-y-6">
                <!-- Customer Info -->
                <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl p-6">
                    <h3 class="text-lg font-bold text-white mb-4">Cliente</h3>
                    <div class="space-y-3">
                        <div>
                            <p class="text-xs text-gray-500 uppercase">Nombre</p>
                            <p class="text-white">{{ order()!.customer_nombre || order()!.user_nombre }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 uppercase">Email</p>
                            <p class="text-white">{{ order()!.customer_email || order()!.user_email }}</p>
                        </div>
                        @if (order()!.customer_telefono) {
                            <div>
                                <p class="text-xs text-gray-500 uppercase">Teléfono</p>
                                <p class="text-white">{{ order()!.customer_telefono }}</p>
                            </div>
                        }
                        @if (order()!.customer_empresa) {
                            <div>
                                <p class="text-xs text-gray-500 uppercase">Empresa</p>
                                <p class="text-white">{{ order()!.customer_empresa }}</p>
                            </div>
                        }
                    </div>
                </div>

                <!-- Invoice Actions -->
                <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl p-6">
                    <h3 class="text-lg font-bold text-white mb-4">Facturación</h3>
                    
                    @if (order()!.invoice) {
                        <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                            <p class="text-green-400 font-medium flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Factura Generada
                            </p>
                            <p class="text-sm text-gray-400 mt-1">N° {{ order()!.invoice!.invoice_number }}</p>
                        </div>
                        <a [href]="getInvoiceUrl(order()!.invoice!.id)" target="_blank" class="block w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center transition-colors">
                            Descargar PDF
                        </a>
                    } @else {
                        <div class="text-center">
                            <p class="text-gray-400 text-sm mb-4">Aún no se ha generado factura para este pedido.</p>
                            <button (click)="generateInvoice()" [disabled]="generatingInvoice()" class="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50">
                                {{ generatingInvoice() ? 'Generando...' : 'Generar Factura' }}
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    } @else {
        <div class="text-center py-12 text-gray-500">Cargando detalles del pedido...</div>
    }
  `
})
export class AdminOrderDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);

    order = signal<Order | null>(null);
    generatingInvoice = signal(false);

    private apiUrl = `${environment.apiUrl}/admin/orders`;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadOrder(id);
        }
    }

    loadOrder(id: string) {
        this.http.get<Order>(`${this.apiUrl}/${id}`, { withCredentials: true }).subscribe({
            next: (data) => this.order.set(data),
            error: (err) => console.error('Error loading order', err)
        });
    }

    updateStatus(status: string) {
        if (!this.order()) return;
        if (!confirm(`¿Estás seguro de cambiar el estado a ${this.getStatusLabel(status)}?`)) return;

        this.http.patch(`${this.apiUrl}/${this.order()!.id}/status`, { status }, { withCredentials: true }).subscribe({
            next: () => {
                this.loadOrder(this.order()!.id.toString());
            },
            error: (err) => {
                console.error('Error updating status', err);
                alert('Error al actualizar estado');
            }
        });
    }

    generateInvoice() {
        if (!this.order()) return;
        this.generatingInvoice.set(true);

        this.http.post(`${environment.apiUrl}/admin/invoices`, { order_id: this.order()!.id }, { withCredentials: true }).subscribe({
            next: () => {
                this.generatingInvoice.set(false);
                this.loadOrder(this.order()!.id.toString());
            },
            error: (err) => {
                this.generatingInvoice.set(false);
                console.error('Error generating invoice', err);
                alert('Error al generar factura');
            }
        });
    }

    getInvoiceUrl(id: number) {
        return `${environment.apiUrl}/admin/invoices/${id}/pdf`;
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'paid': return 'bg-blue-500/20 text-blue-400';
            case 'completed': return 'bg-green-500/20 text-green-400';
            case 'cancelled': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
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
