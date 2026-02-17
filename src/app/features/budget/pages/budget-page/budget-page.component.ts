import { Component } from '@angular/core';
import { QuoteFormComponent } from '@shared';

@Component({
  selector: 'app-budget-page',
  standalone: true,
  imports: [QuoteFormComponent],
  template: `
    <div class="pt-20">
      <app-quote-form (formSubmitted)="onFormSubmitted()"></app-quote-form>
    </div>
  `
})
export class BudgetPageComponent {
  onFormSubmitted() {
    // Handle form submission, e.g., navigate or show success
    console.log('Form submitted');
  }
}
