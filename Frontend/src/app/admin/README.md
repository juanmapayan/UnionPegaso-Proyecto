# Legacy Admin Area (`app/admin`)

This folder contains a **legacy / deprecated admin implementation** that is
no longer wired into the main Angular routing.

- **Active admin area**: `src/app/features/admin`
  - Used by the `/admin` route defined in `app.routes.ts`.
  - Integrates with the current backend admin API endpoints.

- **Legacy admin area**: `src/app/admin`
  - Routes defined in `app/admin/admin.routes.ts` are **not** loaded in
    `app.routes.ts`.
  - Components here (e.g. `services-editor`, `portfolio-editor`,
    `case-studies-editor`) are kept only for historical reference.

Do not add new features here. For any new admin work, use
`src/app/features/admin` as the single source of truth.

