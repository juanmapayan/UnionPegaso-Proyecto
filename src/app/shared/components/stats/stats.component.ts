import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatItem {
  value: string;
  label: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="grid gap-8 border-t border-white/10 pt-10"
      [class.grid-cols-2]="items().length <= 4"
      [class.md:grid-cols-4]="items().length === 4"
      [class.md:grid-cols-3]="items().length === 3"
      [class.md:grid-cols-2]="items().length === 2"
    >
      @for (stat of items(); track stat.label) {
        <div [class.text-center]="centered()">
          <p class="text-3xl font-bold text-white">{{ stat.value }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ stat.label }}</p>
        </div>
      }
    </div>
  `
})
export class StatsComponent {
  items = input.required<StatItem[]>();
  centered = input(true);
}
