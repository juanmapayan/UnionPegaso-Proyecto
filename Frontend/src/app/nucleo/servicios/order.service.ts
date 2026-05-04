import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  service_id: number;
  name_snapshot: string;
  price_snapshot: number;
  quantity: number;
}

export interface OrderPayload {
  customer_nombre: string;
  customer_email: string;
  customer_telefono?: string;
  customer_message?: string;
  items: OrderItem[];
}

export interface OrderResponse {
  success: boolean;
  order_id: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/orders';

  createOrder(payload: OrderPayload): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, payload, { withCredentials: true });
  }
}
