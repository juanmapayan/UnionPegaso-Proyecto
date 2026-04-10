import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Small, explicit HTTP client for admin endpoints.
 *
 * This centralizes the admin API base URL so that admin features
 * do not hardcode http://... in components. It intentionally keeps
 * behavior simple and close to HttpClient to avoid hiding logic.
 *
 * Active admin area: `features/admin`.
 * Legacy admin area under `app/admin` has its own stack and is kept
 * as-is for now (see that folder for details).
 */
@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private http = inject(HttpClient);

  /**
   * Base URL for admin API endpoints, e.g. `${adminBaseUrl}/services`.
   * Uses the same backend as the public API but scoped to `/admin`.
   */
  private adminBaseUrl = `${environment.apiUrl}/admin`;

  get<T>(path: string, options: { params?: HttpParams; withCredentials?: boolean } = {}): Observable<T> {
    return this.http.get<T>(`${this.adminBaseUrl}/${path}`, options);
  }

  post<T>(path: string, body: any, options: { withCredentials?: boolean } = {}): Observable<T> {
    return this.http.post<T>(`${this.adminBaseUrl}/${path}`, body, options);
  }

  patch<T>(path: string, body: any, options: { withCredentials?: boolean } = {}): Observable<T> {
    return this.http.patch<T>(`${this.adminBaseUrl}/${path}`, body, options);
  }

  delete<T>(path: string, options: { withCredentials?: boolean } = {}): Observable<T> {
    return this.http.delete<T>(`${this.adminBaseUrl}/${path}`, options);
  }
}

