import { Component, signal, OnDestroy, OnInit, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PORTFOLIO_ITEMS, PortfolioItem } from '../../data/portfolio.data';
import { PortfolioModalService } from '../../../../core/services/portfolio-modal.service';

type VideoOrientation = 'portrait' | 'landscape' | 'square';

@Component({
  selector: 'app-portfolio-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-carousel.component.html',
  styleUrls: ['./portfolio-carousel.component.scss']
})
export class PortfolioCarouselComponent implements OnInit, OnDestroy {


  private modalService = inject(PortfolioModalService);

  items = PORTFOLIO_ITEMS;
  currentIndex = signal(0);

  // Poster & Orientation Cache
  generatedPosters = signal<Record<string, string>>({});
  videoOrientations = signal<Record<string, VideoOrientation>>({});
  posterLoading = signal<Record<string, boolean>>({});

  // Responsive items per view
  itemsPerView = signal(3);
  dotCount = signal(0);
  Array = Array;
  private resizeHandler = () => this.updateItemsPerView();

  constructor() {
    this.updateItemsPerView();
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.resizeHandler);

    // Pre-generar pósters para videos sin portada
    this.items
      .filter((item) => item.type === 'video')
      .forEach((item) => this.ensurePosterAndOrientation(item));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }

  onItemClick(item: PortfolioItem): void {
    if (this.isDragScroll) return; // Prevent click if dragging

    if (item.type === 'video') {
      this.ensurePosterAndOrientation(item);
    }
    // Open Global Modal via Service
    this.modalService.open(item);
  }

  getPosterForItem(item: PortfolioItem): string {
    if (item.type === 'image') return item.poster || item.src;
    const generated = this.generatedPosters()[item.id];
    return generated || item.poster || ''; // Fallback empty if loading
  }

  isPosterLoading(item: PortfolioItem): boolean {
    return !!this.posterLoading()[item.id];
  }

  triggerPosterGeneration(item: PortfolioItem): void {
    if (item.type !== 'video') return;
    this.ensurePosterAndOrientation(item);
  }

  // --- Video Helpers ---

  private async ensurePosterAndOrientation(item: PortfolioItem): Promise<void> {
    const id = item.id;
    const hasPoster = this.generatedPosters()[id];
    const hasOrientation = this.videoOrientations()[id];
    const alreadyLoading = this.posterLoading()[id];

    if ((hasPoster && hasOrientation) || alreadyLoading) return;

    if (item.poster) {
      // Manual poster exists
    }

    this.posterLoading.update((state) => ({ ...state, [id]: true }));

    const result = await this.capturePosterFromVideo(item.src);
    if (result.orientation) {
      this.videoOrientations.update((state) => ({ ...state, [id]: result.orientation! }));
    }
    if (result.poster) {
      this.generatedPosters.update((state) => ({ ...state, [id]: result.poster! }));
    }
    this.posterLoading.update((state) => ({ ...state, [id]: false }));
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
        const target = duration > 2 ? 1.5 : 0.5;
        video.currentTime = target;
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
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          cleanup(dataUrl);
        } catch (e) {
          cleanup(null);
        }
      };
    });
  }

  private getOrientationFromDimensions(width: number, height: number): VideoOrientation {
    if (!width || !height) return 'landscape';
    const ratio = width / height;
    if (ratio >= 0.9 && ratio <= 1.1) return 'square';
    return width > height ? 'landscape' : 'portrait';
  }

  // --- Drag & Swipe Logic ---

  isDragging = signal(false);
  private startX = 0;
  private currentX = 0;
  private dragStartX = 0;
  dragOffset = signal(0); // Pixels moved during drag
  isDragScroll = false; // Flag to distinguish click vs drag

  onDragStart(event: MouseEvent | TouchEvent): void {
    this.isDragging.set(true);
    this.isDragScroll = false;
    this.startX = this.getClientX(event);
    this.dragStartX = this.startX;
    this.currentX = this.startX;
    this.dragOffset.set(0);
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging()) return;

    const x = this.getClientX(event);
    const diff = x - this.currentX;

    // Check if it's a horizontal gesture
    if (Math.abs(x - this.dragStartX) > 8) {
      this.isDragScroll = true;
    }

    this.currentX = x;
    this.dragOffset.update(prev => prev + diff);
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onDragEnd(): void {
    if (!this.isDragging()) return;

    this.isDragging.set(false);

    const moved = this.dragOffset();
    const threshold = 50; // Pixels to trigger slide change

    if (moved < -threshold) {
      this.next();
    } else if (moved > threshold) {
      this.prev();
    }

    this.dragOffset.set(0); // Reset after snap
  }

  private getClientX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }

  // --- Carousel Navigation ---

  updateItemsPerView(): void {
    const width = window.innerWidth;
    if (width < 640) {
      this.itemsPerView.set(1);
    } else if (width < 1024) {
      this.itemsPerView.set(2);
    } else {
      this.itemsPerView.set(3);
    }
    this.updateDotCount();
  }

  updateDotCount(): void {
    this.dotCount.set(Math.ceil(this.items.length / this.itemsPerView()));
  }

  next(): void {
    if (this.isNextDisabled()) return;
    const maxIndex = Math.max(0, this.items.length - this.itemsPerView());
    const nextIndex = this.currentIndex() + 1;
    this.currentIndex.set(nextIndex > maxIndex ? 0 : nextIndex);
  }

  prev(): void {
    if (this.isPrevDisabled()) return;
    const maxIndex = Math.max(0, this.items.length - this.itemsPerView());
    const prevIndex = this.currentIndex() - 1;
    this.currentIndex.set(prevIndex < 0 ? maxIndex : prevIndex);
  }

  goToSlide(index: number): void {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerView());
    this.currentIndex.set(Math.min(index, maxIndex));
  }

  isNextDisabled(): boolean {
    return false;
  }

  isPrevDisabled(): boolean {
    return false;
  }
}
