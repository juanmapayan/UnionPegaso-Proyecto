import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="rounded-2xl transition-all duration-300"
      [class]="cardClasses()"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  variant = input<'default' | 'glass' | 'elevated'>('default');
  hover = input(false);
  padding = input(true);

  cardClasses(): string {
    const base = this.padding() ? 'p-6 md:p-8' : '';
    const hoverEffect = this.hover() ? 'hover:-translate-y-1 hover:border-purple-500/30' : '';
    
    const variants = {
      default: 'bg-[#0F0F0F] border border-white/5',
      glass: 'bg-white/5 backdrop-blur-sm border border-white/10',
      elevated: 'bg-[#0F0F0F] border border-white/10 shadow-xl'
    };

    return `${base} ${variants[this.variant()]} ${hoverEffect}`;
  }
}
