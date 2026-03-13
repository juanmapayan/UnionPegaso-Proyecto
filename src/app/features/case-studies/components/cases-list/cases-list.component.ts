import { Component, signal, computed } from '@angular/core';
import { SectionTitleComponent, ScrollRevealDirective } from '@shared';

interface CaseStudy {
  id: number;
  client: string;
  category: string;
  metric: string;
  metricLabel: string;
  desc: string;
}

@Component({
  selector: 'app-cases-list',
  standalone: true,
  imports: [SectionTitleComponent, ScrollRevealDirective],
  templateUrl: './cases-list.component.html',
  styles: [`
    .bg-white-5 { background-color: rgba(255,255,255,0.05); }
    .hover-bg-white-10:hover { background-color: rgba(255,255,255,0.1); }
  `]
})
export class CasesListComponent {
  categories = ['Todos', 'E-commerce', 'SaaS', 'B2B', 'Branding'];
  activeCategory = signal('Todos');

  cases: CaseStudy[] = [
    { id: 1, client: 'Luxe Fashion Co.', category: 'E-commerce', metric: '+215%', metricLabel: 'ROI Total', desc: 'Escalado de ventas globales a través de optimización de embudos y campañas de Social Ads hiper-segmentadas.' },
    { id: 2, client: 'CloudStream Pro', category: 'SaaS', metric: '120k', metricLabel: 'Usuarios Activos', desc: 'Estrategia de Content Marketing y SEO que posicionó a la marca como líder de opinión en su nicho.' },
    { id: 3, client: 'Legal Advisors Int.', category: 'B2B', metric: '-45%', metricLabel: 'Coste por Lead', desc: 'Digitalización completa de la captación de clientes y automatización de procesos de CRM.' },
    { id: 4, client: 'EcoHome Solutions', category: 'E-commerce', metric: '+300%', metricLabel: 'Engagement', desc: 'Lanzamiento de marca omnicanal con enfoque en sostenibilidad y retención de usuarios recurrentes.' },
    { id: 5, client: 'FinTech One', category: 'SaaS', metric: '5x', metricLabel: 'Crecimiento Anual', desc: 'Rediseño completo de UX/UI y estrategia de adquisición agresiva en LinkedIn Ads.' },
    { id: 6, client: 'Burger King Local', category: 'Branding', metric: '1.2M', metricLabel: 'Impactos', desc: 'Campaña viral en redes sociales localizando una marca global para un público específico.' }
  ];

  filteredCases = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'Todos') return this.cases;
    return this.cases.filter(c => c.category === cat);
  });

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }
}
