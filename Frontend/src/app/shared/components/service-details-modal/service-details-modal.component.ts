import { Component, input, output, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceDetail } from '../../../core/services';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-service-details-modal',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    @if (isOpen()) {
      <div 
        class="modal-overlay"
        role="dialog" 
        aria-modal="true"
        [attr.aria-labelledby]="'modal-title-' + service()?.id"
        (click)="onOverlayClick($event)"
        (keydown.escape)="close()">
        
        <div class="modal-panel" (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="modal-header">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <app-svg-icon [name]="service()?.icon || 'search'"></app-svg-icon>
                </div>
                <div>
                  <h2 [id]="'modal-title-' + service()?.id" class="text-2xl font-bold text-white mb-2">
                    {{ service()?.title }}
                  </h2>
                  <div class="flex gap-2">
                    @for (tag of service()?.tags; track tag) {
                      <span class="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">
                        {{ tag }}
                      </span>
                    }
                  </div>
                </div>
              </div>
              <button 
                #closeButton
                (click)="close()" 
                class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Cerrar modal">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <p class="text-gray-300 leading-relaxed">
              {{ service()?.description }}
            </p>
          </div>
          
          <!-- Content -->
          <div class="modal-content">
            
            <!-- Typical Result -->
            <div class="mb-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
              <p class="text-xs text-purple-400 uppercase tracking-wider mb-1 font-semibold">Resultados típicos</p>
              <p class="text-white font-medium">{{ service()?.typicalResult }}</p>
            </div>
            
            <!-- What's Included -->
            <div class="mb-6">
              <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Qué incluye
              </h3>
              <ul class="space-y-2">
                @for (item of service()?.bullets; track item) {
                  <li class="flex items-start text-sm text-gray-300">
                    <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></span>
                    <span>{{ item }}</span>
                  </li>
                }
              </ul>
            </div>
            
            <!-- Deliverables -->
            <div class="mb-6">
              <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Entregables
              </h3>
              <ul class="space-y-2">
                @for (deliverable of service()?.deliverables; track deliverable) {
                  <li class="flex items-start text-sm text-gray-300">
                    <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></span>
                    <span>{{ deliverable }}</span>
                  </li>
                }
              </ul>
            </div>
            
            <!-- Timeline & Ideal For Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Plazo típico
                </h3>
                <p class="text-gray-300 text-sm">{{ service()?.timeline }}</p>
              </div>
              
              <div>
                <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Ideal para
                </h3>
                <ul class="space-y-1">
                  @for (target of service()?.idealFor; track target) {
                    <li class="text-sm text-gray-300">• {{ target }}</li>
                  }
                </ul>
              </div>
            </div>
            
          </div>
          
          <!-- Footer CTA -->
          <div class="modal-footer">
            <button 
              (click)="requestQuote()"
              class="btn btn-primary btn-lg w-full btn-arrow">
              Solicitar presupuesto <span class="arrow">→</span>
            </button>
          </div>
          
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 1rem;
      overflow-y: auto;
      overflow-x: hidden;
      max-height: 100vh;
      will-change: opacity, backdrop-filter;
    }
    
    .modal-panel {
      position: relative;
      width: 100%;
      max-width: 720px;
      max-height: calc(100vh - 2rem);
      background: linear-gradient(to bottom right, rgba(15, 15, 15, 0.98), rgba(10, 10, 10, 0.98));
      border: 1px solid rgba(168, 85, 247, 0.2);
      border-radius: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.25);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      will-change: transform, opacity;
    }
    
    .modal-header {
      padding: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .modal-content {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
    
    .modal-footer {
      padding: 1.5rem 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(0, 0, 0, 0.2);
    }
    
    
    /* Accessibility: Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .modal-overlay,
      .modal-panel {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }
    
    /* Scrollbar styling */
    .modal-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .modal-content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }
    
    .modal-content::-webkit-scrollbar-thumb {
      background: rgba(168, 85, 247, 0.3);
      border-radius: 4px;
    }
    
    .modal-content::-webkit-scrollbar-thumb:hover {
      background: rgba(168, 85, 247, 0.5);
    }
  `]
})
export class ServiceDetailsModalComponent implements OnDestroy {
  service = input<ServiceDetail | null>(null);
  isOpen = input<boolean>(false);
  closed = output<void>();
  
  private focusedElementBeforeOpen?: HTMLElement;
  
  constructor(private router: Router) {
    effect(() => {
      if (this.isOpen()) {
        this.onOpen();
      } else {
        this.onClose();
      }
    });
  }
  
  private onOpen() {
    // Store currently focused element
    this.focusedElementBeforeOpen = document.activeElement as HTMLElement;
    
    // Block body scroll using class (avoids layout shift)
    document.body.classList.add('modal-open');
    
    // Focus close button after animation
    setTimeout(() => {
      const closeButton = document.querySelector('[aria-label="Cerrar modal"]') as HTMLElement;
      closeButton?.focus();
    }, 300);
  }
  
  private onClose() {
    // Restore body scroll using class
    document.body.classList.remove('modal-open');
    
    // Restore focus to trigger element
    if (this.focusedElementBeforeOpen) {
      setTimeout(() => {
        this.focusedElementBeforeOpen?.focus();
      }, 100);
    }
  }
  
  close() {
    this.closed.emit();
  }
  
  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
  
  requestQuote() {
    this.close();
    this.router.navigate(['/presupuesto']);
  }
  
  ngOnDestroy() {
    // Ensure body scroll is restored and modal-open class is removed
    document.body.classList.remove('modal-open');
  }
}
