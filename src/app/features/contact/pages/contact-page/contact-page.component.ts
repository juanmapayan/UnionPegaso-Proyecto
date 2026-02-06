import { Component } from '@angular/core';
import { ContactInfoComponent } from '../../components/contact-info/contact-info.component';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [ContactInfoComponent],
  template: `
    <div class="pt-20">
      <app-contact-info></app-contact-info>
    </div>
  `
})
export class ContactPageComponent {}
