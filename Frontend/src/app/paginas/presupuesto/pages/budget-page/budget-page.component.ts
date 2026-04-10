import { Component } from '@angular/core';
import { QuoteFormComponent } from '@compartido';

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
    // Manejar envío del formulario, ej. navegar o mostrar éxito
    console.log('Form submitted');
  }
}
