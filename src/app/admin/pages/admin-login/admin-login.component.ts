import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#050505] flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <!-- Logo/Branding -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-[#c084fc] to-[#a855f7] bg-clip-text text-transparent">
            Union Pegaso Admin
          </h1>
          <p class="text-gray-400 mt-2">Gestiona tu contenido</p>
        </div>

        <!-- Login Card -->
        <div class="bg-[#0f0f0f] border border-gray-800 rounded-lg p-8 shadow-2xl">
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-6">
            <!-- Email Input -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                formControlName="email"
                placeholder="admin@example.com"
                class="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c084fc] focus:ring-1 focus:ring-[#c084fc] transition-all"
                [disabled]="isLoading()"
              />
              <div *ngIf="emailError()" class="mt-2 text-sm text-red-400">
                {{ emailError() }}
              </div>
            </div>

            <!-- Password Input -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                formControlName="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#c084fc] focus:ring-1 focus:ring-[#c084fc] transition-all"
                [disabled]="isLoading()"
              />
              <div *ngIf="passwordError()" class="mt-2 text-sm text-red-400">
                {{ passwordError() }}
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="loginError()" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {{ loginError() }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="!loginForm.valid || isLoading()"
              class="w-full btn btn-primary"
            >
              <span *ngIf="!isLoading()">Ingresar</span>
              <span *ngIf="isLoading()" class="inline-flex items-center gap-2">
                <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Ingresando...
              </span>
            </button>

            <!-- Demo Credentials -->
            <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-xs">
              <p class="font-semibold mb-1">Credenciales de Demo:</p>
              <p>Email: <code class="text-blue-200">unionpegaso@gmail.com</code></p>
              <p>Password: <code class="text-blue-200">admin123</code></p>
            </div>
          </form>
        </div>

        <!-- Back Link -->
        <div class="text-center mt-6">
          <a href="/" class="text-sm text-gray-400 hover:text-[#c084fc] transition-colors">
            ← Volver al sitio
          </a>
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
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = signal(false);
  loginError = signal('');

  emailError = () => {
    const control = this.loginForm.get('email');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'El email es requerido';
    if (control.hasError('email')) return 'Email inválido';
    return '';
  };

  passwordError = () => {
    const control = this.loginForm.get('password');
    if (!control?.touched) return '';
    if (control.hasError('required')) return 'La contraseña es requerida';
    if (control.hasError('minlength')) return 'Mínimo 6 caracteres';
    return '';
  };

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onLogin() {
    if (!this.loginForm.valid) return;

    this.isLoading.set(true);
    this.loginError.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login(email || '', password || '').then(() => {
      this.isLoading.set(false);
      this.router.navigate(['/admin/dashboard']);
    }).catch((error: any) => {
      this.isLoading.set(false);
      this.loginError.set(error.message || 'Error al iniciar sesión');
    });
  }
}
