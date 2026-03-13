import { Component, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styles: [`
    .bg-black-90 { background-color: rgba(5, 5, 5, 0.8); }
    .border-white-10 { border-color: rgba(255, 255, 255, 0.1); }
  `]
})
export class NavbarComponent {
  private router = inject(Router);
  
  isScrolled = signal(false);
  mobileMenuOpen = signal(false);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  scrollToTop() {
    const scrollSmooth = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    if (this.router.url === '/') {
      scrollSmooth();
    } else {
      this.router.navigate(['/']).then(() => scrollSmooth());
    }
  }
}
