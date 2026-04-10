import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);

  private readyResolve!: () => void;
  readonly ready: Promise<void> = new Promise(resolve => { this.readyResolve = resolve; });

  constructor() {
    this.checkSession();
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(response => this.setUser(response.user))
    );
  }

  register(data: { nombre: string, email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data, { withCredentials: true }).pipe(
      tap(response => this.setUser(response.user))
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearState(),
      error: () => this.clearState()
    });
  }

  updateProfile(data: { nombre?: string, email?: string }): Observable<any> {
    // Nota: La ruta del backend es /api/users/me, no /api/acceso/me para actualizaciones
    // Necesitamos ajustar la URL o usar el ServiceController si lo ponemos ahí.
    // Pero está en AuthController, así que revisamos las rutas de index.php.
    // POST /api/acceso/register, /api/acceso/login...
    // Las nuevas rutas son PATCH api/users/me -> AuthController.updateProfile
    return this.http.patch<any>(`${environment.apiUrl}/users/me`, data, { withCredentials: true }).pipe(
      tap(response => {
        if (response.user) {
          this.setUser(response.user);
        }
      })
    );
  }

  updatePassword(data: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/users/me/password`, data, { withCredentials: true });
  }

  checkSession(): void {
    this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true }).subscribe({
      next: (user) => { this.setUser(user); this.readyResolve(); },
      error: () => { this.clearState(); this.readyResolve(); }
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
