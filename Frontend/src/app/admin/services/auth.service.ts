import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'cliente';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // Use localhost directly or environment if available. 
  // Consolidating on the PHP backend URL used in Core
  private apiUrl = 'http://localhost:8000/api/auth';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);

  // Computed signal for admin check
  isAdmin = computed(() => this.currentUser()?.rol === 'admin');

  constructor() {
    this.checkSession();
  }

  /**
   * Login: validar credenciales contra el backend
   * Accepts individual params to match AdminLoginComponent usage
   */
  login(email: string, password: string): Observable<any> {
    const credentials = { email, password };
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(response => {
        if (response.user) {
          this.setUser(response.user);
        }
      })
    );
  }

  /**
   * Logout: cerrar sesión
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearState(),
      error: () => this.clearState()
    });
  }

  /**
   * Verificar sesión actual
   */
  checkSession(): void {
    this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true }).subscribe({
      next: (user) => this.setUser(user),
      error: () => this.clearState()
    });
  }

  private setUser(user: User) {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private clearState() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }
}
