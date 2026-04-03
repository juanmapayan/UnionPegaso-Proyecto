import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

interface Review {
    id: number;
    author_name: string;
    author_email?: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'hidden';
    created_at: string;
    user_email_registered?: string;
}

@Component({
    selector: 'app-admin-reviews-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Reseñas</h2>
        
        <div class="flex gap-2">
            <select [(ngModel)]="filterStatus" (change)="loadReviews()" class="px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobada</option>
                <option value="hidden">Oculta</option>
            </select>
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="loadReviews()" placeholder="Buscar Autor, Email..." class="px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
            <button (click)="loadReviews()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
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
                        <th class="px-6 py-4">Autor</th>
                        <th class="px-6 py-4">Rating</th>
                        <th class="px-6 py-4">Comentario</th>
                        <th class="px-6 py-4">Estado</th>
                        <th class="px-6 py-4">Fecha</th>
                        <th class="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-purple-500/10">
                    @for (review of reviews(); track review.id) {
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 font-mono text-xs text-gray-500">#{{ review.id }}</td>
                            <td class="px-6 py-4">
                                <div class="font-medium text-white">{{ review.author_name }}</div>
                                <div class="text-xs text-gray-500">{{ review.author_email || review.user_email_registered || 'Anónimo' }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex text-yellow-500 text-xs">
                                    @for (star of [1,2,3,4,5]; track star) {
                                        <span [class.text-gray-600]="star > review.rating">★</span>
                                    }
                                </div>
                            </td>
                            <td class="px-6 py-4 max-w-xs truncate" title="{{ review.comment }}">
                                {{ review.comment }}
                            </td>
                            <td class="px-6 py-4">
                                <span [class]="getStatusClass(review.status)">
                                    {{ getStatusLabel(review.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-xs whitespace-nowrap">{{ review.created_at | date:'short' }}</td>
                            <td class="px-6 py-4 text-right space-x-2">
                                @if (review.status === 'pending' || review.status === 'hidden') {
                                    <button (click)="updateStatus(review, 'approved')" class="text-green-400 hover:text-green-300 transition-colors" title="Aprobar">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                }
                                @if (review.status === 'pending' || review.status === 'approved') {
                                    <button (click)="updateStatus(review, 'hidden')" class="text-yellow-400 hover:text-yellow-300 transition-colors" title="Ocultar">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    </button>
                                }
                                <a [routerLink]="['/admin/reviews', review.id]" class="text-purple-400 hover:text-purple-300 transition-colors inline-block ml-2" title="Ver Detalle">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </a>
                            </td>
                        </tr>
                    } @empty {
                        <tr>
                            <td colspan="7" class="px-6 py-8 text-center text-gray-500">No hay reseñas registradas.</td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
      </div>
    </div>
  `
})
export class AdminReviewsListComponent implements OnInit {
    http = inject(HttpClient);

    reviews = signal<Review[]>([]);
    filterStatus = signal('');
    searchQuery = signal('');
    loading = signal(false);

    private apiUrl = `${environment.apiUrl}/admin/reviews`;

    ngOnInit() {
        this.loadReviews();
    }

    loadReviews() {
        this.loading.set(true);
        const params: any = {};
        if (this.filterStatus()) params.status = this.filterStatus();
        if (this.searchQuery()) params.q = this.searchQuery();

        this.http.get<Review[]>(this.apiUrl, { params, withCredentials: true }).subscribe({
            next: (data) => {
                this.reviews.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading reviews', err);
                this.loading.set(false);
            }
        });
    }

    updateStatus(review: Review, status: 'approved' | 'hidden') {
        const action = status === 'approved' ? 'Aprobar' : 'Ocultar';
        if (!confirm(`¿${action} esta reseña?`)) return;

        this.http.patch(`${this.apiUrl}/${review.id}/status`, { status }, { withCredentials: true }).subscribe({
            next: () => {
                this.loadReviews(); // Recargar para actualizar la lista
            },
            error: (err) => {
                console.error('Error updating status', err);
                alert('Error al actualizar estado');
            }
        });
    }

    getStatusClass(status: string): string {
        const base = 'px-2 py-1 rounded-full text-xs ';
        switch (status) {
            case 'pending': return base + 'bg-yellow-500/20 text-yellow-400';
            case 'approved': return base + 'bg-green-500/20 text-green-400';
            case 'hidden': return base + 'bg-red-500/20 text-red-400';
            default: return base + 'bg-gray-500/20 text-gray-400';
        }
    }

    getStatusLabel(status: string): string {
        const labels: { [key: string]: string } = {
            'pending': 'Pendiente',
            'approved': 'Aprobada',
            'hidden': 'Oculta'
        };
        return labels[status] || status;
    }
}
