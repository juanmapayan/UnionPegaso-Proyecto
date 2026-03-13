import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { PortfolioModalService } from '../../../../core/services/portfolio-modal.service';
import { PortfolioItem } from '../../data/portfolio.data';

type VideoOrientation = 'portrait' | 'landscape' | 'square';

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

  // Keyboard support for Modal
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.modalService.isOpen()) {
      this.closeModal();
    }
  }

  closeModal() {
    // Reset Video if present
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
    return item.poster || item.src;
  }
}
