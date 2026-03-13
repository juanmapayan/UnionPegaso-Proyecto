import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentService, CaseStudy } from '../../services/content.service';

@Component({
  selector: 'app-case-studies-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-white mb-1">Casos de Éxito</h2>
          <p class="text-gray-400">Gestiona tus casos de estudio</p>
        </div>
        <button
          (click)="openNewCaseForm()"
          class="btn btn-primary"
        >
          + Nuevo Caso
        </button>
      </div>

      <!-- Cases List -->
      <div class="grid gap-4">
        <div *ngFor="let caseStudy of caseStudies()" class="p-6 bg-[#1a1a1a] border border-gray-700 rounded-lg hover:border-[#c084fc] transition-all group">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white mb-2">{{ caseStudy.title }}</h3>
              <p class="text-gray-300 text-sm mb-3">{{ caseStudy.description }}</p>
              <div class="space-y-2 text-sm text-gray-400 mb-3">
                <p *ngIf="caseStudy.company">Cliente: <span class="text-gray-300">{{ caseStudy.company }}</span></p>
                <p *ngIf="caseStudy.industry">Industria: <span class="text-gray-300">{{ caseStudy.industry }}</span></p>
                <p *ngIf="caseStudy.result">Resultado: <span class="text-green-400">{{ caseStudy.result }}</span></p>
              </div>
              <div *ngIf="caseStudy.challenges" class="mt-3">
                <p class="text-xs text-gray-400 mb-2">Desafíos:</p>
                <p class="text-sm text-gray-300">{{ caseStudy.challenges }}</p>
              </div>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                (click)="editCase(caseStudy)"
                class="px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/20 transition-colors"
              >
                Editar
              </button>
              <button
                (click)="deleteCase(caseStudy.id)"
                class="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/20 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for edit/create -->
      <div *ngIf="showForm()" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-[#1a1a1a] border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-[#1a1a1a] border-b border-gray-700 p-6 flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">
              {{ editingCase() ? 'Editar Caso' : 'Nuevo Caso' }}
            </h3>
            <button
              (click)="closeForm()"
              class="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form [formGroup]="caseForm" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Título</label>
              <input
                type="text"
                formControlName="title"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                formControlName="description"
                rows="3"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              ></textarea>
            </div>

            <!-- Company -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Empresa/Cliente</label>
              <input
                type="text"
                formControlName="company"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Industry -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Industria</label>
              <input
                type="text"
                formControlName="industry"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Challenges -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Desafíos</label>
              <textarea
                formControlName="challenges"
                rows="3"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              ></textarea>
            </div>

            <!-- Result -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Resultado</label>
              <textarea
                formControlName="result"
                rows="3"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              ></textarea>
            </div>

            <!-- Image URL -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">URL de Imagen</label>
              <input
                type="url"
                formControlName="image"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                type="submit"
                [disabled]="!caseForm.valid || isSubmitting()"
                class="flex-1 btn btn-primary"
              >
                {{ isSubmitting() ? 'Guardando...' : 'Guardar' }}
              </button>
              <button
                type="button"
                (click)="closeForm()"
                class="flex-1 btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CaseStudiesEditorComponent {
  private fb = inject(FormBuilder);
  private contentService = inject(ContentService);

  caseStudies = signal<CaseStudy[]>([]);
  showForm = signal(false);
  editingCase = signal<CaseStudy | null>(null);
  isSubmitting = signal(false);

  caseForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    company: ['', Validators.required],
    industry: [''],
    challenges: [''],
    result: [''],
    image: ['']
  });

  constructor() {
    this.loadCaseStudies();
  }

  loadCaseStudies() {
    this.contentService.getCaseStudies().then(data => {
      this.caseStudies.set(data);
    });
  }

  openNewCaseForm() {
    this.editingCase.set(null);
    this.caseForm.reset();
    this.showForm.set(true);
  }

  editCase(caseStudy: CaseStudy) {
    this.editingCase.set(caseStudy);
    this.caseForm.patchValue(caseStudy);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingCase.set(null);
    this.caseForm.reset();
  }

  async onSubmit() {
    if (!this.caseForm.valid) return;

    this.isSubmitting.set(true);
    try {
      const formValue = this.caseForm.value;
      const data: CaseStudy = {
        id: this.editingCase()?.id || '',
        title: formValue.title || '',
        description: formValue.description || '',
        company: formValue.company || '',
        industry: formValue.industry || '',
        challenges: formValue.challenges || '',
        result: formValue.result || '',
        image: formValue.image || '',
        created_at: this.editingCase()?.created_at || new Date().toISOString()
      };

      if (this.editingCase()) {
        await this.contentService.updateCaseStudy(data.id, data);
      } else {
        await this.contentService.createCaseStudy(data);
      }

      this.loadCaseStudies();
      this.closeForm();
    } catch (error) {
      console.error('Error saving case study:', error);
      alert('Error al guardar el caso');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteCase(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este caso?')) return;

    try {
      await this.contentService.deleteCaseStudy(id);
      this.loadCaseStudies();
    } catch (error) {
      console.error('Error deleting case study:', error);
      alert('Error al eliminar el caso');
    }
  }
}
