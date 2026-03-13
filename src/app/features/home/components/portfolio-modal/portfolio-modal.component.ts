import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioItem } from '../../data/portfolio.data';

type VideoOrientation = 'portrait' | 'landscape' | 'square';

@Component({
  selector: 'app-portfolio-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-modal.component.html',
  styleUrls: ['./portfolio-modal.component.scss']
})
export class PortfolioModalComponent implements OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() item: PortfolioItem | null = null;
  @Output() closed = new EventEmitter<void>();

  generatedPoster = signal<string | null>(null);
  videoOrientation = signal<VideoOrientation>('portrait');
  isLoadingPoster = signal(false);

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  closeModal(): void {
    this.unlockBodyScroll();
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  getPoster(): string | undefined {
    return this.generatedPoster() || this.item?.poster;
  }

  isVideo(): boolean {
    return this.item?.type === 'video';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] || changes['item']) {
      if (this.isOpen && this.item) {
        this.lockBodyScroll();
        if (this.item.type === 'video' && !this.generatedPoster() && !this.item.poster) {
          this.generatePoster(this.item.src);
        }
      } else {
        this.unlockBodyScroll();
      }
    }
  }

  private async generatePoster(src: string): Promise<void> {
    if (this.isLoadingPoster()) return;
    this.isLoadingPoster.set(true);

    const result = await this.capturePosterFromVideo(src);
    if (result.orientation) {
      this.videoOrientation.set(result.orientation);
    }
    if (result.poster) {
      this.generatedPoster.set(result.poster);
    }
    this.isLoadingPoster.set(false);
  }

  private capturePosterFromVideo(src: string): Promise<{ poster: string | null; orientation: VideoOrientation | null }> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = src;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';

      let orientation: VideoOrientation | null = null;

      const cleanup = (poster: string | null) => {
        video.src = '';
        resolve({ poster, orientation });
      };

      video.onerror = () => cleanup(null);

      video.onloadedmetadata = () => {
        orientation = this.getOrientationFromDimensions(video.videoWidth, video.videoHeight);
        const duration = isFinite(video.duration) ? video.duration : 0;
        const target = duration > 1 ? Math.random() * (duration - 0.6) + 0.3 : 0.2;
        video.currentTime = Math.max(0.1, target);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup(null);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        cleanup(dataUrl);
      };
    });
  }

  private getOrientationFromDimensions(width: number, height: number): VideoOrientation {
    if (!width || !height) return 'landscape';
    if (Math.abs(width - height) < 2) return 'square';
    return width > height ? 'landscape' : 'portrait';
  }

  private lockBodyScroll(): void {
    document.body.classList.add('modal-open');
  }

  private unlockBodyScroll(): void {
    document.body.classList.remove('modal-open');
  }
}
