import { Component, output, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitleComponent, ScrollRevealDirective, SvgIconComponent } from '@shared';
import { ModalService, ServiceDetail } from '../../../../core/services';
import { ServicesService } from '../../../services/services.service';
import { Service } from '../../../services/models/service.model';

@Component({
  selector: 'app-services-preview',
  standalone: true,
  imports: [RouterLink, SectionTitleComponent, ScrollRevealDirective, SvgIconComponent],
  templateUrl: './services-preview.component.html',
  styles: [`
    :host {
      --accent: #c084fc;
    }
    
    .service-card {
      transition: border-color 0.5s ease, transform 0.5s ease, box-shadow 0.5s ease;
    }
    
    .service-card:hover {
      border-color: rgba(168, 85, 247, 0.5);
      transform: translateY(-8px);
      box-shadow: 0 20px 60px -15px rgba(124, 58, 237, 0.4);
    }
    
    .service-divider,
    .service-glow {
      transition: all 0.5s ease;
    }
    
    .service-card button {
      transition: color 0.3s ease, gap 0.3s ease;
    }
    
    .service-card h4,
    .service-card p,
    .service-card li,
    .service-card .w-12 {
      transition: color 0.3s ease, background-color 0.3s ease;
    }
    
    .service-card li span:first-child {
      transition: background-color 0.3s ease, transform 0.3s ease;
    }
    
    /* Accessibility: Respect reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      .service-card,
      .service-card *,
      .service-divider,
      .service-glow {
        transition: opacity 0.2s ease !important;
        transform: none !important;
      }
      
      .service-card:hover {
        transform: none;
      }
      
      .service-card li span:first-child {
        transform: none !important;
      }
    }
  `]
})
export class ServicesPreviewComponent implements OnInit {
  private modalService = inject(ModalService);
  private servicesService = inject(ServicesService);
  requestQuote = output<void>();

  services = signal<ServiceDetail[]>([]);
  loading = signal(true);

  // Helper method: map real API services (Service) into
  // presentation-only ServiceDetail view models for the home page.
  // This keeps backend data (title/description) as the source of truth
  // and adds only visual metadata (icons, tags, bullets, etc.).
  private mapServicesToDetails(apiServices: Service[]): ServiceDetail[] {
     const defaultDetails = {
       tags: ['Premium'],
       typicalResult: 'Consulta para estimación',
       bullets: ['Atención personalizada', 'Alta calidad'],
       deliverables: ['Acuerdo de nivel de servicio', 'Reporte periódico'],
       timeline: 'Acorde al requerimiento',
       idealFor: ['Empresas corporativas', 'PyMEs']
     };

     const icons = ['search', 'trending', 'megaphone', 'code', 'zap', 'palette'];

     return apiServices.slice(0, 6).map((service, index) => ({
       id: service.id.toString(),
       title: service.title,
       description: service.description,
       tags: defaultDetails.tags,
       typicalResult: defaultDetails.typicalResult,
       bullets: defaultDetails.bullets,
       deliverables: defaultDetails.deliverables,
       timeline: defaultDetails.timeline,
       idealFor: defaultDetails.idealFor,
       icon: icons[index % icons.length]
     }));
  }

  ngOnInit() {
    this.servicesService.getServices(6).subscribe({
      next: (data) => {
        const details = this.mapServicesToDetails(data);
        this.services.set(details);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching services for preview', err);
        this.loading.set(false);
      }
    });
  }
  
  openServiceDetails(service: ServiceDetail) {
    this.modalService.openServiceModal(service);
  }
}
