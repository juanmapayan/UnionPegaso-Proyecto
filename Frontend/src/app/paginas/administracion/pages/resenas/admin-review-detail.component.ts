import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
    related_type?: string;
    related_id?: number;
}

@Component({
    selector: 'app-admin-review-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    @if (review()) {
        <div class="mb-4">
            <a routerLink="/administracion/reviews" class="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Volver a Reseñas
            </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold text-xl">
                                {{ review()!.author_name.charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-white">{{ review()!.author_name }}</h2>
                                <p class="text-sm text-gray-400">{{ review()!.created_at | date:'medium' }}</p>
                            </div>
                        </div>
                        <span [class]="getStatusClass(review()!.status) + ' px-3 py-1 rounded-full text-sm'">
                            {{ getStatusLabel(review()!.status) }}
                        </span>
                    </div>

                    <div class="mb-6">
                        <div class="flex text-yellow-500 text-lg mb-2">
                            @for (star of [1,2,3,4,5]; track star) {
                                <span [class.text-gray-600]="star > review()!.rating">★</span>
                            }
                        </div>
                        <p class="text-gray-300 text-lg leading-relaxed">{{ review()!.comment }}</p>
                    </div>

                    <div class="flex gap-3 pt-6 border-t border-purple-500/10">
                        @if (review()!.status !== 'approved') {
                            <button (click)="updateStatus('approved')" class="px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Aprobar Reseña
                            </button>
                        }
                        @if (review()!.status !== 'hidden') {
                            <button (click)="updateStatus('hidden')" class="px-4 py-2 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 rounded-lg transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                                Ocultar Reseña
                            </button>
                        }
                        <button (click)="deleteReview()" class="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors flex items-center gap-2 ml-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Sidebar Info -->
            <div class="space-y-6">
                <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl p-6">
                    <h3 class="text-lg font-bold text-white mb-4">Detalles del Autor</h3>
                    <div class="space-y-3">
                        <div>
                            <p class="text-xs text-gray-500 uppercase">Nombre</p>
                            <p class="text-white">{{ review()!.author_name }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 uppercase">Email (Formulario)</p>
                            <p class="text-white">{{ review()!.author_email || 'No proporcionado' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 uppercase">Email (Usuario Registrado)</p>
                            <p class="text-white">{{ review()!.user_email_registered || 'No asociado' }}</p>
                        </div>
                    </div>
                </div>

                @if (review()!.related_type && review()!.related_type !== 'general') {
                    <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl p-6">
                        <h3 class="text-lg font-bold text-white mb-4">Relacionado con</h3>
                        <p class="text-gray-400 capitalize">{{ review()!.related_type }}: #{{ review()!.related_id }}</p>
                    </div>
                }
            </div>
        </div>
    } @else {
        <div class="text-center py-12 text-gray-500">Cargando reseña...</div>
    }
  `
})
export class AdminReviewDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private http = inject(HttpClient);

    review = signal<Review | null>(null);
    private apiUrl = `${environment.apiUrl}/administracion/reviews`;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadReview(id);
        }
    }

    loadReview(id: string) {
        this.http.get<Review>(`${this.apiUrl}/${id}`, { withCredentials: true }).subscribe({
            next: (data) => this.review.set(data),
            error: (err) => console.error('Error loading review', err)
        });
    }

    updateStatus(status: 'approved' | 'hidden') {
        if (!this.review()) return;
        const action = status === 'approved' ? 'Aprobar' : 'Ocultar';
        if (!confirm(`¿${action} esta reseña?`)) return;

        this.http.patch(`${this.apiUrl}/${this.review()!.id}/status`, { status }, { withCredentials: true }).subscribe({
            next: () => {
                this.loadReview(this.review()!.id.toString());
            },
            error: (err) => {
                console.error('Error updating status', err);
                alert('Error al actualizar estado');
            }
        });
    }

    deleteReview() {
        if (!this.review()) return;
        if (!confirm('¿ATENCIÓN: Estás seguro de eliminar PERMANENTEMENTE esta reseña? Esta acción no se puede deshacer.')) return;

        this.http.delete(`${this.apiUrl}/${this.review()!.id}`, { withCredentials: true }).subscribe({
            next: () => {
                this.router.navigate(['/administracion/reviews']);
            },
            error: (err) => {
                console.error('Error deleting review', err);
                alert('Error al eliminar reseña');
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'approved': return 'bg-green-500/20 text-green-400';
            case 'hidden': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
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
