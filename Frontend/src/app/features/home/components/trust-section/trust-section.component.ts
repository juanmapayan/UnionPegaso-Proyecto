import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '@shared';

@Component({
  selector: 'app-trust-section',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    <div class="relative py-32 overflow-hidden">
      <!-- Dramatic Background -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15),transparent_70%)]"></div>
      
      <!-- Animated Grid Pattern -->
      <div class="absolute inset-0 opacity-[0.03]" 
           style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>

      <div class="container mx-auto px-6 relative z-10">
        
        <!-- Main Statement -->
        <div class="text-center max-w-4xl mx-auto mb-20">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm font-medium mb-6 animate-in fade-in duration-700">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Certificación Google Partner & Meta Business Partner
          </div>
          
          <h2 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Resultados que <span class="text-gradient">hablan por sí solos</span>
          </h2>
          <p class="text-xl text-gray-400 leading-relaxed">
            Más de 120 empresas confían en nosotros para escalar sus negocios digitalmente
          </p>
        </div>

        <!-- Key Metrics Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          @for (metric of keyMetrics; track metric.value; let i = $index) {
            <div appScrollReveal [delay]="i * 150" class="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(124,58,237,0.3)] group">
              <div class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-blue-400 mb-2 group-hover:scale-110 transition-transform">
                {{ metric.value }}
              </div>
              <div class="text-sm text-gray-400 uppercase tracking-wider">{{ metric.label }}</div>
              <div class="mt-3 text-xs text-gray-500">{{ metric.detail }}</div>
            </div>
          }
        </div>

        <!-- Certifications & Logos -->
        <div class="glass-panel rounded-2xl p-10">
          <div class="text-center mb-10">
            <h3 class="text-2xl font-bold text-white mb-2">Partners oficiales</h3>
            <p class="text-gray-400">Trabajamos con las mejores plataformas del mercado</p>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            @for (partner of partners; track partner) {
              <div class="text-gray-400 font-semibold text-lg hover:text-white hover:scale-110 transition-all cursor-pointer">
                {{ partner }}
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .text-gradient {
      background: linear-gradient(to right, #c084fc, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  `]
})
export class TrustSectionComponent {
  keyMetrics = [
    { value: '+380%', label: 'ROI Medio', detail: 'En campañas de Meta Ads' },
    { value: '50M+', label: 'Impresiones', detail: 'Mensuales gestionadas' },
    { value: '120+', label: 'Clientes', detail: 'Activos y satisfechos' },
    { value: '24/7', label: 'Soporte', detail: 'Equipo dedicado' }
  ];

  partners = [
    'Google Partner',
    'Meta Business',
    'HubSpot',
    'Shopify Plus'
  ];
}
