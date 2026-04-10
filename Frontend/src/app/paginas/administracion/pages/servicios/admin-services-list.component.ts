import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminApiService } from '../../../../nucleo/servicios';

interface Service {
    id: number;
    title: string;
    description: string;
    price: string;
    icon_key: string | null;
    featured: number;
    is_active: boolean | number;
    display_order: number;
    created_at: string;
}

@Component({
    selector: 'app-admin-services-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white">Servicios</h2>
        <button (click)="openCreateModal()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Servicio
        </button>
      </div>

      <!-- List -->
      <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-400">
                <thead class="bg-purple-500/10 text-purple-300 uppercase font-medium">
                    <tr>
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">Orden</th>
                        <th class="px-6 py-4">Título</th>
                        <th class="px-6 py-4">Precio</th>
                        <th class="px-6 py-4">Estado</th>
                        <th class="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-purple-500/10">
                    @for (service of services(); track service.id) {
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 font-mono text-xs">{{ service.id }}</td>
                            <td class="px-6 py-4 font-mono text-xs">{{ service.display_order }}</td>
                            <td class="px-6 py-4 font-medium text-white">{{ service.title }}</td>
                            <td class="px-6 py-4">{{ service.price | currency }}</td>
                            <td class="px-6 py-4">
                                <span [class]="'px-2 py-1 rounded-full text-xs ' + (service.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')">
                                    {{ service.is_active ? 'Activo' : 'Inactivo' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right space-x-2">
                                <button (click)="openEditModal(service)" class="text-blue-400 hover:text-blue-300 transition-colors">Editar</button>
                                <button (click)="deleteService(service.id)" class="text-red-400 hover:text-red-300 transition-colors">Eliminar</button>
                            </td>
                        </tr>
                    } @empty {
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500">No hay servicios registrados.</td>
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
                <h3 class="text-xl font-bold text-white mb-4">{{ isEditing() ? 'Editar Servicio' : 'Nuevo Servicio' }}</h3>
                
                <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Título</label>
                        <input type="text" formControlName="title" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                        <textarea formControlName="description" rows="3" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-400 mb-1">Icono (icon_key)</label>
                        <input type="text" formControlName="icon_key" placeholder="p.ej. code, design, video" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-1">Precio</label>
                            <input type="number" formControlName="price" class="w-full px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
                        </div>
                        <div class="flex items-center pt-6 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-400 mb-1">Orden</label>
                                <input type="number" formControlName="display_order" class="w-20 px-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500">
                            </div>
                            <label class="flex items-center gap-2 cursor-pointer mt-5">
                                <input type="checkbox" formControlName="is_active" class="form-checkbox bg-black/30 border-purple-500/20 text-purple-600 rounded">
                                <span class="text-sm text-gray-400">Activo</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer mt-5">
                                <input type="checkbox" formControlName="featured" class="form-checkbox bg-black/30 border-purple-500/20 text-purple-600 rounded">
                                <span class="text-sm text-gray-400">Destacado</span>
                            </label>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" (click)="closeModal()" class="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancelar</button>
                        <button type="submit" [disabled]="serviceForm.invalid || loading()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50">
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
export class AdminServicesListComponent implements OnInit {
    private adminApi = inject(AdminApiService);
    fb = inject(FormBuilder);

    services = signal<Service[]>([]);
    showModal = signal(false);
    isEditing = signal(false);
    currentId = signal<number | null>(null);
    loading = signal(false);

    serviceForm = this.fb.group({
        title: ['', Validators.required],
        description: [''],
        price: [0, [Validators.required, Validators.min(0)]],
        icon_key: [''],
        is_active: [true],
        featured: [false],
        display_order: [0]
    });

    // Recurso API de servicios admin. Relativo a la base /admin de AdminApiService.
    private readonly resourcePath = 'services';

    ngOnInit() {
        this.loadServices();
    }

    loadServices() {
        this.adminApi.get<Service[]>(this.resourcePath).subscribe({
            next: (data) => this.services.set(data),
            error: (err) => console.error('Error loading services', err)
        });
    }

    openCreateModal() {
        this.isEditing.set(false);
        this.currentId.set(null);
        this.serviceForm.reset({ is_active: true, price: 0, display_order: 0, icon_key: '', featured: false });
        this.showModal.set(true);
    }

    openEditModal(service: Service) {
        this.isEditing.set(true);
        this.currentId.set(service.id);
        this.serviceForm.patchValue({
            title: service.title,
            description: service.description,
            price: parseFloat(service.price),
            icon_key: service.icon_key ?? '',
            is_active: !!service.is_active,
            featured: !!service.featured,
            display_order: service.display_order
        });
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
    }

    onSubmit() {
        if (this.serviceForm.invalid) return;

        this.loading.set(true);
        const data = this.serviceForm.value;

        const request = this.isEditing()
            ? this.adminApi.patch(`${this.resourcePath}/${this.currentId()}`, data)
            : this.adminApi.post(this.resourcePath, data);

        request.subscribe({
            next: () => {
                this.loading.set(false);
                this.closeModal();
                this.loadServices();
            },
            error: (err) => {
                this.loading.set(false);
                console.error('Error saving service', err);
                alert('Error al guardar el servicio: ' + (err.error?.error || 'Error desconocido'));
            }
        });
    }

    deleteService(id: number) {
        if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

        this.adminApi.delete(`${this.resourcePath}/${id}`).subscribe({
            next: () => this.loadServices(),
            error: (err) => {
                console.error('Error deleting service', err);
                alert('Error al eliminar servicio');
            }
        });
    }
}
