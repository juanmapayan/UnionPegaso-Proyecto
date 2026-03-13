import { Component } from '@angular/core';
import { SectionTitleComponent } from '@shared';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [SectionTitleComponent],
  templateUrl: './services-list.component.html'
})
export class ServicesListComponent {
  services = [
    {
      title: 'SEO & Posicionamiento',
      desc: 'Optimización técnica y de contenidos para dominar los resultados de búsqueda orgánica.',
      items: ['Auditoría Técnica', 'Linkbuilding Premium', 'Content Marketing'],
      icon: 'assets/icons/search.svg'
    },
    {
      title: 'Paid Media (PPC)',
      desc: 'Campañas de alto rendimiento en Google, Meta y LinkedIn Ads orientadas al ROI.',
      items: ['Google Ads', 'Facebook & Instagram Ads', 'Retargeting Avanzado'],
      icon: 'assets/icons/chart.svg'
    },
    {
      title: 'Social Media',
      desc: 'Gestión de comunidades y creación de contenido viral que conecta con tu audiencia.',
      items: ['Estrategia de Contenidos', 'Gestión de Comunidad', 'Influencer Marketing'],
      icon: 'assets/icons/social.svg'
    },
    {
      title: 'Diseño Web & UX',
      desc: 'Desarrollo de sitios web rápidos, seguros y diseñados para convertir visitas en clientes.',
      items: ['Diseño UI/UX', 'Desarrollo Frontend', 'CRO'],
      icon: 'assets/icons/layout.svg'
    },
    {
      title: 'Branding',
      desc: 'Construcción de marcas sólidas con identidad visual y verbal coherente.',
      items: ['Identidad Visual', 'Tono de Voz', 'Rebranding'],
      icon: 'assets/icons/layers.svg'
    },
    {
      title: 'Email Marketing',
      desc: 'Automatización y flujos de nutrición para maximizar el valor de vida del cliente (LTV).',
      items: ['Automatización', 'Newsletter', 'Segmentación'],
      icon: 'assets/icons/mail.svg'
    }
  ];
}
