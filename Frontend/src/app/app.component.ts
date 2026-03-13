import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServiceDetailsModalComponent } from './shared/components/service-details-modal/service-details-modal.component';
import { PortfolioModalComponent } from './features/home/components/portfolio-modal/portfolio-modal.component';
import { ModalService } from './core/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ServiceDetailsModalComponent, PortfolioModalComponent],
  template: `
    <router-outlet></router-outlet>
    
    <!-- Global Service Details Modal -->
    <app-service-details-modal 
      [service]="modalService.selectedService()"
      [isOpen]="modalService.isServiceModalOpen()"
      (closed)="modalService.closeServiceModal()"
    ></app-service-details-modal>

    <!-- Global Portfolio Modal -->
    <app-portfolio-modal></app-portfolio-modal>
  `,
  styles: []
})
export class AppComponent {
  constructor(public modalService: ModalService) { }
}
