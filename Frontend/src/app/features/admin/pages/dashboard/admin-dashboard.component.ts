import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div>
        <h2 class="text-3xl font-bold text-white mb-6">Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl p-6">
                <h3 class="text-gray-400 text-sm font-medium">Servicios Activos</h3>
                <p class="text-3xl font-bold text-white mt-2">--</p>
            </div>
            <div class="bg-[rgba(20,12,30,0.55)] border border-purple-500/20 rounded-xl p-6">
                <h3 class="text-gray-400 text-sm font-medium">Casos de Éxito</h3>
                <p class="text-3xl font-bold text-white mt-2">--</p>
            </div>
        </div>
        
        <div class="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200">
        <p><strong>Panel corporativo inicial</strong>: aquí solo se gestiona el contenido público activo de la web: servicios y casos de éxito.</p>       
    </div>
  `
})
export class AdminDashboardComponent { }
