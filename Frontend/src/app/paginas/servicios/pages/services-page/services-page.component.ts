import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ServicesService } from '../../servicios.service';
import { CartService } from '../../../../nucleo/servicios/cart.service';
import { AuthService } from '../../../../nucleo/servicios/acceso.service';
import { Service } from '../../models/service.model';
import { environment } from '../../../../../environments/environment';

interface Review {
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-black pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(88,28,135,0.15),transparent_50%)]"></div>

      <div class="max-w-7xl mx-auto relative z-10">
        <!-- Header -->
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Nuestros Servicios
          </h1>
          <p class="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Soluciones digitales de alto impacto diseñadas para escalar tu negocio.
          </p>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="flex flex-col justify-center items-center h-64 space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span class="text-purple-400 text-sm font-medium animate-pulse">Cargando servicios...</span>
          </div>
        }

        <!-- Error -->
        @if (error()) {
          <div class="bg-red-900/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl max-w-2xl mx-auto mb-8">
            {{ error() }}
          </div>
        }

        <!-- Grid -->
        @if (!loading() && !error()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (service of services(); track service.id) {
              <div class="group relative bg-[rgba(20,12,30,0.55)] backdrop-blur-md border border-purple-500/20 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">

                <!-- Card Body -->
                <div class="p-8 flex-grow relative z-10">
                  <div class="flex justify-between items-start mb-6">
                    <h2 class="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1" [title]="service.title">
                      {{ service.title }}
                    </h2>
                    <span class="bg-purple-900/40 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full border border-purple-500/30 ml-4 whitespace-nowrap">
                      #{{ service.id }}
                    </span>
                  </div>
                  <p class="text-slate-300/80 leading-relaxed text-sm mb-6 line-clamp-4 font-light">{{ service.description }}</p>
                </div>

                <!-- Card Footer -->
                <div class="px-8 py-5 bg-black/20 border-t border-purple-500/10 flex items-center justify-between relative z-10">
                  <div class="flex flex-col">
                    <span class="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Precio</span>
                    <span class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                      {{ service.price }}€
                    </span>
                  </div>
                  <button
                    (click)="addToCart(service)"
                    [disabled]="isAdded(service.id)"
                    class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg shadow-purple-500/20 transform transition-all duration-300 active:scale-95 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed min-w-[100px] flex justify-center items-center">
                    @if (isAdded(service.id)) {
                      <svg class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                      Añadido
                    } @else {
                      Añadir
                    }
                  </button>
                </div>

                <!-- Toggle reseñas -->
                <div class="px-8 py-3 bg-black/30 border-t border-purple-500/10 relative z-10">
                  <button
                    (click)="toggleReviews(service.id)"
                    class="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors w-full">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                    </svg>
                    @if (expandedId() === service.id) {
                      Ocultar reseñas
                    } @else {
                      Ver reseñas
                      @if (reviewsMap()[service.id] !== undefined) {
                        ({{ reviewsMap()[service.id].length }})
                      }
                    }
                  </button>
                </div>

                <!-- Sección de reseñas -->
                @if (expandedId() === service.id) {
                  <div class="px-6 pb-5 pt-3 bg-black/40 border-t border-purple-500/10 relative z-10">
                    @if (loadingReviewsId() === service.id) {
                      <p class="text-xs text-gray-500 text-center py-3">Cargando reseñas...</p>
                    } @else if (reviewsMap()[service.id]?.length === 0) {
                      <p class="text-xs text-gray-500 text-center py-3">Todavía no hay reseñas.</p>
                    } @else {
                      <div class="space-y-3 max-h-48 overflow-y-auto pr-1 mb-3">
                        @for (r of reviewsMap()[service.id]; track r.created_at) {
                          <div class="bg-white/5 rounded-xl px-4 py-3">
                            <div class="flex items-center justify-between mb-1">
                              <span class="text-xs font-semibold text-white">{{ r.author_name }}</span>
                              <div class="flex gap-0.5">
                                @for (s of stars(r.rating); track $index) {
                                  <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                }
                              </div>
                            </div>
                            <p class="text-xs text-gray-400 leading-relaxed">{{ r.comment }}</p>
                          </div>
                        }
                      </div>
                    }

                    @if (hasPurchased(service.id)) {
                      <button
                        (click)="openReviewModal(service.id)"
                        class="w-full text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/60 rounded-lg py-2 transition-colors">
                        + Escribir reseña
                      </button>
                    }
                  </div>
                }

                <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            }
          </div>
        }

        <!-- Empty -->
        @if (!loading() && !error() && services().length === 0) {
          <div class="text-center py-24 bg-[rgba(20,12,30,0.3)] rounded-3xl border border-purple-500/10">
            <p class="text-xl text-slate-400 font-medium">No hay servicios disponibles por el momento.</p>
          </div>
        }
      </div>
    </div>

    <!-- Modal reseña -->
    @if (reviewModalId() !== null) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="bg-[#1a1025] border border-purple-500/20 rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-white">Escribir Reseña</h3>
            <button (click)="closeReviewModal()" class="text-gray-500 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <p class="text-sm text-gray-400 mb-3">¿Cómo calificarías tu experiencia?</p>

          <div class="flex gap-1.5 mb-4">
            @for (i of [1,2,3,4,5]; track i) {
              <button (click)="setRating(i)">
                <svg class="w-8 h-8 transition-colors" [class]="i <= reviewRating() ? 'text-yellow-400' : 'text-gray-600'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </button>
            }
          </div>

          <label class="block text-sm font-medium text-gray-400 mb-2">Cuéntanos tu opinión</label>
          <textarea
            [ngModel]="reviewComment()"
            (ngModelChange)="reviewComment.set($event)"
            rows="4"
            placeholder="Tu experiencia con este servicio..."
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none">
          </textarea>

          @if (reviewMessage()) {
            <p class="mt-2 text-xs" [class]="reviewMessage()!.isError ? 'text-red-400' : 'text-green-400'">
              {{ reviewMessage()!.text }}
            </p>
          }

          <div class="flex gap-3 mt-5">
            <button (click)="closeReviewModal()" class="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white transition-colors">Cancelar</button>
            <button
              (click)="submitReview()"
              [disabled]="submittingReview() || !reviewComment().trim()"
              class="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-sm text-white font-semibold transition-colors disabled:opacity-50">
              {{ submittingReview() ? 'Enviando...' : 'Enviar Reseña' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class ServicesPageComponent implements OnInit {
  private servicesService = inject(ServicesService);
  private cartService = inject(CartService);
  private http = inject(HttpClient);
  readonly authService = inject(AuthService);

  services = signal<Service[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  addedStates = signal<Map<number, boolean>>(new Map());
  purchasedServiceIds = signal<Set<number>>(new Set());

  reviewsMap = signal<Record<number, Review[]>>({});
  expandedId = signal<number | null>(null);
  loadingReviewsId = signal<number | null>(null);

  reviewModalId = signal<number | null>(null);
  reviewRating = signal(5);
  reviewComment = signal('');
  submittingReview = signal(false);
  reviewMessage = signal<{ text: string; isError: boolean } | null>(null);

  ngOnInit() {
    this.servicesService.getServices().subscribe({
      next: (data) => { this.services.set(data); this.loading.set(false); },
      error: () => { this.error.set('No se pudieron cargar los servicios.'); this.loading.set(false); }
    });

    if (this.authService.isAuthenticated()) {
      this.authService.getMyServices().subscribe({
        next: (data: any[]) => {
          this.purchasedServiceIds.set(new Set(data.map((s: any) => s.id)));
        },
        error: () => {}
      });
    }
  }

  hasPurchased(serviceId: number): boolean {
    return this.purchasedServiceIds().has(serviceId);
  }

  addToCart(service: Service) {
    this.cartService.addToCart(service);
    this.setAddedState(service.id, true);
    setTimeout(() => this.setAddedState(service.id, false), 1000);
  }

  isAdded(id: number) { return this.addedStates().get(id) ?? false; }

  private setAddedState(id: number, state: boolean) {
    this.addedStates.update(m => { const n = new Map(m); n.set(id, state); return n; });
  }

  toggleReviews(id: number) {
    if (this.expandedId() === id) { this.expandedId.set(null); return; }
    this.expandedId.set(id);
    if (this.reviewsMap()[id] !== undefined) return;

    this.loadingReviewsId.set(id);
    this.http.get<Review[]>(`${environment.apiUrl}/services/${id}/reviews`).subscribe({
      next: (data) => { this.reviewsMap.update(m => ({ ...m, [id]: data })); this.loadingReviewsId.set(null); },
      error: () => { this.reviewsMap.update(m => ({ ...m, [id]: [] })); this.loadingReviewsId.set(null); }
    });
  }

  stars(n: number) { return Array.from({ length: n }); }

  openReviewModal(id: number) {
    this.reviewModalId.set(id);
    this.reviewRating.set(5);
    this.reviewComment.set('');
    this.reviewMessage.set(null);
  }

  closeReviewModal() { this.reviewModalId.set(null); }

  setRating(n: number) { this.reviewRating.set(n); }

  submitReview() {
    if (this.submittingReview() || !this.reviewModalId() || !this.reviewComment().trim()) return;
    this.submittingReview.set(true);
    this.reviewMessage.set(null);

    this.authService.addReview({
      rating: this.reviewRating(),
      comment: this.reviewComment(),
      service_id: this.reviewModalId()!
    }).subscribe({
      next: () => {
        this.reviewMessage.set({ text: '¡Reseña enviada correctamente!', isError: false });
        this.submittingReview.set(false);
        const sid = this.reviewModalId()!;
        this.reviewsMap.update(m => { const n = { ...m }; delete n[sid]; return n; });
        setTimeout(() => { this.closeReviewModal(); this.toggleReviews(sid); }, 1500);
      },
      error: (err) => {
        this.reviewMessage.set({ text: err.error?.error || 'Error al enviar la reseña', isError: true });
        this.submittingReview.set(false);
      }
    });
  }
}
