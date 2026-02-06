import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { DomSanitizer } from '@angular/platform-browser';

const SUPABASE_URL = 'https://your-project.supabase.co'; // Configurar en environment.ts
const SUPABASE_KEY = 'your-anon-key'; // Configurar en environment.ts

// Interfaces
export interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
  duration: string;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  poster?: string;
  client: string;
  tags: string[];
  created_at: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  company: string;
  industry: string;
  challenges: string;
  result: string;
  image: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json'
    });
  }

  // ==================== SERVICES ====================

  /**
   * Obtener todos los servicios
   */
  async getServices(): Promise<Service[]> {
    try {
      const response = await this.http.get<Service[]>(
        `${SUPABASE_URL}/rest/v1/services`,
        { headers: this.getHeaders() }
      ).toPromise();
      return response || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo servicio
   */
  async createService(service: Service): Promise<Service> {
    try {
      const data = this.sanitizeInput(service);
      const response = await this.http.post<Service>(
        `${SUPABASE_URL}/rest/v1/services`,
        data,
        { headers: this.getHeaders() }
      ).toPromise();
      return response || service;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  /**
   * Actualizar un servicio
   */
  async updateService(id: string, service: Partial<Service>): Promise<Service> {
    try {
      const data = this.sanitizeInput(service);
        const response = await this.http.patch<Service[]>(
        `${SUPABASE_URL}/rest/v1/services?id=eq.${id}`,
        data,
        { headers: this.getHeaders() }
      ).toPromise();
        return response?.[0] || ({ id, ...service } as Service);
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  /**
   * Eliminar un servicio
   */
  async deleteService(id: string): Promise<void> {
    try {
      await this.http.delete(
        `${SUPABASE_URL}/rest/v1/services?id=eq.${id}`,
        { headers: this.getHeaders() }
      ).toPromise();
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // ==================== PORTFOLIO ITEMS ====================

  /**
   * Obtener todos los items del portfolio
   */
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    try {
      const response = await this.http.get<PortfolioItem[]>(
        `${SUPABASE_URL}/rest/v1/portfolio_items`,
        { headers: this.getHeaders() }
      ).toPromise();
      return response || [];
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo item del portfolio
   */
  async createPortfolioItem(item: PortfolioItem): Promise<PortfolioItem> {
    try {
      const data = this.sanitizeInput(item);
      const response = await this.http.post<PortfolioItem>(
        `${SUPABASE_URL}/rest/v1/portfolio_items`,
        data,
        { headers: this.getHeaders() }
      ).toPromise();
      return response || item;
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      throw error;
    }
  }

  /**
   * Actualizar un item del portfolio
   */
  async updatePortfolioItem(id: string, item: Partial<PortfolioItem>): Promise<PortfolioItem> {
    try {
      const data = this.sanitizeInput(item);
        const response = await this.http.patch<PortfolioItem[]>(
        `${SUPABASE_URL}/rest/v1/portfolio_items?id=eq.${id}`,
        data,
        { headers: this.getHeaders() }
      ).toPromise();
        return response?.[0] || ({ id, ...item } as PortfolioItem);
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      throw error;
    }
  }

  /**
   * Eliminar un item del portfolio
   */
  async deletePortfolioItem(id: string): Promise<void> {
    try {
      await this.http.delete(
        `${SUPABASE_URL}/rest/v1/portfolio_items?id=eq.${id}`,
        { headers: this.getHeaders() }
      ).toPromise();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      throw error;
    }
  }

  // ==================== CASE STUDIES ====================

  /**
   * Obtener todos los casos de estudio
   */
  async getCaseStudies(): Promise<CaseStudy[]> {
    try {
      const response = await this.http.get<CaseStudy[]>(
        `${SUPABASE_URL}/rest/v1/case_studies`,
        { headers: this.getHeaders() }
      ).toPromise();
      return response || [];
    } catch (error) {
      console.error('Error fetching case studies:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo caso de estudio
   */
  async createCaseStudy(caseStudy: CaseStudy): Promise<CaseStudy> {
    try {
      const data = this.sanitizeInput(caseStudy);
      const response = await this.http.post<CaseStudy>(
        `${SUPABASE_URL}/rest/v1/case_studies`,
        data,
        { headers: this.getHeaders() }
      ).toPromise();
      return response || caseStudy;
    } catch (error) {
      console.error('Error creating case study:', error);
      throw error;
    }
  }

  /**
   * Actualizar un caso de estudio
   */
  async updateCaseStudy(id: string, caseStudy: Partial<CaseStudy>): Promise<CaseStudy> {
    try {
      const data = this.sanitizeInput(caseStudy);
        const response = await this.http.patch<CaseStudy[]>(
        `${SUPABASE_URL}/rest/v1/case_studies?id=eq.${id}`,
        data,
        { headers: this.getHeaders() }
      ).toPromise();
        return response?.[0] || ({ id, ...caseStudy } as CaseStudy);
    } catch (error) {
      console.error('Error updating case study:', error);
      throw error;
    }
  }

  /**
   * Eliminar un caso de estudio
   */
  async deleteCaseStudy(id: string): Promise<void> {
    try {
      await this.http.delete(
        `${SUPABASE_URL}/rest/v1/case_studies?id=eq.${id}`,
        { headers: this.getHeaders() }
      ).toPromise();
    } catch (error) {
      console.error('Error deleting case study:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Sanitizar datos para prevenir XSS
   */
  private sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      // Remover caracteres potencialmente peligrosos
      return data
        .replace(/[<>]/g, '')
        .trim();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          sanitized[key] = this.sanitizeInput(data[key]);
        }
      }
      return sanitized;
    }

    return data;
  }
}
