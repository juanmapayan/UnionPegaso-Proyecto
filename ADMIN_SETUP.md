# Sistema Admin - Documentación de Setup

## 1. Configuración de Supabase

### 1.1 Crear proyecto en Supabase
1. Ve a https://supabase.com
2. Crea una cuenta (si no la tienes)
3. Crea un nuevo proyecto
4. Elige tu región (recomendado: la más cercana a tus usuarios)
5. Establece una contraseña fuerte

### 1.2 Obtener credenciales
En las settings del proyecto, obtén:
- **Supabase URL**: `https://xxxxx.supabase.co`
- **API Key (anon)**: La llave pública
- **API Key (service_role)**: Para operaciones del servidor

## 2. Crear las tablas en PostgreSQL

Ve a SQL Editor en tu proyecto Supabase y ejecuta el siguiente SQL:

```sql
-- Crear tabla de servicios
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  price NUMERIC,
  duration VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de portfolio
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  poster TEXT,
  client VARCHAR(255),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de casos de estudio
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  company VARCHAR(255),
  industry VARCHAR(100),
  challenges TEXT,
  result TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla de admin auth
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 3. Configurar Row Level Security (RLS)

### 3.1 Habilitar RLS en todas las tablas

```sql
-- Habilitar RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

### 3.2 Políticas para tabla "services"

```sql
-- Cualquier persona puede leer servicios
CREATE POLICY "Services are readable by everyone"
ON services
FOR SELECT
USING (true);

-- Solo admin (email verificado) puede crear/actualizar/eliminar
CREATE POLICY "Services can be modified by admin"
ON services
FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);

CREATE POLICY "Services can be updated by admin"
ON services
FOR UPDATE
USING (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);

CREATE POLICY "Services can be deleted by admin"
ON services
FOR DELETE
USING (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);
```

### 3.3 Políticas para tabla "portfolio_items"

```sql
-- Cualquier persona puede leer portfolio
CREATE POLICY "Portfolio items are readable by everyone"
ON portfolio_items
FOR SELECT
USING (true);

-- Solo admin puede crear/actualizar/eliminar
CREATE POLICY "Portfolio items can be modified by admin"
ON portfolio_items
FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);

CREATE POLICY "Portfolio items can be updated by admin"
ON portfolio_items
FOR UPDATE
USING (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);

CREATE POLICY "Portfolio items can be deleted by admin"
ON portfolio_items
FOR DELETE
USING (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);
```

### 3.4 Políticas para tabla "case_studies"

```sql
-- Cualquier persona puede leer casos de éxito
CREATE POLICY "Case studies are readable by everyone"
ON case_studies
FOR SELECT
USING (true);

-- Solo admin puede crear/actualizar/eliminar
CREATE POLICY "Case studies can be modified by admin"
ON case_studies
FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);

CREATE POLICY "Case studies can be updated by admin"
ON case_studies
FOR UPDATE
USING (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);

CREATE POLICY "Case studies can be deleted by admin"
ON case_studies
FOR DELETE
USING (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);
```

### 3.5 Políticas para tabla "admin_users"

```sql
-- Solo admin puede leer admin_users
CREATE POLICY "Admin users readable by authenticated admin"
ON admin_users
FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'unionpegaso@gmail.com'
);

-- Los usuarios nuevos se crean desde backend (app service role)
CREATE POLICY "Admin users creatable by service role"
ON admin_users
FOR INSERT
WITH CHECK (true);
```

## 4. Integración con Angular

### 4.1 Instalar Supabase client

```bash
npm install @supabase/supabase-js
```

### 4.2 Configurar variables de entorno

En `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://xxxxx.supabase.co',
    key: 'your-anon-key'
  }
};
```

En `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://xxxxx.supabase.co',
    key: 'your-anon-key'
  }
};
```

### 4.3 Crear cliente Supabase en un servicio

```typescript
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  getClient() {
    return this.supabase;
  }
}
```

## 5. Credenciales de Demo

Para las pruebas locales:
- **Email**: `unionpegaso@gmail.com`
- **Password**: `admin123`

⚠️ **IMPORTANTE**: En producción, cambiar estas credenciales y usar autenticación real de Supabase.

## 6. Estructura de carpetas del Admin

```
src/app/admin/
├── guards/
│   └── admin.guard.ts          # Protege rutas admin
├── services/
│   ├── auth.service.ts         # Autenticación
│   └── content.service.ts      # CRUD de contenido
├── pages/
│   ├── admin-login/
│   │   └── admin-login.component.ts
│   └── admin-dashboard/
│       └── admin-dashboard.component.ts
├── components/
│   ├── services-editor/
│   │   └── services-editor.component.ts
│   ├── portfolio-editor/
│   │   └── portfolio-editor.component.ts
│   └── case-studies-editor/
│       └── case-studies-editor.component.ts
└── admin.routes.ts             # Rutas del módulo admin
```

## 7. Acceso al Admin

Una vez desplegado:
- Accede a: `https://tu-dominio.com/admin/login`
- Usa las credenciales de demo
- Verás un dashboard con acceso a:
  - Editar Servicios
  - Editar Portfolio
  - Editar Casos de Éxito

## 8. Próximos pasos

1. ✅ Crear tablas en Supabase
2. ✅ Configurar RLS
3. ✅ Integrar Supabase en Angular
4. ⬜ Crear servicio de upload para images/videos
5. ⬜ Conectar home page para cargar datos desde BD
6. ⬜ Deploy a producción
7. ⬜ Configurar dominio personalizado
