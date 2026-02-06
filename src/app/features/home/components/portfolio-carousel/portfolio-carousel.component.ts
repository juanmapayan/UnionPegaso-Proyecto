import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PORTFOLIO_ITEMS, PortfolioItem } from '../../data/portfolio.data';

@Component({
  selector: 'app-portfolio-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-carousel.component.html',
  styleUrls: ['./portfolio-carousel.component.scss']
})
export class PortfolioCarouselComponent {
  items = PORTFOLIO_ITEMS;
  currentIndex = signal(0);
  selectedVideoItem = signal<PortfolioItem | null>(null);
  
  // Responsive items per view
  itemsPerView = signal(3);
  dotCount = signal(0);
  Array = Array;
  
  constructor() {
    // Calcular items por vista
    this.updateItemsPerView();
    window.addEventListener('resize', () => this.updateItemsPerView());
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

  openVideoModal(item: PortfolioItem): void {
    this.selectedVideoItem.set(item);
  }

  closeVideoModal(): void {
    this.selectedVideoItem.set(null);
  }

  onModalOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeVideoModal();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeVideoModal();
    }
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
