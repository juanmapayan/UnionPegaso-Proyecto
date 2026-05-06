import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SectionTitleComponent } from '@compartido';
import { ServicesService } from '../../servicios.service';
import { Service } from '../../models/service.model';
import { CartService } from '../../../../nucleo/servicios/cart.service';
import { AuthService } from '../../../../nucleo/servicios/acceso.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface ServiceView extends Service {
    icon: string;
    desc: string;
    items: string[];
}

interface Review {
    author_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SectionTitleComponent],
  templateUrl: './services-list.component.html'
})
export class ServicesListComponent implements OnInit {
  private servicesService = inject(ServicesService);
  private http = inject(HttpClient);
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);

  services = signal<ServiceView[]>([]);
  loading = signal(true);

  // Reseñas por servicio
  reviewsMap = signal<Record<number, Review[]>>({});
  expandedServiceId = signal<number | null>(null);
  loadingReviews = signal<number | null>(null);

  // Modal escribir reseña
  reviewModalServiceId = signal<number | null>(null);
  reviewRating = signal(5);
  reviewComment = signal('');
  submittingReview = signal(false);
  reviewMessage = signal<{ text: string; isError: boolean } | null>(null);

  private mapToView(service: Service, index: number): ServiceView {
    const icons = [
      'assets/icons/search.svg',
      'assets/icons/chart.svg',
      'assets/icons/social.svg',
      'assets/icons/layout.svg',
      'assets/icons/layers.svg',
      'assets/icons/mail.svg'
    ];
    return {
      ...service,
      icon: icons[index % icons.length],
      desc: service.description,
      items: ['Atención Personalizada', 'Soporte Premium', 'Aseguramiento de Calidad']
    };
  }

  ngOnInit() {
    this.servicesService.getServices().subscribe({
      next: (data) => {
        this.services.set(data.map((s, i) => this.mapToView(s, i)));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching services', err);
        this.loading.set(false);
      }
    });
  }

  isInCart(id: number): boolean {
    return this.cartService.cartItems().some(item => item.id === id);
  }

  addToCart(service: ServiceView): void {
    this.cartService.addToCart(service);
  }

  toggleReviews(serviceId: number) {
    if (this.expandedServiceId() === serviceId) {
      this.expandedServiceId.set(null);
      return;
    }
    this.expandedServiceId.set(serviceId);
    if (this.reviewsMap()[serviceId] !== undefined) return;

    this.loadingReviews.set(serviceId);
    this.http.get<Review[]>(`${environment.apiUrl}/services/${serviceId}/reviews`).subscribe({
      next: (data) => {
        this.reviewsMap.update(m => ({ ...m, [serviceId]: data }));
        this.loadingReviews.set(null);
      },
      error: () => {
        this.reviewsMap.update(m => ({ ...m, [serviceId]: [] }));
        this.loadingReviews.set(null);
      }
    });
  }

  reviewCount(serviceId: number): number {
    return this.reviewsMap()[serviceId]?.length ?? 0;
  }

  stars(n: number): number[] {
    return Array.from({ length: n });
  }

  openReviewModal(serviceId: number) {
    this.reviewModalServiceId.set(serviceId);
    this.reviewRating.set(5);
    this.reviewComment.set('');
    this.reviewMessage.set(null);
  }

  closeReviewModal() {
    this.reviewModalServiceId.set(null);
  }

  setRating(n: number) {
    this.reviewRating.set(n);
  }

  submitReview() {
    if (this.submittingReview() || !this.reviewModalServiceId() || !this.reviewComment().trim()) return;
    this.submittingReview.set(true);
    this.reviewMessage.set(null);

    this.authService.addReview({
      rating: this.reviewRating(),
      comment: this.reviewComment(),
      service_id: this.reviewModalServiceId()!
    }).subscribe({
      next: () => {
        this.reviewMessage.set({ text: '¡Reseña enviada correctamente!', isError: false });
        this.submittingReview.set(false);
        // Recargar reseñas del servicio
        const sid = this.reviewModalServiceId()!;
        this.reviewsMap.update(m => { const n = { ...m }; delete n[sid]; return n; });
        setTimeout(() => {
          this.closeReviewModal();
          this.toggleReviews(sid);
        }, 1500);
      },
      error: (err) => {
        this.reviewMessage.set({ text: err.error?.error || 'Error al enviar la reseña', isError: true });
        this.submittingReview.set(false);
      }
    });
  }
}
