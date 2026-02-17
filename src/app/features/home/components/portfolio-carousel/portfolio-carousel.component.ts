import { Component, signal, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PORTFOLIO_ITEMS, PortfolioItem } from '../../data/portfolio.data';

type VideoOrientation = 'portrait' | 'landscape' | 'square';

@Component({
  selector: 'app-portfolio-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-carousel.component.html',
  styleUrls: ['./portfolio-carousel.component.scss']
})

export class PortfolioCarouselComponent implements OnInit, OnDestroy {
  @Output() openItem = new EventEmitter<PortfolioItem>();

  items = PORTFOLIO_ITEMS;
  currentIndex = signal(0);
  generatedPosters = signal<Record<string, string>>({});
  videoOrientations = signal<Record<string, VideoOrientation>>({});
  posterLoading = signal<Record<string, boolean>>({});
  
  // Responsive items per view
  itemsPerView = signal(3);
  dotCount = signal(0);
  Array = Array;
  private resizeHandler = () => this.updateItemsPerView();

  constructor() {
    // Calcular items por vista
    this.updateItemsPerView();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnInit(): void {
    // Pre-generar pósters para videos sin portada declarada
    this.items
      .filter((item) => item.type === 'video')
      .forEach((item) => this.ensurePosterAndOrientation(item));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }

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
    const maxIndex = Math.max(0, this.items.length - this.itemsPerView());
    const nextIndex = this.currentIndex() + 1;
    this.currentIndex.set(nextIndex > maxIndex ? 0 : nextIndex);
  }

  prev(): void {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerView());
    const prevIndex = this.currentIndex() - 1;
    this.currentIndex.set(prevIndex < 0 ? maxIndex : prevIndex);
  }

  goToSlide(index: number): void {
    const maxIndex = Math.max(0, this.items.length - this.itemsPerView());
    this.currentIndex.set(Math.min(index, maxIndex));
  }

  onItemClick(item: PortfolioItem): void {
    if (item.type === 'video') {
      this.ensurePosterAndOrientation(item);
    }
    this.openItem.emit(item);
  }

  getPosterForItem(item: PortfolioItem): string | null {
    const generated = this.generatedPosters()[item.id];
    return generated || item.poster || null;
  }

  isPosterLoading(item: PortfolioItem): boolean {
    return !!this.posterLoading()[item.id];
  }

  triggerPosterGeneration(item: PortfolioItem): void {
    if (item.type !== 'video') return;
    this.ensurePosterAndOrientation(item);
  }



  private async ensurePosterAndOrientation(item: PortfolioItem): Promise<void> {
    const id = item.id;
    const hasPoster = this.generatedPosters()[id];
    const hasOrientation = this.videoOrientations()[id];
    const alreadyLoading = this.posterLoading()[id];
    if ((hasPoster && hasOrientation) || alreadyLoading) return;

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
      video.preload = 'auto';
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        cleanup(dataUrl);
      };
    });
  }

  private getOrientationFromDimensions(width: number, height: number): VideoOrientation {
    if (!width || !height) return 'landscape';
    if (Math.abs(width - height) < 2) return 'square';
    return width > height ? 'landscape' : 'portrait';
  }

  getVisibleItems(): PortfolioItem[] {
    return this.items.slice(
      this.currentIndex(),
      this.currentIndex() + this.itemsPerView()
    );
  }

  getDotCount(): number {
    return this.dotCount();
  }

  isNextDisabled(): boolean {
    return false;
  }

  isPrevDisabled(): boolean {
    return false;
  }
}
