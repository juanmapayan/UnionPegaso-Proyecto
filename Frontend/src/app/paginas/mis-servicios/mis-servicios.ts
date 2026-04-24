import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../nucleo/servicios/acceso.service';

@Component({
  selector: 'app-mis-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-servicios.html',
})
export class MisServicios implements OnInit {
  authService = inject(AuthService);

  services = signal<any[]>([]);
  loading = signal(true);
  error = signal('');

  selectedServiceId = signal<number | null>(null);
  reviewRating = signal<number>(5);
  reviewComment = signal<string>('');
  reviewMessage = signal<{text: string, isError: boolean} | null>(null);
  submittingReview = signal(false);

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading.set(true);
    this.authService.getMyServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.');
        this.loading.set(false);
      }
    });
  }

  openReviewModal(serviceId: number) {
    this.selectedServiceId.set(serviceId);
    this.reviewRating.set(5);
    this.reviewComment.set('');
    this.reviewMessage.set(null);
  }

  closeReviewModal() {
    this.selectedServiceId.set(null);
  }

  setRating(rating: number) {
    this.reviewRating.set(rating);
  }

  submitReview() {
    if (this.submittingReview() || !this.selectedServiceId() || !this.reviewComment().trim()) return;

    this.submittingReview.set(true);
    this.reviewMessage.set(null);

    this.authService.addReview({
      rating: this.reviewRating(),
      comment: this.reviewComment(),
      service_id: this.selectedServiceId()!
    }).subscribe({
      next: () => {
        this.reviewMessage.set({ text: 'Reseña enviada correctamente', isError: false });
        this.submittingReview.set(false);
        setTimeout(() => {
          this.closeReviewModal();
        }, 2000);
      },
      error: (err) => {
        this.reviewMessage.set({ text: err.error?.error || 'Error al enviar la reseña', isError: true });
        this.submittingReview.set(false);
      }
    });
  }
}
