import { Injectable, signal } from '@angular/core';

export interface AdminUser {
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ADMIN_EMAIL = 'unionpegaso@gmail.com';
  private readonly ADMIN_PASSWORD = 'admin123'; // En producción, usar Supabase
  
  currentUser = signal<AdminUser | null>(null);
  isAuthenticated = signal(false);

  constructor() {
    this.restoreSession();
  }

  /**
   * Login: validar credenciales
   * Para producción, integrar con Supabase Auth
   */
  async login(email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Validación hardcodeada (reemplazar con Supabase en producción)
      if (email === this.ADMIN_EMAIL && password === this.ADMIN_PASSWORD) {
        const token = this.generateToken();
        const user: AdminUser = { email, token };
        
        sessionStorage.setItem('admin_token', token);
        sessionStorage.setItem('admin_user', JSON.stringify(user));
        
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        
        resolve();
      } else {
        reject(new Error('Credenciales inválidas. Email o contraseña incorrectos.'));
      }
    });
  }

  /**
   * Logout: limpiar sesión
   */
  logout(): void {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Restaurar sesión desde token almacenado
   */
  private restoreSession(): void {
    const token = sessionStorage.getItem('admin_token');
    const userJson = sessionStorage.getItem('admin_user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as AdminUser;
        if (user.email === this.ADMIN_EMAIL && this.isTokenValid(token)) {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }
  }

  /**
   * Validar que el token sea válido
   * En producción, verificar contra Supabase
   */
  private isTokenValid(token: string): boolean {
    // Verificar que el token no esté vacío
    return token.length > 0;
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return sessionStorage.getItem('admin_token');
  }

  /**
   * Generar un token simple (en producción, usar Supabase JWT)
   */
  private generateToken(): string {
    return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    return this.isAuthenticated() && this.currentUser()?.email === this.ADMIN_EMAIL;
  }
}
