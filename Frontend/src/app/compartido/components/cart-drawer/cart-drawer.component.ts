import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../nucleo/servicios/cart.service';
import { OrderService, OrderPayload } from '../../../nucleo/servicios/order.service';
import { AuthService } from '../../../nucleo/servicios/acceso.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cart-drawer.component.html',
})
export class CartDrawerComponent {
  isOpen = input<boolean>(false);
  close = output<void>();

  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly cartItems = this.cartService.cartItems;
  readonly total = this.cartService.total;

  view = signal<'cart' | 'checkout'>('cart');
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  checkoutForm = this.fb.group({
    nombre:   ['', [Validators.required, Validators.maxLength(100)]],
    email:    ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: [''],
    mensaje:  [''],
  });

  removeItem(id: number) {
    this.cartService.removeFromCart(id);
  }

  goToCheckout() {
    const user = this.authService.currentUser();
    if (user) {
      this.checkoutForm.patchValue({ nombre: user.nombre, email: user.email });
    }
    this.view.set('checkout');
  }

  goToCart() {
    this.view.set('cart');
    this.submitError.set(null);
  }

  onClose() {
    this.close.emit();
    // Resetear estado al cerrar
    setTimeout(() => {
      this.view.set('cart');
      this.submitError.set(null);
      this.submitSuccess.set(false);
      this.checkoutForm.reset();
    }, 300);
  }

  submitOrder() {
    if (this.checkoutForm.invalid || this.isSubmitting()) return;

    const { nombre, email, telefono, mensaje } = this.checkoutForm.value;

    const payload: OrderPayload = {
      customer_nombre:   nombre!,
      customer_email:    email!,
      customer_telefono: telefono || undefined,
      customer_message:  mensaje || undefined,
      items: this.cartItems().map(item => ({
        service_id:     item.id,
        name_snapshot:  item.title,
        price_snapshot: item.price,
        quantity:       item.quantity,
      })),
    };

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.orderService.createOrder(payload).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.submitSuccess.set(true);
        this.isSubmitting.set(false);
      },
      error: () => {
        this.submitError.set('Error al enviar el pedido. Por favor, inténtalo de nuevo.');
        this.isSubmitting.set(false);
      },
    });
  }
}
