import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent, StatsComponent } from '@shared';
import { agencyBadgeText } from '@core/data/branding';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, BadgeComponent, StatsComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  badgeText = agencyBadgeText;
  
  stats = [
    { value: '+150%', label: 'ROI Promedio' },
    { value: '50M+', label: 'Usuarios Alcanzados' },
    { value: '120+', label: 'Clientes Felices' },
    { value: '24/7', label: 'Soporte Dedicado' }
  ];
}
