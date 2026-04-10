import { Directive, ElementRef, OnInit, OnDestroy, input } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  delay = input<number>(0);
  threshold = input<number>(0.1);
  
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Agregar estado oculto inicial
    this.el.nativeElement.style.opacity = '0';
    this.el.nativeElement.style.transform = 'translateY(40px)';
    this.el.nativeElement.style.transition = `opacity 0.8s ease-out ${this.delay()}ms, transform 0.8s ease-out ${this.delay()}ms`;

    // Crear observer de intersección
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // El elemento es visible, activar animación
            setTimeout(() => {
              this.el.nativeElement.style.opacity = '1';
              this.el.nativeElement.style.transform = 'translateY(0)';
            }, 50);
            
            // Opcional: dejar de observar tras la animación
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      },
      {
        threshold: this.threshold(),
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
