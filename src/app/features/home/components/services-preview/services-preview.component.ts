import { Component, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitleComponent, ScrollRevealDirective, SvgIconComponent } from '@shared';
import { ModalService, ServiceDetail } from '../../../../core/services';

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
export class ServicesPreviewComponent {
  private modalService = inject(ModalService);
  requestQuote = output<void>();

  services: ServiceDetail[] = [
    {
      id: 'seo',
      title: 'SEO & Posicionamiento',
      description: 'Optimización técnica y de contenidos para dominar los resultados de búsqueda orgánica.',
      tags: ['SEO', 'Contenido'],
      typicalResult: '+25% tráfico orgánico en 90 días',
      bullets: ['Auditoría Técnica', 'Linkbuilding Premium', 'Content Marketing'],
      deliverables: [
        'Auditoría completa de SEO técnico y on-page',
        'Estrategia de keywords y contenidos',
        'Backlinks de alta autoridad',
        'Informes mensuales de posicionamiento',
        'Optimización continua basada en datos'
      ],
      timeline: '3-6 meses para resultados significativos',
      idealFor: ['E-commerce', 'Empresas B2B', 'Blogs y medios digitales'],
      icon: 'search'
    },
    {
      id: 'ppc',
      title: 'Paid Media (PPC)',
      description: 'Campañas de alto rendimiento en Google, Meta y LinkedIn Ads orientadas al ROI.',
      tags: ['PPC', 'ROI'],
      typicalResult: 'ROAS objetivo 3x–6x',
      bullets: ['Google Ads', 'Facebook & Instagram Ads', 'Retargeting Avanzado'],
      deliverables: [
        'Configuración completa de campañas',
        'Segmentación avanzada de audiencias',
        'Copy y creatividades optimizadas',
        'Testing A/B continuo',
        'Dashboard de métricas en tiempo real'
      ],
      timeline: 'Resultados visibles en 2-4 semanas',
      idealFor: ['E-commerce', 'SaaS', 'Generación de leads B2B'],
      icon: 'trending'
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Gestión de comunidades y creación de contenido viral que conecta con tu audiencia.',
      tags: ['RRSS', 'Engagement'],
      typicalResult: '+40% engagement promedio',
      bullets: ['Estrategia de Contenidos', 'Gestión de Comunidad', 'Influencer Marketing'],
      deliverables: [
        'Calendario editorial mensual',
        'Creación de contenido visual y copywriting',
        'Gestión diaria de comunidad',
        'Colaboraciones con influencers',
        'Reportes de engagement y crecimiento'
      ],
      timeline: 'Crecimiento sostenido a partir del mes 2',
      idealFor: ['Marcas B2C', 'E-commerce', 'Empresas de lifestyle'],
      icon: 'megaphone'
    },
    {
      id: 'dev',
      title: 'Desarrollo Web & Apps',
      description: 'Soluciones tecnológicas a medida: desde landing pages hasta plataformas complejas.',
      tags: ['Dev', 'UX/UI'],
      typicalResult: 'Entrega en 4-8 semanas',
      bullets: ['Desarrollo Frontend', 'E-commerce Custom', 'Aplicaciones Web'],
      deliverables: [
        'Diseño UI/UX personalizado',
        'Desarrollo responsive y optimizado',
        'Integración con APIs y CMS',
        'Testing completo en múltiples dispositivos',
        'Soporte post-lanzamiento'
      ],
      timeline: '4-8 semanas según complejidad',
      idealFor: ['Startups', 'E-commerce', 'Empresas que necesitan plataformas custom'],
      icon: 'code'
    },
    {
      id: 'automation',
      title: 'Marketing Automation',
      description: 'Automatización de procesos comerciales y nurturing para maximizar conversiones.',
      tags: ['Automation', 'Leads'],
      typicalResult: '+35% en conversión de leads',
      bullets: ['Email Marketing', 'Lead Scoring', 'CRM Integration'],
      deliverables: [
        'Configuración de flujos automatizados',
        'Integración con CRM (HubSpot, Salesforce)',
        'Segmentación avanzada de leads',
        'Email templates personalizados',
        'Dashboards de conversión'
      ],
      timeline: '2-3 semanas para setup inicial',
      idealFor: ['B2B', 'SaaS', 'Empresas con ciclos de venta largos'],
      icon: 'zap'
    },
    {
      id: 'branding',
      title: 'Branding & Diseño',
      description: 'Identidad visual cohesiva que refleja los valores de tu marca y conecta emocionalmente.',
      tags: ['Branding', 'Diseño'],
      typicalResult: 'Identidad completa en 3 semanas',
      bullets: ['Diseño de Marca', 'Material Gráfico', 'Guías de Estilo'],
      deliverables: [
        'Logo y variantes',
        'Paleta de colores y tipografías',
        'Brand guidelines completas',
        'Templates para redes sociales',
        'Material corporativo (tarjetas, papelería)'
      ],
      timeline: '3-4 semanas para identidad completa',
      idealFor: ['Nuevas empresas', 'Rebranding', 'Empresas en expansión'],
      icon: 'palette'
    }
  ];
  
  openServiceDetails(service: ServiceDetail) {
    this.modalService.openServiceModal(service);
  }
}
