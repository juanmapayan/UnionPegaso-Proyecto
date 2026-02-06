import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'purple';
type BadgeIcon = 'none' | 'check' | 'shield' | 'star' | 'verified';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses()">
      @if (dot()) {
        <span class="flex h-2 w-2 relative mr-2">
          @if (pulse()) {
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" [class]="dotColorClass()"></span>
          }
          <span class="relative inline-flex rounded-full h-2 w-2" [class]="dotColorClass()"></span>
        </span>
      }
      @if (icon() !== 'none') {
        <span class="mr-1.5 flex-shrink-0" [innerHTML]="getIconSvg()"></span>
      }
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  variant = input<BadgeVariant>('default');
  dot = input(false);
  pulse = input(false);
  icon = input<BadgeIcon>('none');

  getIconSvg(): string {
    const iconColor = this.getIconColor();
    const icons: Record<BadgeIcon, string> = {
      none: '',
      check: `<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="${iconColor}" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`,
      shield: `<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="${iconColor}" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
      star: `<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="${iconColor}" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`,
      verified: `<svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="${iconColor}" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`
    };
    return icons[this.icon()];
  }

  getIconColor(): string {
    const colors: Record<BadgeVariant, string> = {
      default: 'currentColor',
      success: '#4ade80',
      warning: '#facc15',
      error: '#f87171',
      purple: '#c084fc'
    };
    return colors[this.variant()];
  }

  badgeClasses(): string {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
    
    const variants: Record<BadgeVariant, string> = {
      default: 'bg-white/5 border border-white/10 text-gray-300',
      success: 'bg-green-500/10 border border-green-500/20 text-green-400',
      warning: 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400',
      error: 'bg-red-500/10 border border-red-500/20 text-red-400',
      purple: 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
    };

    return `${base} ${variants[this.variant()]}`;
  }

  dotColorClass(): string {
    const colors: Record<BadgeVariant, string> = {
      default: 'bg-gray-400',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      purple: 'bg-purple-500'
    };
    return colors[this.variant()];
  }
}
