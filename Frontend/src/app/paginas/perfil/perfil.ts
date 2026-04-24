import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../nucleo/servicios/acceso.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
})
export class Perfil {
  authService = inject(AuthService);

  email = signal(this.authService.currentUser()?.email || '');
  
  currentPassword = signal('');
  newPassword = signal('');

  profileMessage = signal('');
  passwordMessage = signal('');

  updateProfile() {
    this.authService.updateProfile({ email: this.email() }).subscribe({
      next: () => {
        this.profileMessage.set('Perfil actualizado correctamente');
        setTimeout(() => this.profileMessage.set(''), 3000);
      },
      error: () => this.profileMessage.set('Error al actualizar el perfil')
    });
  }

  updatePassword() {
    if (!this.currentPassword() || !this.newPassword()) return;
    
    this.authService.updatePassword({ 
      currentPassword: this.currentPassword(), 
      newPassword: this.newPassword() 
    }).subscribe({
      next: () => {
        this.passwordMessage.set('Contraseña actualizada correctamente');
        this.currentPassword.set('');
        this.newPassword.set('');
        setTimeout(() => this.passwordMessage.set(''), 3000);
      },
      error: () => this.passwordMessage.set('Error al actualizar contraseña')
    });
  }
}
