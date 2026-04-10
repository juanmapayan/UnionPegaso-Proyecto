import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../nucleo/servicios/api.service';
import { Observable } from 'rxjs';
import { Service } from './models/service.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ServicesService {
    private apiService = inject(ApiService);

    constructor() { }

    getServices(limit?: number): Observable<Service[]> {
        let params = new HttpParams();
        if (limit && limit > 0) {
            params = params.set('limit', limit);
        }
        return this.apiService.get<Service[]>('services', params);
    }

    getService(id: number): Observable<Service> {
        return this.apiService.get<Service>(`services/${id}`);
    }
}
