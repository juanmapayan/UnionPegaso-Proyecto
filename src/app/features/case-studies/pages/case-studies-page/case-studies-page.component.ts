import { Component } from '@angular/core';
import { CasesListComponent } from '../../components/cases-list/cases-list.component';

@Component({
  selector: 'app-case-studies-page',
  standalone: true,
  imports: [CasesListComponent],
  template: `
    <div class="pt-20">
      <app-cases-list></app-cases-list>
    </div>
  `
})
export class CaseStudiesPageComponent {}
