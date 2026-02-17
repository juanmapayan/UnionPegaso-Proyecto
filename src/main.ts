import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // Mantener como fallback o referencia, pero no usar en bootstrap
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';

// FIX CRÍTICO: Importar Zone.js (necesario tras eliminar CDN)
import 'zone.js';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router registrado explícitamente en main.ts
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(withFetch())
  ]
})
  .catch((err) => console.error(err));
