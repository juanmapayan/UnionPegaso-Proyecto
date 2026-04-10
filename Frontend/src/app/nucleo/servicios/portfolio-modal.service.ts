import { Injectable, signal } from '@angular/core';
import { PortfolioItem } from '../../paginas/inicio/data/portafolio.data';

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
        // Limpiar el item tras la animación
        setTimeout(() => {
            this.selectedItem.set(null);
        }, 300);
    }
}
