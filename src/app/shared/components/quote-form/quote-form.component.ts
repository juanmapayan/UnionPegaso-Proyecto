import { Component, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './quote-form.component.html',
  styles: [`
    .bg-purple-500-10 { background-color: rgba(168, 85, 247, 0.1); }
    .bg-white-5 { background-color: rgba(255, 255, 255, 0.05); }
    .border-white-10 { border-color: rgba(255, 255, 255, 0.1); }
  `]
})
export class QuoteFormComponent {
  formSubmitted = output<void>();
  quoteForm: FormGroup;
  isSending = signal(false);
  submitted = false;
  estimatedBudget = signal<string>('Selecciona servicios');

  services = [
    { id: 'seo', name: 'SEO & Posicionamiento', desc: 'Auditoría técnica, contenidos y enlaces para crecer en orgánico.' },
    { id: 'sem', name: 'Publicidad (SEM)', desc: 'Campañas de pago con foco en ROI en Google, Meta o LinkedIn.' },
    { id: 'social', name: 'Redes Sociales', desc: 'Gestión y contenido para comunidad, alcance y engagement.' },
    { id: 'content', name: 'Marketing de Contenidos', desc: 'Estrategia editorial, calendarización y distribución multicanal.' },
    { id: 'web', name: 'Diseño Web & UX', desc: 'Landing pages y sitios rápidos, seguros y orientados a conversión.' },
    { id: 'email', name: 'Email Marketing', desc: 'Automatizaciones, newsletters y segmentación para LTV.' }
  ];

  constructor(private fb: FormBuilder) {
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
      this.estimatedBudget.set('500€ - 900€');
      this.quoteForm.patchValue({ budget: '500-900' }, { emitEvent: false });
    } else if (count <= 5) {
      this.estimatedBudget.set('1.000€ - 1.500€');
      this.quoteForm.patchValue({ budget: '1000-1500' }, { emitEvent: false });
    } else {
      this.estimatedBudget.set('1.700€ - 2.300€');
      this.quoteForm.patchValue({ budget: '1700-2300' }, { emitEvent: false });
    }
  }

  onServiceChange(event: any, id: string) {
    const currentServices = [...(this.quoteForm.get('services')?.value as string[] || [])];
    if (event.target.checked) {
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

  onSubmit() {
    this.submitted = true;
    if (this.quoteForm.valid) {
      this.isSending.set(true);
      // Simulate API call
      setTimeout(() => {
        this.isSending.set(false);
        this.formSubmitted.emit();
        alert('Solicitud enviada con éxito. Nos pondremos en contacto contigo pronto.');
        this.quoteForm.reset();
        this.submitted = false;
      }, 1500);
    }
  }
}