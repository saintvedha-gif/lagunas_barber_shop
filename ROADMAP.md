# 🗺️ ROADMAP — Migración PHP → Node.js + TypeScript + MongoDB

**Proyecto:** Laguna's Barber & Shop  
**Fecha de inicio:** 2026-03-07  
**Objetivo:** Eliminar el backend PHP/MySQL y reemplazarlo por una API REST con Node.js, TypeScript, Express y Mongoose (MongoDB Atlas).

---

## Estado general

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Análisis del código PHP existente | ✅ Completado |
| 2 | Scaffolding del proyecto backend | ✅ Completado |
| 3 | Modelos Mongoose (esquemas de datos) | ✅ Completado |
| 4 | Middlewares (auth JWT, upload, rate-limit) | ✅ Completado |
| 5 | Rutas y controladores REST | ✅ Completado |
| 6 | Seed inicial (admin + categorías) | ✅ Completado |
| 7 | Eliminación de archivos PHP | ⏳ Pendiente |
| 8 | Migración del frontend a API REST | ⏳ Pendiente |
| 9 | Subida de imágenes con Cloudinary | ⏳ Pendiente |
| 10 | Panel admin (React o HTML puro) | ⏳ Pendiente |
| 11 | Deploy del backend (Railway / Render) | ⏳ Pendiente |

---

## Estructura del backend

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          ← Conexión a MongoDB Atlas
│   ├── models/
│   │   ├── Admin.ts
│   │   ├── Category.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── BarberService.ts
│   │   ├── BarberMedia.ts
│   │   └── AccessLog.ts
│   ├── middleware/
│   │   ├── auth.ts               ← JWT verify
│   │   └── upload.ts             ← Multer config
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── barber.routes.ts
│   │   └── order.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── category.controller.ts
│   │   ├── barber.controller.ts
│   │   └── order.controller.ts
│   ├── seed.ts                   ← Datos iniciales
│   └── app.ts                    ← Entry point
├── uploads/                      ← Imágenes subidas
├── .env                          ← Variables de entorno (NO subir)
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## Endpoints REST

### AUTH
| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/auth/login` | No |
| POST | `/api/auth/logout` | JWT |
| POST | `/api/auth/change-password` | JWT |

### PRODUCTS
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/products` | No |
| GET | `/api/products/:id` | No |
| POST | `/api/products` | JWT |
| PUT | `/api/products/:id` | JWT |
| DELETE | `/api/products/:id` | JWT |
| DELETE | `/api/products/:id/images/:imgId` | JWT |

### CATEGORIES
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/categories` | No |
| GET | `/api/categories/with-count` | JWT |
| POST | `/api/categories` | JWT |
| PUT | `/api/categories/:id` | JWT |
| DELETE | `/api/categories/:id` | JWT |

### BARBER
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/barber/services` | No |
| POST | `/api/barber/services` | JWT |
| PUT | `/api/barber/services/:id` | JWT |
| DELETE | `/api/barber/services/:id` | JWT |
| GET | `/api/barber/media` | No |
| POST | `/api/barber/media` | JWT |
| DELETE | `/api/barber/media/:id` | JWT |

### ORDERS
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/orders` | JWT |
| GET | `/api/orders/:id` | JWT |
| POST | `/api/orders` | No |
| PUT | `/api/orders/:id/status` | JWT |

---

## Fase 7 — Eliminar archivos PHP ⏳

Archivos a eliminar:
- `config/conexion.php`
- `admin/*.php` (todos)
- `ropa.php`, `cosmeticos.php`, `barberia.php`
- `laguna_shop_database.sql`
- Convertir `index.php` → `index.html`

---

## Fase 8 — Migración del frontend ⏳

| Archivo PHP | Archivo HTML | Endpoint consumido |
|-------------|--------------|-------------------|
| `ropa.php` | `ropa.html` | `GET /api/products?seccion=ropa` |
| `cosmeticos.php` | `cosmeticos.html` | `GET /api/products?seccion=cosmetico` |
| `barberia.php` | `barberia.html` | `GET /api/barber/services` + `/api/barber/media` |
| `admin/panel.php` | Panel SPA | Todos los endpoints con JWT |

---

## Fase 9 — Cloudinary ⏳

- Integrar `cloudinary` + `multer-storage-cloudinary`
- Guardar URL en MongoDB en lugar del nombre de archivo local

---

## Fase 10 — Panel Admin ⏳

- **Opción A:** HTML + Vanilla JS + Bootstrap (rápida)
- **Opción B:** React + Vite + React Query (escalable)

---

## Fase 11 — Deploy ⏳

- **Backend:** Railway o Render
- **Frontend:** Vercel o Netlify
- **BD:** MongoDB Atlas (ya configurado)
- **Imágenes:** Cloudinary

---

## Variables de entorno necesarias

```env
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=clave-super-secreta-larga
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost,https://tudominio.com
NODE_ENV=development
```

---

## Comandos útiles

```bash
# Instalar dependencias
cd backend && npm install

# Desarrollo con hot-reload
npm run dev

# Poblar BD (solo una vez)
npm run seed

# Compilar a producción
npm run build && npm start
```
