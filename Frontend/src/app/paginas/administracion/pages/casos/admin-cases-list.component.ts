import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface SuccessCase {
    id: number;
    title: string;
    description: string;
    client: string;
    image_url: string;
    visible: number;
    created_at: string;
}

@Component({
    selector: 'app-admin-cases-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Casos de Éxito</h2>
        <button (click)="openCreateModal()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Caso
        </button>
      </div>

      <!-- List -->
      <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-400">
                <thead class="bg-purple-500/10 text-purple-300 uppercase font-medium">
                    <tr>
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">Título</th>
                        <th class="px-6 py-4">Cliente</th>
                        <th class="px-6 py-4">Visibilidad</th>
                        <th class="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-purple-500/10">
                    @for (caseItem of cases(); track caseItem.id) {
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 font-mono text-xs">{{ caseItem.id }}</td>
                            <td class="px-6 py-4 font-medium text-white">{{ caseItem.title }}</td>
                            <td class="px-6 py-4">{{ caseItem.client }}</td>
                            <td class="px-6 py-4">
                                <span [class]="'px-2 py-1 rounded-full text-xs ' + (caseItem.visible ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400')">
                                    {{ caseItem.visible ? 'Visible' : 'Oculto' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
                                <button (click)="openEditModal(caseItem)" class="text-blue-400 hover:text-blue-300 transition-colors">Editar</button>
                                <button (click)="deleteCase(caseItem.id)" class="text-red-400 hover:text-red-300 transition-colors">Eliminar</button>
                            </td>
                        </tr>
                    } @empty {
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500">No hay casos registrados.</td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div class="bg-[#1a1025] border border-purple-500/20 rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                <h3 class="text-xl font-bold text-white mb-4">{{ isEditing() ? 'Editar Caso' : 'Nuevo Caso' }}</h3>
                
                <form [formGroup]="caseForm" (ngSubmit)="onSubmit()" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Título</label>
                        <input type="text" formControlName="title" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Cliente</label>
                        <input type="text" formControlName="client" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                        <textarea formControlName="description" rows="3" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"></textarea>
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">URL Imagen</label>
                        <input type="text" formControlName="image_url" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
                    </div>
                    <div class="flex items-center pt-2">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" formControlName="visible" class="form-checkbox bg-black/30 border-purple-500/20 text-purple-600 rounded">
                            <span class="text-sm text-gray-400">Visible en web</span>
                        </label>
                    </div>

                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancelar</button>
                        <button type="submit" [disabled]="caseForm.invalid || loading()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50">
                            {{ loading() ? 'Guardando...' : 'Guardar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      }
    </div>
  `
})
export class AdminCasesListComponent implements OnInit {
    http = inject(HttpClient);
    fb = inject(FormBuilder);

    cases = signal<SuccessCase[]>([]);
    showModal = signal(false);
    isEditing = signal(false);
    currentId = signal<number | null>(null);
    loading = signal(false);

    caseForm = this.fb.group({
        title: ['', Validators.required],
        description: [''],
        client: [''],
        image_url: [''],
        visible: [true]
    });

    private apiUrl = 'http://localhost:8000/api/administracion/cases';

    ngOnInit() {
        this.loadCases();
    }

    loadCases() {
        this.http.get<SuccessCase[]>(this.apiUrl, { withCredentials: true }).subscribe({
            next: (data) => this.cases.set(data),
            error: (err) => console.error('Error loading cases', err)
        });
    }

    openCreateModal() {
        this.isEditing.set(false);
        this.currentId.set(null);
        this.caseForm.reset({ visible: true });
        this.showModal.set(true);
    }

    openEditModal(caseItem: SuccessCase) {
        this.isEditing.set(true);
        this.currentId.set(caseItem.id);
        this.caseForm.patchValue({
            title: caseItem.title,
            description: caseItem.description,
            client: caseItem.client,
            image_url: caseItem.image_url,
            visible: !!caseItem.visible
        });
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
    }

    onSubmit() {
        if (this.caseForm.invalid) return;

        this.loading.set(true);
        const data = this.caseForm.value;

        const request = this.isEditing()
            ? this.http.patch(`${this.apiUrl}/${this.currentId()}`, data, { withCredentials: true })
            : this.http.post(this.apiUrl, data, { withCredentials: true });

        request.subscribe({
            next: () => {
                this.loading.set(false);
                this.closeModal();
                this.loadCases();
            },
            error: (err) => {
                this.loading.set(false);
                console.error('Error saving case', err);
                alert('Error al guardar el caso: ' + (err.error?.error || 'Error desconocido'));
            }
        });
    }

    deleteCase(id: number) {
        if (!confirm('¿Estás seguro de eliminar este caso de éxito?')) return;

        this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true }).subscribe({
            next: () => this.loadCases(),
            error: (err) => {
                console.error('Error deleting case', err);
                alert('Error al eliminar caso');
            }
        });
    }
}
