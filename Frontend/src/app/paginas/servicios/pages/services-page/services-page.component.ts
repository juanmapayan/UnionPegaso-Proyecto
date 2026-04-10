import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicesService } from '../../servicios.service';
import { CartService } from '../../../../nucleo/servicios/cart.service';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-black pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(88,28,135,0.15),transparent_50%)]"></div>
      
      <div class="max-w-7xl mx-auto relative z-10">
        <!-- Header Section -->
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4 animate-fade-in-down">
            Nuestros Servicios
          </h1>
          <p class="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Soluciones digitales de alto impacto diseñadas para escalar tu negocio.
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="flex flex-col justify-center items-center h-64 space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 shadow-lg shadow-purple-500/50"></div>
          <span class="text-purple-400 text-sm font-medium animate-pulse">Cargando servicios...</span>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-900/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl relative mb-8 backdrop-blur-sm shadow-lg shadow-red-900/20 max-w-2xl mx-auto" role="alert">
          <div class="flex items-center space-x-3">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
            <span class="block sm:inline font-medium">{{ error() }}</span>
          </div>
        </div>

        <!-- Services Grid -->
        <div *ngIf="!loading() && !error()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let service of services()" 
               class="group relative bg-[rgba(20,12,30,0.55)] backdrop-blur-md border border-purple-500/20 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
            
            <!-- Card Body -->
            <div class="p-8 flex-grow relative z-10">
              <div class="flex justify-between items-start mb-6">
                <h2 class="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300 line-clamp-1" title="{{ service.title }}">
                  {{ service.title }}
                </h2>
                <span class="bg-purple-900/40 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full border border-purple-500/30 shadow-sm whitespace-nowrap ml-4">
                  #{{ service.id }}
                </span>
              </div>
              <p class="text-slate-300/80 leading-relaxed text-sm mb-6 line-clamp-4 font-light">
                {{ service.description }}
              </p>
            </div>
            
            <!-- Card Footer -->
            <div class="px-8 py-6 bg-black/20 border-t border-purple-500/10 flex items-center justify-between mt-auto relative z-10">
              <div class="flex flex-col">
                <span class="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Precio</span>
                <span class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  {{ service.price }}€
                </span>
              </div>
              <button 
                (click)="addToCart(service)"
                [disabled]="isAdded(service.id)"
                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg shadow-purple-500/20 transform transition-all duration-300 active:scale-95 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none min-w-[100px] flex justify-center items-center">
                <span *ngIf="!isAdded(service.id)">Añadir</span>
                <span *ngIf="isAdded(service.id)" class="flex items-center gap-2 animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Añadido
                </span>
              </button>
            </div>

            <!-- Decorative Glow -->
            <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && !error() && services().length === 0" class="text-center py-24 bg-[rgba(20,12,30,0.3)] rounded-3xl border border-purple-500/10 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p class="text-xl text-slate-400 font-medium">No hay servicios disponibles por el momento.</p>
          <p class="text-slate-600 mt-2">Vuelve a intentarlo más tarde.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ServicesPageComponent implements OnInit {
  private servicesService = inject(ServicesService);
  private cartService = inject(CartService);

  services = signal<Service[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Track added state for button feedback
  addedStates = signal<Map<number, boolean>>(new Map());

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading.set(true);
    this.servicesService.getServices().subscribe({
      next: (data) => {
        console.log('ServicesPage: Data received:', data); // Log received data
        this.services.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('ServicesPage: Error in subscribe:', err); // Log actual error
        this.error.set('No se pudieron cargar los servicios. Por favor, inténtelo de nuevo más tarde.');
        this.loading.set(false);
      }
    });
  }

  addToCart(service: Service) {
    this.cartService.addToCart(service);

    // Show feedback
    this.setAddedState(service.id, true);

    // Reset after 1 second
    setTimeout(() => {
      this.setAddedState(service.id, false);
    }, 1000);
  }

  isAdded(id: number): boolean {
    return this.addedStates().get(id) || false;
  }

  private setAddedState(id: number, state: boolean) {
    this.addedStates.update(map => {
      const newMap = new Map(map);
      newMap.set(id, state);
      return newMap;
    });
  }
}
