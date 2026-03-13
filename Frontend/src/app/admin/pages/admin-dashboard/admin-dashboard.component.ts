import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505]">
      <!-- Header -->
      <header class="border-b border-gray-800 bg-[#0f0f0f]/50 backdrop-blur-sm sticky top-0 z-40">
        <div class="px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold text-white">Admin Dashboard</h1>
            <span class="text-sm text-gray-400">{{ currentUser()?.email }}</span>
          </div>
          <button
            (click)="onLogout()"
            class="px-4 py-2 text-sm bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div class="flex">
        <!-- Sidebar Navigation -->
        <aside class="w-64 border-r border-gray-800 min-h-[calc(100vh-70px)] bg-[#0a0a0a]/50">
          <nav class="p-6 space-y-2">
            <a
              routerLink="/admin/dashboard/services"
              routerLinkActive="active"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c084fc] transition-all group"
            >
              <span class="text-xl">⚙️</span>
              <span>Servicios</span>
            </a>

            <a
              routerLink="/admin/dashboard/portfolio"
              routerLinkActive="active"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c084fc] transition-all"
            >
              <span class="text-xl">🖼️</span>
              <span>Portfolio</span>
            </a>

            <a
              routerLink="/admin/dashboard/case-studies"
              routerLinkActive="active"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#1a1a1a] hover:text-[#c084fc] transition-all"
            >
              <span class="text-xl">📚</span>
              <span>Casos de Éxito</span>
            </a>
          </nav>

          <!-- Quick Stats -->
          <div class="p-6 space-y-4 border-t border-gray-800">
            <h3 class="text-sm font-semibold text-gray-300 mb-4">Estadísticas</h3>
            <div class="space-y-3">
              <div class="p-3 bg-[#1a1a1a] rounded-lg">
                <p class="text-xs text-gray-400">Servicios</p>
                <p class="text-2xl font-bold text-[#c084fc]">{{ servicesCount() }}</p>
              </div>
              <div class="p-3 bg-[#1a1a1a] rounded-lg">
                <p class="text-xs text-gray-400">Portfolio</p>
                <p class="text-2xl font-bold text-[#c084fc]">{{ portfolioCount() }}</p>
              </div>
              <div class="p-3 bg-[#1a1a1a] rounded-lg">
                <p class="text-xs text-gray-400">Casos</p>
                <p class="text-2xl font-bold text-[#c084fc]">{{ casesCount() }}</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-h-[calc(100vh-70px)]">
          <div class="p-8">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    a.active {
      @apply bg-[#1a1a1a] text-[#c084fc] border-l-2 border-[#c084fc];
    }
  `]
})
export class AdminDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  servicesCount = signal(0);
  portfolioCount = signal(0);
  casesCount = signal(0);

  constructor() {
    // Aquí cargarías las estadísticas desde el servicio de contenido
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
