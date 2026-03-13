# Sistema Admin - Resumen Completo

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        Angular App                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Public Pages (Layout + Router)            │  │
│  │  - Home (carga datos de BD)                          │  │
│  │  - Servicios                                         │  │
│  │  - Portfolio                                         │  │
│  │  - Casos de Éxito                                    │  │
│  │  - Contacto                                          │  │
│  │  - Presupuesto                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Admin Module (Sin Layout - Standalone Routes)   │  │
│  │                                                      │  │
│  │  🔐 AdminGuard (verifica isAdmin)                   │  │
│  │    │                                                 │  │
│  │    ├─ /admin/login                                   │  │
│  │    │   └─ AdminLoginComponent                       │  │
│  │    │       ├─ Email input                           │  │
│  │    │       ├─ Password input                        │  │
│  │    │       └─ Login button                          │  │
│  │    │                                                 │  │
│  │    └─ /admin/dashboard ✨ [Protegido]               │  │
│  │        └─ AdminDashboardComponent (Layout)          │  │
│  │            ├─ Header + Logout button                │  │
│  │            ├─ Sidebar con navegación                │  │
│  │            │   ├─ ⚙️  /admin/dashboard/services    │  │
│  │            │   ├─ 🖼️  /admin/dashboard/portfolio   │  │
│  │            │   └─ 📚 /admin/dashboard/case-studies │  │
│  │            └─ Main content (RouterOutlet)           │  │
│  │                ├─ ServicesEditorComponent           │  │
│  │                ├─ PortfolioEditorComponent          │  │
│  │                └─ CaseStudiesEditorComponent        │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services Layer (Injectable)            │  │
│  │                                                      │  │
│  │  AuthService                                        │  │
│  │  ├─ login(email, password): Promise                │  │
│  │  ├─ logout()                                        │  │
│  │  ├─ isAdmin(): boolean                             │  │
│  │  ├─ currentUser signal                             │  │
│  │  └─ isAuthenticated signal                         │  │
│  │                                                      │  │
│  │  ContentService                                     │  │
│  │  ├─ getServices/create/update/delete               │  │
│  │  ├─ getPortfolioItems/create/update/delete         │  │
│  │  ├─ getCaseStudies/create/update/delete            │  │
│  │  └─ sanitizeInput() para XSS prevention            │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Backend - Supabase API                   │  │
│  │                                                      │  │
│  │  PostgreSQL Database (RLS Enabled)                 │  │
│  │  ├─ services table        (públicamente legible)    │  │
│  │  ├─ portfolio_items table (públicamente legible)    │  │
│  │  ├─ case_studies table    (públicamente legible)    │  │
│  │  └─ admin_users table     (solo admin)              │  │
│  │                                                      │  │
│  │  Row Level Security (RLS) Policies:                 │  │
│  │  ├─ SELECT: Permitir a todos (datos públicos)      │  │
│  │  ├─ INSERT: Solo admin (unionpegaso@gmail.com)      │  │
│  │  ├─ UPDATE: Solo admin                              │  │
│  │  └─ DELETE: Solo admin                              │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Carpetas

```
src/app/
├── admin/
│   ├── guards/
│   │   └── admin.guard.ts (CanActivateFn)
│   │
│   ├── services/
│   │   ├── auth.service.ts (login, logout, isAdmin)
│   │   └── content.service.ts (CRUD: Services, Portfolio, Cases)
│   │
│   ├── pages/
│   │   ├── admin-login/
│   │   │   └── admin-login.component.ts (Formulario de login)
│   │   └── admin-dashboard/
│   │       └── admin-dashboard.component.ts (Layout + Sidebar)
│   │
│   ├── components/
│   │   ├── services-editor/
│   │   │   └── services-editor.component.ts (CRUD Services)
│   │   ├── portfolio-editor/
│   │   │   └── portfolio-editor.component.ts (CRUD Portfolio)
│   │   └── case-studies-editor/
│   │       └── case-studies-editor.component.ts (CRUD Cases)
│   │
│   └── admin.routes.ts (Rutas del módulo)
│
├── features/
│   ├── home/
│   │   ├── components/
│   │   │   ├── hero/
│   │   │   ├── services-preview/
│   │   │   ├── how-we-work/
│   │   │   └── portfolio-carousel/
│   │   │
│   │   └── pages/
│   │       └── home-page/ ✨ (Carga datos de BD)
│   │
│   └── ...
│
├── core/
├── shared/
└── app.routes.ts (Incluye adminRoutes)
```

## 🔐 Flujo de Seguridad

```
1. Usuario abre /admin/login
   │
   ├─ ¿Está autenticado?
   │  ├─ Sí → Redirige a /admin/dashboard
   │  └─ No → Muestra formulario de login
   │
2. Usuario ingresa credenciales
   │
   ├─ AuthService.login(email, password)
   │  ├─ Valida email === 'unionpegaso@gmail.com'
   │  ├─ Valida password === 'admin123'
   │  ├─ Genera token
   │  ├─ Almacena en sessionStorage
   │  └─ Actualiza signals (currentUser, isAuthenticated)
   │
3. Usuario redirigido a /admin/dashboard
   │
   ├─ adminGuard verifica isAdmin()
   │  ├─ Sí → Permite acceso
   │  └─ No → Redirige a /admin/login
   │
4. Dashboard carga datos
   │
   ├─ ContentService hace requests a Supabase
   ├─ Incluye token en headers Authorization
   ├─ Supabase verifica RLS policies
   ├─ Si token válido y email === admin → Acceso concedido
   └─ Si no → Error 401 Unauthorized

5. Usuario modifica datos
   │
   ├─ ServicesEditor/PortfolioEditor/CaseEditor captura datos
   ├─ Valida formulario
   ├─ Sanitiza inputs (prevenir XSS)
   ├─ Llama a ContentService.create/update/delete()
   ├─ Incluye token en headers
   ├─ Supabase verifica RLS y token
   ├─ Si válido → Realiza operación
   └─ Si inválido → Error

6. Usuario cierra sesión
   │
   ├─ Clicks "Cerrar sesión"
   ├─ AuthService.logout()
   │  ├─ Limpia sessionStorage
   │  ├─ Resetea signals
   │  └─ Redirige a /admin/login
   └─ Sesión terminada
```

## 📊 Base de Datos Schema

```sql
-- Tabla: services
CREATE TABLE services (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  icon VARCHAR(10),              -- Emoji ej: ⚙️
  description TEXT,
  price NUMERIC,                 -- Precio base
  duration VARCHAR(50),          -- ej: "2 semanas"
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tabla: portfolio_items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(20),              -- 'image' o 'video'
  url TEXT,                      -- URL de imagen o video
  poster TEXT,                   -- Thumbnail para videos
  client VARCHAR(255),           -- Nombre del cliente
  tags TEXT[],                   -- Array: ['diseño', 'web']
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tabla: case_studies
CREATE TABLE case_studies (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  company VARCHAR(255),          -- Nombre de empresa
  industry VARCHAR(100),         -- Sector: 'e-commerce', 'SaaS'
  challenges TEXT,               -- Descripción del problema
  result TEXT,                   -- Resultado logrado
  image TEXT,                    -- URL de imagen
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tabla: admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50),              -- 'admin', 'editor'
  created_at TIMESTAMP
);
```

## 🔄 Flujo de Datos - Ejemplo: Crear Servicio

```
User Interface (Formulario)
        │
        ▼
ServicesEditorComponent.onSubmit()
        │
        ├─ Valida FormGroup
        ├─ Crea objeto Service
        └─ Llama ContentService.createService(service)
        │
        ▼
ContentService.createService()
        │
        ├─ Sanitiza input (XSS prevention)
        ├─ Obtiene token de AuthService
        ├─ Construye headers con Authorization
        └─ POST a Supabase REST API
        │
        ▼
Supabase (Backend)
        │
        ├─ Verifica Bearer token
        ├─ Extrae email del token
        ├─ Ejecuta RLS policy:
        │  "INSERT: Solo si email === 'unionpegaso@gmail.com'"
        ├─ Si pasa → Inserta en BD
        └─ Si falla → Retorna 403 Forbidden
        │
        ▼
ContentService.createService()
        │
        ├─ Recibe respuesta
        ├─ Resuelve Promise
        └─ Retorna objeto Service creado
        │
        ▼
ServicesEditorComponent
        │
        ├─ Recibe Service creado
        ├─ Recarga lista de servicios
        ├─ Cierra modal del formulario
        └─ Muestra feedback al usuario
        │
        ▼
User Interface (Lista actualizada)
```

## 🎯 Casos de Uso

### Caso 1: Usuario no autenticado visita /admin/dashboard
```
1. adminGuard.canActivate() ejecuta
2. authService.isAdmin() retorna false
3. Router redirige a /admin/login
4. Usuario ve formulario de login
```

### Caso 2: Admin intenta modificar servicio sin permisos
```
1. User intenta un PATCH sin token válido
2. Headers no incluyen Authorization correctamente
3. RLS policy en Supabase falla la verificación
4. Supabase retorna 403 Forbidden
5. ContentService captura error
6. UI muestra "Error al guardar"
```

### Caso 3: Usuario público accede a /api/services
```
1. GET a Supabase sin token de autenticación
2. RLS policy: "SELECT permitido a todos"
3. Supabase retorna todos los servicios
4. Home page los renderiza
✨ No hay validación de token necesaria
```

## 🚀 Próximos Pasos

1. **Integración con Supabase:**
   - [ ] Crear proyecto en Supabase
   - [ ] Ejecutar SQL schema en Supabase
   - [ ] Configurar RLS policies
   - [ ] Obtener URL y API key

2. **Configuración en Angular:**
   - [ ] Actualizar SUPABASE_URL en content.service.ts
   - [ ] Actualizar SUPABASE_KEY en content.service.ts
   - [ ] Crear environment variables

3. **Testing:**
   - [ ] Probar login
   - [ ] Crear un servicio
   - [ ] Actualizar un servicio
   - [ ] Eliminar un servicio
   - [ ] Verificar que datos públicos sean accesibles

4. **Integración Home Page:**
   - [ ] Cargar servicios desde BD
   - [ ] Cargar portfolio desde BD
   - [ ] Cargar casos desde BD
   - [ ] Actualizar automáticamente

5. **Producción:**
   - [ ] Cambiar credenciales admin
   - [ ] Habilitar HTTPS
   - [ ] Configurar dominio
   - [ ] Setup CI/CD
   - [ ] Monitoreo y logs

## 📞 Support

Si necesitas ayuda:
1. Revisa la documentación en ADMIN_SETUP.md
2. Revisa la guía de integración en INTEGRATION_GUIDE.md
3. Consulta el SQL schema en este documento
