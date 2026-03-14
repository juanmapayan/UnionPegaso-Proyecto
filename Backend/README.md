# Union Pegaso Backend

Backend PHP + MySQL para el proyecto Union Pegaso.

## Estructura

- `public/index.php`: Punto de entrada de la API.
- `src/`: Código fuente (Controladores, Modelos, Clases base).
- `config/`: Configuración (Base de datos, CORS).
- `sql/`: Scripts SQL para crear y poblar la base de datos.

## Instalación en VPS (Apache)

1.  **Subir archivos**:
    Suba el contenido de la carpeta `Backend` a una carpeta en su servidor web, por ejemplo `/var/www/html/api`.

2.  **Base de Datos**:
    Importe `sql/schema.sql` y `sql/seed.sql` en su base de datos MySQL.
    ```bash
    mysql -u usuario -p base_de_datos < sql/schema.sql
    mysql -u usuario -p base_de_datos < sql/seed.sql
    ```

3.  **Configuración**:
    Edite `config/config.php` O configure las variables de entorno en su servidor/hosting:
    - `DB_HOST`
    - `DB_NAME`
    - `DB_USER`
    - `DB_PASS`

4.  **CORS**:
    Asegúrese de agregar el dominio de su frontend en `config/config.php` -> `cors` -> `allowed_origins`.

## Pruebas Locales

Para probar localmente sin Apache/XAMPP, puede usar el servidor integrado de PHP:

```bash
cd Backend/public
php -S localhost:8000
```
La API estará disponible en `http://localhost:8000`.

## Endpoints

### Autenticación
- **POST** `/api/auth/register`
  - Body: `{ "name": "Nombre", "email": "email@test.com", "password": "pass" }`
- **POST** `/api/auth/login`
  - Body: `{ "email": "email@test.com", "password": "pass" }`
- **POST** `/api/auth/logout`
- **GET** `/api/auth/me`

### Servicios
- **GET** `/api/services`
- **GET** `/api/services/{id}`


