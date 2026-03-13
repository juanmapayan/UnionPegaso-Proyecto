# Guía de Integración del Admin con la Home Page

## Objetivo
Conectar la home page para que cargue los servicios, portfolio y casos de estudio desde la base de datos en lugar de datos hardcodeados.

## Paso 1: Actualizar el Home Page Component

En `src/app/features/home/pages/home-page/home-page.component.ts`, reemplaza el código:

```typescript
import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesPreviewComponent } from '../../components/services-preview/services-preview.component';
import { HowWeWorkComponent } from '../../components/how-we-work/how-we-work.component';
import { PortfolioCarouselComponent } from '../../components/portfolio-carousel/portfolio-carousel.component';
import { CasesListComponent } from '../../features/case-studies/components/cases-list/cases-list.component';
import { ContentService, PortfolioItem, CaseStudy, Service } from '../../../../admin/services/content.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    ServicesPreviewComponent,
    HowWeWorkComponent,
    PortfolioCarouselComponent,
    CasesListComponent
  ],
  template: `
    <!-- Hero -->
    <app-hero></app-hero>

    <!-- Services -->
    <section class="py-12 md:py-20">
      <div class="container">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4">Servicios</h2>
        <p class="text-gray-400 text-center mb-12">Lo que ofrecemos</p>
        <app-services-preview [services]="services()"></app-services-preview>
      </div>
    </section>

    <!-- How We Work -->
    <app-how-we-work></app-how-we-work>

    <!-- Portfolio -->
    <section class="py-12 md:py-20">
      <div class="container">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4">Trabajos Recientes</h2>
        <p class="text-gray-400 text-center mb-12">Proyectos que hemos realizado</p>
        <app-portfolio-carousel [items]="portfolioItems()"></app-portfolio-carousel>
      </div>
    </section>

    <!-- Cases -->
    <section class="py-12 md:py-20 bg-[#0f0f0f]">
      <div class="container">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-4">Casos de Éxito</h2>
        <p class="text-gray-400 text-center mb-12">Resultados que hemos logrado</p>
        <app-cases-list [cases]="caseStudies()"></app-cases-list>
      </div>
    </section>
  `
})
export class HomePageComponent {
  private contentService: ContentService;

  services = signal<Service[]>([]);
  portfolioItems = signal<PortfolioItem[]>([]);
  caseStudies = signal<CaseStudy[]>([]);
  isLoading = signal(true);

  constructor(contentService: ContentService) {
    this.contentService = contentService;
    this.loadContent();
  }

  private loadContent() {
    // Cargar servicios
    this.contentService.getServices()
      .then(data => {
        this.services.set(data);
      })
      .catch(error => {
        console.error('Error loading services:', error);
        // Usar datos por defecto en caso de error
      });

    // Cargar portfolio
    this.contentService.getPortfolioItems()
      .then(data => {
        this.portfolioItems.set(data);
      })
      .catch(error => {
        console.error('Error loading portfolio:', error);
      });

    // Cargar casos de estudio
    this.contentService.getCaseStudies()
      .then(data => {
        this.caseStudies.set(data);
      })
      .catch(error => {
        console.error('Error loading case studies:', error);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
```

## Paso 2: Actualizar el Services Preview Component

Modifica `src/app/features/home/components/services-preview/services-preview.component.ts`:

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../../../admin/services/content.service';

@Component({
  selector: 'app-services-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div *ngFor="let service of services" class="p-6 bg-[#1a1a1a] rounded-lg hover:border-[#c084fc] transition-all border border-gray-800">
        <div class="text-4xl mb-4">{{ service.icon }}</div>
        <h3 class="text-xl font-bold mb-2">{{ service.name }}</h3>
        <p class="text-gray-400 mb-4">{{ service.description }}</p>
        <p class="text-sm text-[#c084fc]">Desde \${{ service.price }}</p>
      </div>
    </div>
  `
})
export class ServicesPreviewComponent {
  @Input() services: Service[] = [];
}
```

## Paso 3: Actualizar el Portfolio Carousel Component

Modifica `src/app/features/home/components/portfolio-carousel/portfolio-carousel.component.ts`:

```typescript
import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioItem } from '../../../../admin/services/content.service';

// ... (mantén el código existente pero añade @Input para items)

export class PortfolioCarouselComponent {
  @Input() set items(value: PortfolioItem[]) {
    this.portfolioItems.set(value);
    this.updateDotCount();
  }

  portfolioItems = signal<PortfolioItem[]>([]);
  // ... resto del código
}
```

## Paso 4: Actualizar el Cases List Component

Modifica `src/app/features/case-studies/components/cases-list/cases-list.component.ts`:

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseStudy } from '../../../../admin/services/content.service';

@Component({
  selector: 'app-cases-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div *ngFor="let caseStudy of cases" class="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-[#c084fc] transition-all">
        <h3 class="text-xl font-bold mb-2">{{ caseStudy.title }}</h3>
        <p class="text-gray-400 mb-4">{{ caseStudy.company }}</p>
        <p class="text-sm text-gray-300 mb-4">{{ caseStudy.description }}</p>
        <p class="text-sm text-green-400">{{ caseStudy.result }}</p>
      </div>
    </div>
  `
})
export class CasesListComponent {
  @Input() cases: CaseStudy[] = [];
}
```

## Paso 5: Ejecutar en desarrollo

```bash
ng serve
```

Luego:
1. Ve a http://localhost:4200/admin/login
2. Ingresa con:
   - Email: `unionpegaso@gmail.com`
   - Password: `admin123`
3. Crea algunos servicios, portfolio y casos
4. Vuelve a la home page y deberías ver los datos actualizados

## Paso 6: Deploy a producción

Cuando estés listo para producción:

1. **Configura Supabase:**
   - Actualiza `SUPABASE_URL` y `SUPABASE_KEY` en `content.service.ts`
   - O crea variables de entorno en `environment.prod.ts`

2. **Configura RLS policies** en Supabase SQL (ver `ADMIN_SETUP.md`)

3. **Deploy:**
   ```bash
   ng build --configuration production
   # Despliega los archivos de la carpeta dist/
   ```

## Checklist

- [ ] Home page carga servicios desde BD
- [ ] Home page carga portfolio desde BD
- [ ] Home page carga casos desde BD
- [ ] Admin login funciona correctamente
- [ ] Admin puede crear/editar/eliminar servicios
- [ ] Admin puede crear/editar/eliminar portfolio items
- [ ] Admin puede crear/editar/eliminar casos de estudio
- [ ] La home page se actualiza automáticamente después de cambios en admin
- [ ] Los datos públicos son accesibles sin autenticación
- [ ] Solo el admin puede modificar contenido

## Notas importantes

- En desarrollo, los datos se cargan sin validación de token
- En producción, asegúrate que RLS está habilitado para proteger acceso
- La contraseña está hardcodeada en desarrollo; cambiar en producción
- Considerar implementar caché para mejorar performance
- Implementar lazy loading de imágenes del portfolio
