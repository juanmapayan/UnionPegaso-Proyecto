import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Invoice {
    id: number;
    invoice_number: string;
    total: string;
    currency: string;
    customer_nombre: string;
    customer_email: string;
    created_at: string;
}

@Component({
    selector: 'app-admin-invoices-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Facturas</h2>
      </div>

      <!-- List -->
      <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-400">
                <thead class="bg-purple-500/10 text-purple-300 uppercase font-medium">
                    <tr>
                        <th class="px-6 py-4">N° Factura</th>
                        <th class="px-6 py-4">Cliente</th>
                        <th class="px-6 py-4">Fecha</th>
                        <th class="px-6 py-4">Total</th>
                        <th class="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-purple-500/10">
                    @for (invoice of invoices(); track invoice.id) {
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 font-mono text-xs">{{ invoice.invoice_number }}</td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-white">{{ invoice.customer_nombre }}</div>
                                <div class="text-xs text-gray-500">{{ invoice.customer_email }}</div>
                            </td>
                            <td class="px-6 py-4">{{ invoice.created_at | date:'short' }}</td>
                            <td class="px-6 py-4 font-medium text-white">{{ invoice.total | currency:invoice.currency }}</td>
                            <td class="px-6 py-4 text-right">
                                <a [href]="getInvoiceUrl(invoice.id)" target="_blank" class="text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-end gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    PDF
                                </a>
                            </td>
                        </tr>
                    } @empty {
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500">No hay facturas generadas.</td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
      </div>
    </div>
  `
})
export class AdminInvoicesListComponent implements OnInit {
    http = inject(HttpClient);
    invoices = signal<Invoice[]>([]);
    loading = signal(false);

    private apiUrl = `${environment.apiUrl}/admin/invoices`;

    ngOnInit() {
        this.loadInvoices();
    }

    loadInvoices() {
        this.loading.set(true);
        this.http.get<Invoice[]>(this.apiUrl, { withCredentials: true }).subscribe({
            next: (data) => {
                this.invoices.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading invoices', err);
                this.loading.set(false);
            }
        });
    }

    getInvoiceUrl(id: number) {
        return `${this.apiUrl}/${id}/pdf`;
    }
}
