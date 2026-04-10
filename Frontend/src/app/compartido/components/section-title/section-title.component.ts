import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class.text-center]="centered()" [class.max-w-2xl]="centered()" [class.mx-auto]="centered()">
      @if (tag()) {
        <h2 class="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
          {{ tag() }}
        </h2>
      }
      <h3 class="text-3xl md:text-4xl font-bold text-white mb-4">
        {{ title() }}
      </h3>
      @if (subtitle()) {
        <p class="text-gray-400 text-lg">{{ subtitle() }}</p>
      }
    </div>
  `
})
export class SectionTitleComponent {
  tag = input<string>();
  title = input.required<string>();
  subtitle = input<string>();
  centered = input(true);
}
