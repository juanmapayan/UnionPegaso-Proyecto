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
    // Note: The backend route is /api/users/me, not /api/auth/me for updates
    // We need to adjust the URL or use the ServiceController if we put it there. 
    // But we put it in AuthController, so let's check index.php routes.
    // POST /api/auth/register, /api/auth/login...
    // The new routes are PATCH api/users/me -> AuthController.updateProfile
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
