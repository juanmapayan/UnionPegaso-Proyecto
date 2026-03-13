import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentService, PortfolioItem } from '../../services/content.service';

@Component({
  selector: 'app-portfolio-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-white mb-1">Portfolio</h2>
          <p class="text-gray-400">Gestiona tus trabajos recientes</p>
        </div>
        <button
          (click)="openNewPortfolioForm()"
          class="btn btn-primary"
        >
          + Nuevo Proyecto
        </button>
      </div>

      <!-- Portfolio List -->
      <div class="grid gap-4">
        <div *ngFor="let item of portfolioItems()" class="p-6 bg-[#1a1a1a] border border-gray-700 rounded-lg hover:border-[#c084fc] transition-all group">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white mb-2">{{ item.title }}</h3>
              <p class="text-gray-300 text-sm mb-3">{{ item.description }}</p>
              <div class="flex items-center gap-4 text-xs text-gray-400">
                <span>Tipo: {{ item.type === 'image' ? '🖼️ Imagen' : '🎥 Video' }}</span>
                <span *ngIf="item.client">Cliente: {{ item.client }}</span>
              </div>
              <div class="mt-3 flex gap-2">
                <span *ngFor="let tag of item.tags" class="px-2 py-1 bg-[#0f0f0f] text-xs text-gray-300 rounded">
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                (click)="editPortfolioItem(item)"
                class="px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/20 transition-colors"
              >
                Editar
              </button>
              <button
                (click)="deletePortfolioItem(item.id)"
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
              {{ editingItem() ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
            </h3>
            <button
              (click)="closeForm()"
              class="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form [formGroup]="portfolioForm" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
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
                rows="4"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              ></textarea>
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
              <select
                formControlName="type"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              >
                <option value="image">Imagen</option>
                <option value="video">Video</option>
              </select>
            </div>

            <!-- URL -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">URL de Imagen/Video</label>
              <input
                type="url"
                formControlName="url"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Poster (for videos) -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Poster/Thumbnail URL</label>
              <input
                type="url"
                formControlName="poster"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Client -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Cliente</label>
              <input
                type="text"
                formControlName="client"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Tags (separadas por comas)</label>
              <input
                type="text"
                formControlName="tags"
                placeholder="ej: diseño, marketing, web"
                class="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#c084fc]"
              />
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                type="submit"
                [disabled]="!portfolioForm.valid || isSubmitting()"
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
export class PortfolioEditorComponent {
  private fb = inject(FormBuilder);
  private contentService = inject(ContentService);

  portfolioItems = signal<PortfolioItem[]>([]);
  showForm = signal(false);
  editingItem = signal<PortfolioItem | null>(null);
  isSubmitting = signal(false);

  portfolioForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    type: ['image', Validators.required],
    url: ['', Validators.required],
    poster: [''],
    client: [''],
    tags: ['']
  });

  constructor() {
    this.loadPortfolioItems();
  }

  loadPortfolioItems() {
    this.contentService.getPortfolioItems().then(data => {
      this.portfolioItems.set(data);
    });
  }

  openNewPortfolioForm() {
    this.editingItem.set(null);
    this.portfolioForm.reset({ type: 'image' });
    this.showForm.set(true);
  }

  editPortfolioItem(item: PortfolioItem) {
    this.editingItem.set(item);
    this.portfolioForm.patchValue({
      ...item,
      tags: item.tags?.join(', ') || ''
    });
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingItem.set(null);
    this.portfolioForm.reset({ type: 'image' });
  }

  async onSubmit() {
    if (!this.portfolioForm.valid) return;

    this.isSubmitting.set(true);
    try {
      const formValue = this.portfolioForm.value;
      const data: PortfolioItem = {
        id: this.editingItem()?.id || '',
        title: formValue.title || '',
        description: formValue.description || '',
        type: (formValue.type as 'image' | 'video') || 'image',
        url: formValue.url || '',
        poster: formValue.poster || '',
        client: formValue.client || '',
        tags: formValue.tags ? formValue.tags.split(',').map(t => t.trim()) : [],
        created_at: this.editingItem()?.created_at || new Date().toISOString()
      };

      if (this.editingItem()) {
        await this.contentService.updatePortfolioItem(data.id, data);
      } else {
        await this.contentService.createPortfolioItem(data);
      }

      this.loadPortfolioItems();
      this.closeForm();
    } catch (error) {
      console.error('Error saving portfolio item:', error);
      alert('Error al guardar el proyecto');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deletePortfolioItem(id: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return;

    try {
      await this.contentService.deletePortfolioItem(id);
      this.loadPortfolioItems();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      alert('Error al eliminar el proyecto');
    }
  }
}
