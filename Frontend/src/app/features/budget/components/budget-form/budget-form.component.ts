import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LeadService } from '@core/services/lead.service';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './budget-form.component.html',
  styles: [`
    .bg-purple-500-10 { background-color: rgba(168, 85, 247, 0.1); }
    .bg-white-5 { background-color: rgba(255, 255, 255, 0.05); }
    .border-white-10 { border-color: rgba(255, 255, 255, 0.1); }
  `]
})
export class BudgetFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly leadService = inject(LeadService);
  private readonly router = inject(Router);
  
  quoteForm: FormGroup;
  isSending = signal(false);
  submitted = false;
  estimatedBudget = signal<string>('Selecciona servicios');

  services = [
    { id: 'seo', name: 'SEO & Posicionamiento' },
    { id: 'sem', name: 'Publicidad (SEM)' },
    { id: 'social', name: 'Redes Sociales' },
    { id: 'content', name: 'Marketing de Contenidos' },
    { id: 'web', name: 'Diseño Web & UX' },
    { id: 'email', name: 'Email Marketing' }
  ];

  constructor() {
    this.quoteForm = this.fb.group({
      services: [[], Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      company: [''],
      budget: [''],
      details: [''],
      privacy: [false, Validators.requiredTrue]
    });
    
    // Actualizar presupuesto automáticamente cuando cambien los servicios
    this.quoteForm.get('services')?.valueChanges.subscribe((services: string[]) => {
      this.updateEstimatedBudget(services);
    });
    
    // Inicializar con valor por defecto
    this.updateEstimatedBudget([]);
  }

  updateEstimatedBudget(services: string[]): void {
    const count = services.length;
    
    if (count === 0) {
      this.estimatedBudget.set('Selecciona servicios');
      this.quoteForm.patchValue({ budget: '' }, { emitEvent: false });
    } else if (count <= 2) {
      this.estimatedBudget.set('1.000€ - 3.000€');
      this.quoteForm.patchValue({ budget: '1k-3k' }, { emitEvent: false });
    } else if (count <= 5) {
      this.estimatedBudget.set('3.000€ - 10.000€');
      this.quoteForm.patchValue({ budget: '3k-10k' }, { emitEvent: false });
    } else {
      this.estimatedBudget.set('Más de 10.000€');
      this.quoteForm.patchValue({ budget: '10k+' }, { emitEvent: false });
    }
  }

  onServiceChange(event: Event, id: string): void {
    const target = event.target as HTMLInputElement;
    const currentServices = [...(this.quoteForm.get('services')?.value as string[] || [])];
    
    if (target.checked) {
      if (!currentServices.includes(id)) {
        currentServices.push(id);
      }
    } else {
      const index = currentServices.indexOf(id);
      if (index > -1) {
        currentServices.splice(index, 1);
      }
    }
    
    this.quoteForm.patchValue({ services: currentServices });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.quoteForm.valid) {
      this.isSending.set(true);
      
      this.leadService.submitLead(this.quoteForm.value).subscribe({
        next: (response) => {
          this.isSending.set(false);
          if (response.success) {
            alert('Solicitud enviada con éxito. Nos pondremos en contacto contigo pronto.');
            this.quoteForm.reset();
            this.submitted = false;
            this.router.navigate(['/']);
          }
        },
        error: () => {
          this.isSending.set(false);
          alert('Error al enviar. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }
}
