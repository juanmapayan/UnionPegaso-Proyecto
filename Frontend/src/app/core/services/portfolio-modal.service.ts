import { Injectable, signal } from '@angular/core';
import { PortfolioItem } from '../../features/home/data/portfolio.data';

@Injectable({
    providedIn: 'root'
})
export class PortfolioModalService {
    isOpen = signal(false);
    selectedItem = signal<PortfolioItem | null>(null);

    open(item: PortfolioItem) {
        this.selectedItem.set(item);
        this.isOpen.set(true);
        document.body.classList.add('modal-open');
    }

    close() {
        this.isOpen.set(false);
        document.body.classList.remove('modal-open');
        // Clear item after animation
        setTimeout(() => {
            this.selectedItem.set(null);
        }, 300);
    }
}
