import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl; // Configuración centralizada

    constructor() { }

    private getHeaders(): HttpHeaders {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
        // Agregar token de autenticación si se necesita en el futuro
        return headers;
    }

    private handleError(error: HttpErrorResponse) {
        console.error('ApiService Error Full Object:', error); // Registrar el objeto de error completo
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente o de red
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // El backend devolvió un código de respuesta no exitoso
            // El cuerpo de la respuesta puede contener pistas sobre lo que salió mal
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
            if (error.error && error.error.error) {
                errorMessage = error.error.error;
            }
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }

    get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
        const url = `${this.baseUrl}/${path}`;
        return this.http.get<T>(url, { headers: this.getHeaders(), params })
            .pipe(catchError(this.handleError));
    }

    post<T>(path: string, body: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${path}`, body, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError));
    }

    put<T>(path: string, body: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}/${path}`, body, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError));
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}/${path}`, { headers: this.getHeaders() })
            .pipe(catchError(this.handleError));
    }
}
