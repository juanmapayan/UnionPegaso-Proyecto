import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { PortfolioModalService } from '../../../../core/services/portfolio-modal.service';
import { PortfolioItem } from '../../../portfolio/models/portfolio-item.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-portfolio-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-modal.component.html',
  styleUrls: ['./portfolio-modal.component.scss'],
  animations: [
    trigger('modalFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalScale', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class PortfolioModalComponent {
  modalService = inject(PortfolioModalService);
  @ViewChild('videoPlayer') videoPlayer?: ElementRef<HTMLVideoElement>;

  // Soporte de teclado para el Modal
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.modalService.isOpen()) {
      this.closeModal();
    }
  }

  closeModal() {
    // Restablecer video si existe
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      video.pause();
      video.currentTime = 0;
      video.src = '';
      video.load();
    }
    this.modalService.close();
  }

  getPosterForItem(item: PortfolioItem): string {
    if (item.poster_url) return item.poster_url;
    if (item.type === 'video') return '';
    return item.media_url;
  }

  resolveUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = environment.apiUrl.replace('/api', '');
    if (path.startsWith('/uploads/')) return base + path;
    if (path.startsWith('uploads/')) return base + '/' + path;
    return path;
  }
}
