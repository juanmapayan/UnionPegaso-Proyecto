import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8000/api'; // Centralized configuration

    constructor() { }

    private getHeaders(): HttpHeaders {
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        });
        // Add auth token if needed in the future
        return headers;
    }

    private handleError(error: HttpErrorResponse) {
        console.error('ApiService Error Full Object:', error); // Log full error object
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Backend returned an unsuccessful response code
            // The response body may contain clues as to what went wrong
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
        console.log(`ApiService: Calling GET ${url}`, params); // Log URL
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
