import { Component, inject, signal, OnInit } from '@angular/core';
import { SectionTitleComponent } from '@compartido';
import { ServicesService } from '../../servicios.service';
import { Service } from '../../models/service.model';
import { CommonModule } from '@angular/common';

interface ServiceView extends Service {
    icon: string;
    desc: string;
    items: string[];
}

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, SectionTitleComponent],
  templateUrl: './services-list.component.html'
})
export class ServicesListComponent implements OnInit {
  private servicesService = inject(ServicesService);
  services = signal<ServiceView[]>([]);
  loading = signal(true);

  private mapToView(service: Service, index: number): ServiceView {
    const icons = [
      'assets/icons/search.svg',
      'assets/icons/chart.svg',
      'assets/icons/social.svg',
      'assets/icons/layout.svg',
      'assets/icons/layers.svg',
      'assets/icons/mail.svg'
    ];

    return {
      ...service,
      icon: icons[index % icons.length],
      desc: service.description,
      items: ['Atención Personalizada', 'Soporte Premium', 'Aseguramiento de Calidad']
    };
  }

  ngOnInit() {
    this.servicesService.getServices().subscribe({
      next: (data) => {
        const mappedData: ServiceView[] = data.map((service, idx) => this.mapToView(service, idx));
        this.services.set(mappedData);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching services', err);
        this.loading.set(false);
      }
    });
  }
}
