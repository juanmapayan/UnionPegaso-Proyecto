import { Component, signal } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesPreviewComponent } from '../../components/services-preview/services-preview.component';
import { TrustSectionComponent } from '../../components/trust-section/trust-section.component';
import { HowWeWorkComponent } from '../../components/how-we-work/how-we-work.component';
import { PortfolioCarouselComponent } from '../../components/portfolio-carousel/portfolio-carousel.component';
import { CasesListComponent } from '../../../case-studies/components/cases-list/cases-list.component';
import { ContactInfoComponent } from '../../../contact/components/contact-info/contact-info.component';
import { QuoteFormComponent, ScrollRevealDirective } from '@shared';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroComponent, ServicesPreviewComponent, TrustSectionComponent, HowWeWorkComponent, PortfolioCarouselComponent, CasesListComponent, ContactInfoComponent, QuoteFormComponent, ScrollRevealDirective],
  template: `
    <!-- Hero Principal -->
    <app-hero></app-hero>
    
    <!-- Visual Separator -->
    <div class="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
    
    <!-- Services Section - Dark Background -->
    <div appScrollReveal>
      <app-services-preview (requestQuote)="openQuote()"></app-services-preview>
    </div>
    
    <!-- Visual Separator with Glow -->
    <div class="relative py-20">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent"></div>
      <div class="container mx-auto px-6">
        <div class="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full blur-sm"></div>
        </div>
      </div>
    </div>
    
    <!-- Trust/Authority Section - Elevated Background -->
    <div appScrollReveal [delay]="100">
      <app-trust-section></app-trust-section>
    </div>
    
    <!-- Visual Separator -->
    <div class="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
    
    <!-- How We Work - Standard Background -->
    <div class="bg-[#050505]" appScrollReveal [delay]="100">
      <app-how-we-work></app-how-we-work>
    </div>
    
    <!-- Visual Separator -->
    <div class="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
    
    <!-- Portfolio Carousel Section -->
    <div appScrollReveal [delay]="100">
      <app-portfolio-carousel></app-portfolio-carousel>
    </div>
    
    <!-- Visual Separator -->
    <div class="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
    
    <!-- Case Studies - Slightly Lighter Background -->
    <div class="bg-[#0a0a0a]" appScrollReveal [delay]="100">
      <app-cases-list></app-cases-list>
    </div>
    
    <!-- Final Separator -->
    <div class="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
    
    <!-- Contact - Dark Background -->
    <div appScrollReveal [delay]="100">
      <app-contact-info></app-contact-info>
    </div>

    <!-- Optional Modal for Quote -->
    @if (showQuoteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
        <div class="relative w-full max-w-4xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <button (click)="closeQuote()" class="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <app-quote-form (formSubmitted)="closeQuote()"></app-quote-form>
        </div>
      </div>
    }
  `
})
export class HomePageComponent {
  showQuoteModal = signal(false);

  openQuote() {
    this.showQuoteModal.set(true);
  }

  closeQuote() {
    this.showQuoteModal.set(false);
  }
}
