import { Injectable, signal, computed, effect } from '@angular/core';
import { Service } from '../../features/services/models/service.model';

export interface CartItem extends Service {
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly STORAGE_KEY = 'cart_items'; // Clave única para todos los estados

    cartItems = signal<CartItem[]>([]);

    itemCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
    total = computed(() => this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0));

    constructor() {
        // Carga inicial
        this.loadCart();

        // Efecto de guardado automático
        effect(() => {
            this.saveCart();
        });
    }

    addToCart(service: Service) {
        this.cartItems.update(items => {
            const existingItem = items.find(item => item.id === service.id);
            if (existingItem) {
                return items.map(item =>
                    item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...items, { ...service, quantity: 1 }];
        });
    }

    removeFromCart(serviceId: number) {
        this.cartItems.update(items => items.filter(item => item.id !== serviceId));
    }

    clearCart() {
        this.cartItems.set([]);
    }

    private saveCart() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartItems()));
    }

    private loadCart() {
        const storedItems = localStorage.getItem(this.STORAGE_KEY);
        if (storedItems) {
            try {
                this.cartItems.set(JSON.parse(storedItems));
            } catch (e) {
                console.error('Failed to parse cart items', e);
                localStorage.removeItem(this.STORAGE_KEY);
            }
        }
    }
}
