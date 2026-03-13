import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-black pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(88,28,135,0.15),transparent_50%)]"></div>

      <div class="relative z-10 max-w-4xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
          <p class="text-gray-400">Gestiona tu información personal y seguridad</p>
        </div>

        <!-- Main Info Card -->
        <div class="bg-[rgba(20,12,30,0.55)] backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          <div class="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 border-b border-purple-500/10 pb-8">
            <div class="w-24 h-24 rounded-full bg-purple-600/20 flex items-center justify-center text-4xl text-purple-400 font-bold border border-purple-500/30">
              {{ userInitial() }}
            </div>
            <div class="text-center md:text-left">
              <h2 class="text-2xl font-bold text-white">{{ currentUser()?.nombre }}</h2>
              <p class="text-purple-400">{{ currentUser()?.email }}</p>
              <span class="inline-block mt-2 px-3 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-full border border-purple-500/20 uppercase tracking-wide">
                {{ currentUser()?.rol }}
              </span>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            
            <!-- Update Profile Form -->
            <div>
              <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                Información Personal
              </h3>
              
              <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="space-y-4">
                <div>
                  <label for="nombre" class="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                  <input 
                    id="nombre" 
                    type="text" 
                    formControlName="nombre"
                    class="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  >
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Correo Electrónico</label>
                  <input 
                    id="email" 
                    type="email" 
                    formControlName="email"
                    class="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  >
                   @if (profileForm.get('email')?.touched && profileForm.get('email')?.invalid) {
                      <p class="mt-1 text-xs text-red-400">Correo inválido.</p>
                   }
                </div>

                @if (profileMessage()) {
                    <div [class]="'p-3 rounded-lg text-sm ' + (profileError() ? 'bg-red-500/10 text-red-200 border border-red-500/20' : 'bg-green-500/10 text-green-200 border border-green-500/20')">
                        {{ profileMessage() }}
                    </div>
                }

                <button 
                  type="submit" 
                  [disabled]="profileForm.invalid || profileLoading() || profileForm.pristine"
                  class="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                   @if (profileLoading()) {
                      <span class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2"></span>
                      Guardando...
                   } @else {
                      Guardar Cambios
                   }
                </button>
              </form>
            </div>

            <!-- Change Password Form -->
            <div>
              <h3 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                Seguridad
              </h3>

              <form [formGroup]="passwordForm" (ngSubmit)="onUpdatePassword()" class="space-y-4">
                <div>
                  <label for="currentPassword" class="block text-sm font-medium text-gray-300 mb-1">Contraseña Actual</label>
                  <div class="relative">
                    <input 
                      id="currentPassword" 
                      [type]="showCurrentPassword() ? 'text' : 'password'"
                      formControlName="currentPassword"
                      class="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all pr-10"
                      placeholder="••••••••"
                    >
                    <button 
                      type="button"
                      (click)="showCurrentPassword.set(!showCurrentPassword())"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                      [attr.aria-label]="showCurrentPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    >
                      @if (showCurrentPassword()) {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      }
                    </button>
                  </div>
                </div>

                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-300 mb-1">Nueva Contraseña</label>
                  <div class="relative">
                    <input 
                      id="newPassword" 
                      [type]="showNewPassword() ? 'text' : 'password'"
                      formControlName="newPassword"
                      class="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all pr-10"
                      placeholder="Mínimo 8 caracteres"
                    >
                    <button 
                      type="button"
                      (click)="showNewPassword.set(!showNewPassword())"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                      [attr.aria-label]="showNewPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    >
                      @if (showNewPassword()) {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      }
                    </button>
                  </div>
                   @if (passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.invalid) {
                      <div class="mt-1 text-xs text-red-400 space-y-1">
                          <p *ngIf="passwordForm.get('newPassword')?.errors?.['required']">Requerida.</p>
                          <p *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">Mínimo 8 caracteres.</p>
                          <p *ngIf="passwordForm.get('newPassword')?.errors?.['pattern']">Requiere mayúscula, minúscula, número y carácter especial.</p>
                      </div>
                   }
                </div>

                <div>
                  <label for="confirmNewPassword" class="block text-sm font-medium text-gray-300 mb-1">Confirmar Nueva Contraseña</label>
                  <div class="relative">
                    <input 
                      id="confirmNewPassword" 
                      [type]="showConfirmNewPassword() ? 'text' : 'password'"
                      formControlName="confirmNewPassword"
                      class="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all pr-10"
                      placeholder="Repite la nueva contraseña"
                    >
                    <button 
                      type="button"
                      (click)="showConfirmNewPassword.set(!showConfirmNewPassword())"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                      [attr.aria-label]="showConfirmNewPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    >
                      @if (showConfirmNewPassword()) {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      }
                    </button>
                  </div>
                   @if (passwordForm.errors?.['mismatch'] && passwordForm.get('confirmNewPassword')?.touched) {
                      <p class="mt-1 text-xs text-red-400">Las contraseñas no coinciden.</p>
                   }
                </div>

                @if (passwordMessage()) {
                    <div [class]="'p-3 rounded-lg text-sm ' + (passwordError() ? 'bg-red-500/10 text-red-200 border border-red-500/20' : 'bg-green-500/10 text-green-200 border border-green-500/20')">
                        {{ passwordMessage() }}
                    </div>
                }

                <button 
                  type="submit" 
                  [disabled]="passwordForm.invalid || passwordLoading()"
                  class="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                   @if (passwordLoading()) {
                      <span class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2"></span>
                      Actualizando...
                   } @else {
                      Cambiar Contraseña
                   }
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfilePageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  userInitial = computed(() => {
    const name = this.currentUser()?.nombre;
    return name ? name.charAt(0).toUpperCase() : '?';
  });

  // Profile Form
  profileForm = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  profileLoading = signal(false);
  profileMessage = signal<string | null>(null);
  profileError = signal(false);

  // Password Form
  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    ]],
    confirmNewPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  passwordLoading = signal(false);
  passwordMessage = signal<string | null>(null);
  passwordError = signal(false);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmNewPassword = signal(false);

  constructor() {
    // Fill profile form when user data is available
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.profileForm.patchValue({
          nombre: user.nombre,
          email: user.email
        });
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmNewPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { mismatch: true }
      : null;
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) return;

    this.profileLoading.set(true);
    this.profileMessage.set(null);
    this.profileError.set(false);

    const { nombre, email } = this.profileForm.getRawValue();

    this.authService.updateProfile({ nombre: nombre!, email: email! }).subscribe({
      next: (response) => {
        this.profileLoading.set(false);
        this.profileMessage.set(response.message || 'Perfil actualizado correctamente');
        this.profileForm.markAsPristine();
      },
      error: (err) => {
        this.profileLoading.set(false);
        this.profileError.set(true);
        this.profileMessage.set(err.error?.error || 'Error al actualizar perfil');
      }
    });
  }

  onUpdatePassword() {
    if (this.passwordForm.invalid) return;

    this.passwordLoading.set(true);
    this.passwordMessage.set(null);
    this.passwordError.set(false);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.authService.updatePassword({ currentPassword: currentPassword!, newPassword: newPassword! }).subscribe({
      next: (response) => {
        this.passwordLoading.set(false);
        this.passwordMessage.set(response.message || 'Contraseña actualizada correctamente');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordLoading.set(false);
        this.passwordError.set(true);
        this.passwordMessage.set(err.error?.error || 'Error al cambiar contraseña');
      }
    });
  }
}
