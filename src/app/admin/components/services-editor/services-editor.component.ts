import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentService, Service } from '../../services/content.service';

@Component({
  selector: 'app-services-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-white mb-1">Servicios</h2>
          <p class="text-gray-400">Gestiona los servicios ofrecidos</p>
        </div>
        <button
          (click)="openNewServiceForm()"
          class="btn btn-primary"
        >
          + Nuevo Servicio
        </button>
      </div>

      <!-- Services List -->
      <div class="grid gap-4">
        <div *ngFor="let service of services()" class="p-6 bg-[#1a1a1a] border border-gray-700 rounded-lg hover:border-[#c084fc] transition-all group">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">{{ service.icon }}</span>
                <div>
                  <h3 class="text-lg font-semibold text-white">{{ service.name }}</h3>
                  <p class="text-sm text-gray-400">ID: {{ service.id }}</p>
                </div>
              </div>
              <p class="text-gray-300 text-sm mt-3">{{ service.description }}</p>
              <div class="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <span>Precio: \${{ service.price }}</span>
                <span *ngIf="service.duration">Duración: {{ service.duration }}</span>
              </div>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                (click)="editService(service)"
                class="px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/20 transition-colors"
              >
                Editar
              </button>
              <button
                (click)="deleteService(service.id)"
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
              {{ editingService() ? 'Editar Servicio' : 'Nuevo Servicio' }}
            </h3>
            <button
              (click)="closeForm()"
              class="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Icon -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Icono (emoji)</label>
              <input
                type="text"
                formControlName="icon"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                formControlName="description"
                rows="4"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              ></textarea>
            </div>

            <!-- Price -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Precio</label>
                <input
                  type="number"
                  formControlName="price"
                  class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Duración</label>
                <input
                  type="text"
                  formControlName="duration"
                  placeholder="ej: 2 semanas"
                  class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
                />
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                type="submit"
                [disabled]="!serviceForm.valid || isSubmitting()"
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
export class ServicesEditorComponent {
  private fb = inject(FormBuilder);
  private contentService = inject(ContentService);

  services = signal<Service[]>([]);
  showForm = signal(false);
  editingService = signal<Service | null>(null);
  isSubmitting = signal(false);

  serviceForm = this.fb.group({
    name: ['', Validators.required],
    icon: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, Validators.required],
    duration: ['']
  });

  constructor() {
    this.loadServices();
  }

  loadServices() {
    this.contentService.getServices().then(data => {
      this.services.set(data);
    });
  }

  openNewServiceForm() {
    this.editingService.set(null);
    this.serviceForm.reset();
    this.showForm.set(true);
  }

  editService(service: Service) {
    this.editingService.set(service);
    this.serviceForm.patchValue(service);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingService.set(null);
    this.serviceForm.reset();
  }

  async onSubmit() {
    if (!this.serviceForm.valid) return;

    this.isSubmitting.set(true);
    try {
      const formValue = this.serviceForm.value;
      const data: Service = {
        id: this.editingService()?.id || '',
        name: formValue.name || '',
        icon: formValue.icon || '',
        description: formValue.description || '',
        price: formValue.price || 0,
        duration: formValue.duration || '',
        created_at: this.editingService()?.created_at || new Date().toISOString()
      };

      if (this.editingService()) {
        await this.contentService.updateService(data.id, data);
      } else {
        await this.contentService.createService(data);
      }

      this.loadServices();
      this.closeForm();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error al guardar el servicio');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteService(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;

    try {
      await this.contentService.deleteService(id);
      this.loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error al eliminar el servicio');
    }
  }
}
