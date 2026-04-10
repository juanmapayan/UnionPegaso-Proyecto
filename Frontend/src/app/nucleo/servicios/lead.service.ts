import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

export interface LeadData {
  services: string[];
  name: string;
  email: string;
  company?: string;
  budget: string;
  details?: string;
}

export interface LeadResponse {
  success: boolean;
  message: string;
  leadId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/leads'; // Configurar según backend

  /**
   * Envía los datos del lead al servidor
   */
  submitLead(data: LeadData): Observable<LeadResponse> {
    // TODO: Descomentar cuando haya backend real
    // return this.http.post<LeadResponse>(this.apiUrl, data);
    
    // Simulación temporal
    return of({
      success: true,
      message: 'Lead registrado correctamente',
      leadId: crypto.randomUUID()
    }).pipe(delay(1500));
  }

  /**
   * Valida el email del lead
   */
  validateEmail(email: string): Observable<{ valid: boolean; message?: string }> {
    // TODO: Implementar validación contra API
    return of({ valid: true }).pipe(delay(300));
  }
}
