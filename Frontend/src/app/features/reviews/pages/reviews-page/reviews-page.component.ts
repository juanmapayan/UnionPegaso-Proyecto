import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';

interface Review {
    id: number;
    author_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

@Component({
    selector: 'app-reviews-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                Lo que dicen nuestros clientes
            </h1>
            <p class="text-gray-400 text-lg">Tu opinión es muy importante para nosotros.</p>
        </div>

        <!-- Form Section -->
        <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl p-6 mb-12 backdrop-blur-sm">
            <h2 class="text-2xl font-bold text-white mb-6">Deja tu Reseña</h2>
            
            <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()" class="space-y-6">
                @if (authService.currentUser()) {
                    <div class="bg-purple-600/10 border border-purple-500/20 rounded-lg p-4 mb-4">
                        <p class="text-purple-300">Reseñando como <span class="font-bold text-white">{{ authService.currentUser()?.nombre }}</span></p>
                    </div>
                } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1">Nombre *</label>
                            <input type="text" formControlName="author_name" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500" placeholder="Tu nombre">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1">Email <span class="text-gray-600 text-xs">(Opcional, no será público)</span></label>
                            <input type="email" formControlName="author_email" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500" placeholder="tu@email.com">
                        </div>
                    </div>
                }

                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">Valoración *</label>
                    <div class="flex gap-2">
                        @for (star of [1,2,3,4,5]; track star) {
                            <button type="button" (click)="setRating(star)" class="text-2xl focus:outline-none transition-transform hover:scale-110" [class.text-yellow-500]="star <= (reviewForm.get('rating')?.value || 0)" [class.text-gray-600]="star > (reviewForm.get('rating')?.value || 0)">
                                ★
                            </button>
                        }
                    </div>
                    @if (reviewForm.get('rating')?.touched && reviewForm.get('rating')?.value === 0) {
                        <p class="text-red-400 text-xs mt-1">Selecciona una valoración.</p>
                    }
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">Comentario *</label>
                    <textarea formControlName="comment" rows="4" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500" placeholder="Cuéntanos tu experiencia..."></textarea>
                </div>

                <button type="submit" [disabled]="reviewForm.invalid || submitting()" class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 shadow-lg shadow-purple-900/20">
                    {{ submitting() ? 'Enviando...' : 'Publicar Reseña' }}
                </button>

                @if (successMessage()) {
                    <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center animate-fade-in">
                        {{ successMessage() }}
                    </div>
                }
                @if (errorMessage()) {
                    <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center animate-fade-in">
                        {{ errorMessage() }}
                    </div>
                }
            </form>
        </div>

        <!-- Reviews List -->
        <div class="space-y-6">
            <h2 class="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-purple-500">Últimas Reseñas</h2>
            
            @if (loading()) {
                <div class="text-center py-12">
                    <div class="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    @for (review of reviews(); track review.id) {
                        <div class="bg-[rgba(20,12,30,0.3)] border border-purple-500/10 rounded-xl p-6 hover:border-purple-500/30 transition-colors">
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-300 font-bold border border-purple-500/10">
                                        {{ review.author_name.charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-white">{{ review.author_name }}</h3>
                                        <p class="text-xs text-gray-500">{{ review.created_at | date:'longDate' }}</p>
                                    </div>
                                </div>
                                <div class="flex text-yellow-500 text-sm">
                                    @for (star of [1,2,3,4,5]; track star) {
                                        <span [class.text-gray-700]="star > review.rating">★</span>
                                    }
                                </div>
                            </div>
                            <p class="text-gray-300 italic">"{{ review.comment }}"</p>
                        </div>
                    } @empty {
                        <div class="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/5">
                            <p class="text-gray-400">Aún no hay reseñas públicas. ¡Sé el primero!</p>
                        </div>
                    }
                </div>
            }
        </div>

      </div>
    </div>
  `
})
export class ReviewsPageComponent implements OnInit {
    http = inject(HttpClient);
    fb = inject(FormBuilder);
    authService = inject(AuthService);

    reviews = signal<Review[]>([]);
    loading = signal(false);
    submitting = signal(false);
    successMessage = signal('');
    errorMessage = signal('');

    reviewForm = this.fb.group({
        author_name: ['', Validators.required],
        author_email: ['', Validators.email],
        rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
        comment: ['', [Validators.required, Validators.minLength(10)]]
    });

    private apiUrl = `${environment.apiUrl}/reviews`;

    ngOnInit() {
        this.loadReviews();

        // Auto-fill name if logged in
        if (this.authService.currentUser()) {
            this.reviewForm.patchValue({
                author_name: this.authService.currentUser()!.nombre,
                author_email: this.authService.currentUser()!.email
            });
            this.reviewForm.get('author_name')?.disable(); // Optional: prevent changing name if logged in
            // But API expects author_name in body, so we need to enable it before submit or handle in onSubmit
            // For simplicity let's keep it enabled or handle it. 
            // Better: keep it enabled so user can customize display name if they want, or disable and use rawValue.
            this.reviewForm.get('author_name')?.enable();
        }
    }

    loadReviews() {
        this.loading.set(true);
        this.http.get<Review[]>(this.apiUrl).subscribe({
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

    setRating(rating: number) {
        this.reviewForm.patchValue({ rating });
    }

    onSubmit() {
        if (this.reviewForm.invalid) return;

        this.submitting.set(true);
        this.successMessage.set('');
        this.errorMessage.set('');

        const formData = this.reviewForm.value;
        // If user is logged in, we might want to prioritize their current name if the field was disabled, 
        // but since we left it enabled, value is there.

        this.http.post(this.apiUrl, formData, { withCredentials: true }).subscribe({
            next: () => {
                this.submitting.set(false);
                this.successMessage.set('¡Gracias por tu reseña! Será visible después de ser moderada.');
                this.reviewForm.reset({ rating: 0 });
                // If logged in, restore name
                if (this.authService.currentUser()) {
                    this.reviewForm.patchValue({
                        author_name: this.authService.currentUser()!.nombre,
                        author_email: this.authService.currentUser()!.email
                    });
                }
            },
            error: (err) => {
                this.submitting.set(false);
                this.errorMessage.set('Error al enviar la reseña. Por favor intenta de nuevo.');
                console.error('Error submitting review', err);
            }
        });
    }
}
