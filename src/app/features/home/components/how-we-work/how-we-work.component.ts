import { Component } from '@angular/core';
import { SectionTitleComponent } from '@shared';

@Component({
  selector: 'app-how-we-work',
  standalone: true,
  imports: [SectionTitleComponent],
  templateUrl: './how-we-work.component.html'
})
export class HowWeWorkComponent {
  steps = [
    { id: 1, title: 'Análisis Profundo', desc: 'Auditamos tu presencia actual, competencia y mercado objetivo para identificar oportunidades.' },
    { id: 2, title: 'Estrategia Personalizada', desc: 'Diseñamos un plan de acción detallado con KPIs claros y canales seleccionados.' },
    { id: 3, title: 'Ejecución Impecable', desc: 'Implementamos campañas y desarrollos con los más altos estándares de calidad.' },
    { id: 4, title: 'Optimización Continua', desc: 'Monitorizamos resultados en tiempo real y ajustamos para maximizar el ROI.' }
  ];
}
