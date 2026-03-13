import { Component } from '@angular/core';
import { ServicesListComponent } from '../../components/services-list/services-list.component';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [ServicesListComponent],
  template: `
    <div class="pt-20">
      <app-services-list></app-services-list>
    </div>
  `
})
export class ServicesPageComponent {}
