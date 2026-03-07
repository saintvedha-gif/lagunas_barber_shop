# ROADMAP FRONTEND — Migración PHP → Next.js

> **Objetivo:** Reemplazar el frontend PHP (index/ropa/cosmeticos/barberia + admin) por una
> aplicación Next.js (App Router) que consuma exclusivamente la REST API del `/backend`
> (Node.js + TypeScript + MongoDB).  
> **Regla de oro:** no se toca ningún archivo dentro de `/backend`.

---

## Estado actual del frontend PHP

| Archivo/Módulo       | Descripción                                                                   |
|----------------------|-------------------------------------------------------------------------------|
| `index.php`          | Hero estático (fondo_barber.jpeg) + 3 botones de navegación                  |
| `barberia.php`       | Lista de precios + portafolio multimedia + CTA WhatsApp                        |
| `cosmeticos.php`     | Tienda con filtros por categoría, buscador y carrito → WhatsApp               |
| `ropa.php`           | Tienda con zoom, colores, tallas, oferta y carrito → WhatsApp                 |
| `admin/index.php`    | Login (bcrypt + CSRF + IP lockout)                                            |
| `admin/panel.php`    | Dashboard con tabs Ropa / Cosméticos                                          |
| `admin/agregar.php`  | Alta de producto con grupos de imagen por color                               |
| `admin/editar.php`   | Edición + AJAX para color de imágenes                                         |
| `admin/eliminar.php` | Baja con borrado físico de imágenes                                           |
| `admin/categorias.php` | CRUD de categorías (ropa / cosméticos)                                      |
| `admin/barberia.php` | CRUD servicios + portafolio multimedia con orden                              |
| `js/cart.js`         | Carrito para cosméticos (array en memoria → WhatsApp)                         |
| `js/cart-ropa.js`    | Carrito extendido para ropa (talla + color + zoom → WhatsApp)                 |
| `js/shop-filters.js` | Filtrado por categoría y búsqueda de texto compartido                         |
| `config/conexion.php`| PDO Singleton → será completamente reemplazado por fetch al backend           |

### Dependencias actuales a eliminar
- Bootstrap 5.3 (CDN) → reemplazar con Tailwind CSS v4
- PHP PDO / MySQL → fetch a REST API (`http://localhost:4000/api`)
- Google Fonts CDN → `next/font`
- Bootstrap Icons CDN → `lucide-react`
- Archivos PHP estáticos → pages de Next.js

---

## Stack tecnológico del nuevo frontend

| Capa             | Tecnología                        | Justificación                             |
|------------------|-----------------------------------|-------------------------------------------|
| Framework        | **Next.js 15** (App Router)       | SSR/SSG/ISR nativo, File-based routing    |
| Lenguaje         | **TypeScript**                    | Consistencia con el backend               |
| Estilos          | **Tailwind CSS v4**               | Utility-first, sin CDN, tree-shakeable    |
| Iconos           | **lucide-react**                  | Reemplaza Bootstrap Icons                 |
| Estado cliente   | **Zustand**                       | Carrito ligero sin Redux overhead         |
| Fetching         | **fetch nativo + React Query v5** | Cache + revalidación automática           |
| Auth admin       | **JWT en httpOnly cookie**        | Elimina riesgo XSS vs localStorage        |
| Fuentes          | **next/font** (Bebas Neue + Roboto)| Sin FOUT, sin CDN externo                |
| Imágenes         | **next/image**                    | Optimización automática (WebP, lazy)      |
| Formularios      | **react-hook-form + zod**         | Validación tipada en formularios admin    |
| Subida de imgs   | **FormData + fetch** al backend   | El backend ya maneja multer               |
| Linting          | **ESLint + Prettier**             | Código consistente                        |

---

## Estructura de carpetas propuesta

```
frontend/                          ← nueva carpeta en la raíz del repo
├── public/
│   └── img/                       ← imágenes estáticas (logo, fondo_barber.jpeg)
├── src/
│   ├── app/
│   │   ├── layout.tsx             ← Navbar global, fuentes, metadata raíz
│   │   ├── page.tsx               ← /  → hero (index.php)
│   │   ├── barberia/
│   │   │   └── page.tsx           ← /barberia
│   │   ├── cosmeticos/
│   │   │   └── page.tsx           ← /cosmeticos
│   │   ├── ropa/
│   │   │   └── page.tsx           ← /ropa
│   │   └── admin/
│   │       ├── layout.tsx         ← layout del panel (protegido)
│   │       ├── login/
│   │       │   └── page.tsx       ← /admin/login
│   │       ├── page.tsx           ← /admin  → dashboard
│   │       ├── productos/
│   │       │   ├── page.tsx       ← listado
│   │       │   ├── nuevo/
│   │       │   │   └── page.tsx   ← agregar producto
│   │       │   └── [id]/
│   │       │       └── page.tsx   ← editar producto
│   │       ├── categorias/
│   │       │   └── page.tsx
│   │       └── barberia/
│   │           └── page.tsx       ← servicios + portafolio
│   ├── components/
│   │   ├── ui/                    ← componentes base reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Input.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         ← navbar con scroll effect (main.js → hook)
│   │   │   └── Footer.tsx
│   │   ├── shop/
│   │   │   ├── ProductCard.tsx    ← card con zoom, colores, tallas
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CategorySidebar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── CartDrawer.tsx     ← carrito flotante → WhatsApp
│   │   ├── barberia/
│   │   │   ├── PricingCard.tsx
│   │   │   └── PortfolioGrid.tsx
│   │   └── admin/
│   │       ├── ProductForm.tsx    ← alta + edición unificada
│   │       ├── ImageUploader.tsx  ← grupos por color
│   │       ├── CategoryManager.tsx
│   │       └── BarberiaManager.tsx
│   ├── hooks/
│   │   ├── useCart.ts             ← Zustand store (cosmético + ropa)
│   │   ├── useScrolled.ts         ← navbar scroll effect
│   │   └── useAuth.ts             ← JWT + cookie
│   ├── lib/
│   │   ├── api.ts                 ← cliente fetch tipado (base URL configurable)
│   │   └── whatsapp.ts            ← helper enviarPedido()
│   ├── types/
│   │   └── index.ts               ← interfaces: Product, Category, BarberService, etc.
│   └── middleware.ts              ← protege rutas /admin/* si no hay token
├── .env.local                     ← NEXT_PUBLIC_API_URL=http://localhost:4000
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Mapeo de endpoints del backend

La API ya está implementada en `/backend`. El frontend la consumirá así:

### Productos
| Acción                    | Método | Endpoint                               | Quién la usa              |
|---------------------------|--------|----------------------------------------|---------------------------|
| Listar (con filtros)      | GET    | `/api/products?seccion=ropa&page=1`    | ropa.tsx, cosmeticos.tsx  |
| Buscar por texto          | GET    | `/api/products?q=camisa`               | shop/SearchBar.tsx        |
| Filtrar por categoría     | GET    | `/api/products?seccion=ropa&categoria=:id` | CategorySidebar.tsx   |
| Filtrar ofertas           | GET    | `/api/products?oferta=1`               | ropa.tsx                  |
| Detalle de producto       | GET    | `/api/products/:id`                    | modal/detalle             |
| Crear producto            | POST   | `/api/products`                        | admin/productos/nuevo     |
| Editar producto           | PUT    | `/api/products/:id`                    | admin/productos/[id]      |
| Eliminar producto         | DELETE | `/api/products/:id`                    | admin/dashboard           |
| Eliminar imagen           | DELETE | `/api/products/:id/images/:imgId`      | admin/productos/[id]      |

### Categorías
| Acción                    | Método | Endpoint                               | Quién la usa              |
|---------------------------|--------|----------------------------------------|---------------------------|
| Listar (públicas)         | GET    | `/api/categories?seccion=ropa`         | CategorySidebar.tsx       |
| Listar con conteo         | GET    | `/api/categories/with-count`           | admin/categorias          |
| Crear                     | POST   | `/api/categories`                      | admin/categorias          |
| Renombrar                 | PUT    | `/api/categories/:id`                  | admin/categorias          |
| Eliminar                  | DELETE | `/api/categories/:id`                  | admin/categorias          |

### Barbería
| Acción                    | Método | Endpoint                               | Quién la usa              |
|---------------------------|--------|----------------------------------------|---------------------------|
| Servicios públicos        | GET    | `/api/barber/services`                 | barberia/page.tsx         |
| Crear servicio            | POST   | `/api/barber/services`                 | admin/barberia            |
| Editar servicio           | PUT    | `/api/barber/services/:id`             | admin/barberia            |
| Eliminar servicio         | DELETE | `/api/barber/services/:id`             | admin/barberia            |
| Portafolio público        | GET    | `/api/barber/media`                    | barberia/page.tsx         |
| Subir media               | POST   | `/api/barber/media`                    | admin/barberia            |
| Eliminar media            | DELETE | `/api/barber/media/:id`                | admin/barberia            |

### Auth (Admin)
| Acción                    | Método | Endpoint                               | Quién la usa              |
|---------------------------|--------|----------------------------------------|---------------------------|
| Login                     | POST   | `/api/auth/login`                      | admin/login               |
| Logout                    | POST   | `/api/auth/logout`                     | navbar admin              |
| Cambiar contraseña        | POST   | `/api/auth/change-password`            | admin/perfil              |

### Órdenes
| Acción                    | Método | Endpoint                               | Quién la usa              |
|---------------------------|--------|----------------------------------------|---------------------------|
| Crear orden               | POST   | `/api/orders`                          | CartDrawer.tsx (WhatsApp) |
| Listar órdenes            | GET    | `/api/orders`                          | admin/dashboard           |
| Ver orden                 | GET    | `/api/orders/:id`                      | admin/ordenes             |
| Actualizar estado         | PUT    | `/api/orders/:id/status`               | admin/ordenes             |

### Imágenes (uploads)
El backend sirve imágenes estáticas en `/uploads/:filename`.  
En producción usar `process.env.NEXT_PUBLIC_API_URL + '/uploads/' + nombreArchivo`.

---

## Plan de fases

### FASE 1 — Scaffolding del proyecto Next.js ✅
**Objetivo:** tener un proyecto Next.js 16 corriendo con Tailwind y TypeScript.

- [x] `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"` → **Next.js 16.1.6**
- [x] Instalar dependencias: `zustand @tanstack/react-query lucide-react react-hook-form zod jose`
- [x] Configurar `next.config.ts` con `images.remotePatterns` (localhost:4000, railway.app, render.com)
- [x] Crear `frontend/.env.local` con `NEXT_PUBLIC_API_URL`, `API_URL` y `JWT_SECRET`
- [x] Crear `src/lib/api.ts` — cliente fetch tipado con helpers para todos los endpoints
- [x] Crear `src/lib/whatsapp.ts` — helper `enviarPedido()` con formato en español
- [x] Crear `src/types/index.ts` — interfaces Product, Category, BarberService, BarberMedia, Order, CartItem
- [x] Crear `src/hooks/useCart.ts` — Zustand store con persistencia en localStorage
- [x] Crear `src/hooks/useScrolled.ts` — hook para efecto scroll de la navbar
- [x] Configurar fuentes Bebas Neue + Roboto en `src/app/layout.tsx`
- [x] Actualizar `src/app/globals.css` con design tokens del proyecto (colores, tipografía)
- [x] Crear `src/proxy.ts` — protección de rutas `/admin/*` con JWT (⚠️ Next.js 16 usa `proxy.ts` en lugar de `middleware.ts`, y la función debe llamarse `proxy`)

> **Nota Next.js 16:** el archivo de proxy/middleware se llama `src/proxy.ts` y debe exportar `export async function proxy(req)` en lugar de `middleware`.

**Entregable:** `npm run build` exitoso sin warnings. Fuentes, tipos y cliente API listos.

---

### FASE 2 — Layout global y Navbar ✅
**Objetivo:** replicar la navbar del PHP con el efecto scroll.

- [x] Crear `src/components/layout/Navbar.tsx`
  - Logo (`next/image` desde `public/img/logo-artguru.png`)
  - Links: Inicio / Ropa / Barbería / Cosméticos
  - Menú hamburguesa responsivo para móvil
  - Efecto scroll — hook `useScrolled.ts` (reemplaza `main.js`)
  - Indicador del carrito (badge con count desde Zustand) en páginas de tienda
- [x] Crear `src/components/layout/Footer.tsx` con links, dirección, horario y redes sociales
- [x] Crear `src/components/Providers.tsx` (React Query `QueryClientProvider`)
- [x] Actualizar `src/app/layout.tsx` con Navbar + Footer + Providers
- [x] Mover `logo-artguru.png` y `fondo_barber.jpeg` a `public/img/`

**Entregable:** navbar funcional con scroll effect en todas las páginas.

---

### FASE 3 — Página de inicio (Hero) ✅
**Objetivo:** replicar `index.php`.

- [x] Crear `src/app/page.tsx`
  - Hero a pantalla completa con `fondo_barber.jpeg` (`background-attachment: fixed`)
  - Overlay con `rgba(0,0,0,0.75)`
  - Título con Bebas Neue, letter-spacing
  - 3 botones píldora: Ver Ropa → `/ropa`, Barbería → `/barberia`, Cosméticos → `/cosmeticos`
- [x] Imágenes estáticas en `frontend/public/img/`

**Entregable:** `/` visualmente idéntico al `index.php` actual. Servidor en `http://localhost:3000` respondiendo 200.

---

### FASE 4 — Tienda de Cosméticos
**Objetivo:** replicar `cosmeticos.php` conectado al backend.

- [ ] Crear `src/app/cosmeticos/page.tsx` con:
  - `fetch('/api/categories?seccion=cosmetico')` → Sidebar de categorías
  - `fetch('/api/products?seccion=cosmetico')` → grid de productos
  - Soporte `searchParams` para filtro por categoría en la URL
  - SSR para la carga inicial (SEO)
- [ ] Crear `src/components/shop/CategorySidebar.tsx` — navegación por URL params
- [ ] Crear `src/components/shop/ProductCard.tsx`:
  - Badge "ÚLTIMAS UNIDADES" si `stock ≤ 3`
  - Precio en verde
  - Botón AÑADIR → store Zustand
- [ ] Crear `src/components/shop/ProductGrid.tsx` con paginación
- [ ] Crear `src/components/shop/SearchBar.tsx` — filtrado client-side
- [ ] Implementar `src/hooks/useCart.ts` (Zustand):
  - `items: { producto, cantidad, variante? }[]`
  - `agregar`, `cambiarCantidad`, `eliminar`, `vaciar`
  - Persistencia en `localStorage`
- [ ] Crear `src/lib/whatsapp.ts`:
  - `enviarPedido(items, telefono)` → genera mensaje y abre `https://wa.me/+573028326617`
- [ ] Crear `src/components/shop/CartDrawer.tsx`:
  - Botón flotante circular con badge
  - Drawer con lista de productos, cantidades y total
  - Botón "Enviar por WhatsApp"

**Entregable:** `/cosmeticos` funciona con la API real.

---

### FASE 5 — Tienda de Ropa
**Objetivo:** replicar `ropa.php` con todas sus features avanzadas.

- [ ] Crear `src/app/ropa/page.tsx`
- [ ] Extender `ProductCard.tsx` para `seccion === 'ropa'`:
  - Zoom de imagen en hover (hook `useZoom.ts` — reemplaza `zoomMover/zoomReset`)
  - Miniaturas por color (`next/image` para cada imagen del grupo)
  - Bolitas de color (`.colorSwatch`) sincronizadas con miniatura activa
  - Select de tallas generado desde `producto.tallas[]`
  - Badge OFERTA + precio tachado (`precioAnterior`)
  - Botón AÑADIR → `agregarAlCarrito({ nombre, precio, talla, color, imagen })`
- [ ] `CartDrawer.tsx` ya comparte la store — mostrar talla y color por ítem
- [ ] Corregir el bug PHP de los `onclick` (no aplica en React, se resuelve naturalmente)

**Entregable:** `/ropa` con zoom, colores, tallas y carrito funcionales.

---

### FASE 6 — Página de Barbería
**Objetivo:** replicar `barberia.php` conectado al backend.

- [ ] Crear `src/app/barberia/page.tsx`
  - `fetch('/api/barber/services')` → lista de precios (SSR)
  - `fetch('/api/barber/media')` → portafolio multimedia (SSR)
- [ ] Crear `src/components/barberia/PricingCard.tsx` — tarjeta nombre/precio
- [ ] Crear `src/components/barberia/PortfolioGrid.tsx`:
  - Imágenes locales: `<Image>` con URL del backend
  - Videos locales: `<video>` con URL del backend
  - Embeds externos: `<iframe>` (YouTube / Instagram)
- [ ] Sección CTA WhatsApp: número, dirección, horario (datos estáticos)
- [ ] Iconos de redes sociales: TikTok, Instagram, Facebook (lucide-react)

**Entregable:** `/barberia` con datos dinámicos desde la API.

---

### FASE 7 — Panel de Administración
**Objetivo:** replicar todo el `admin/` PHP con protección por JWT.

#### 7.1 — Auth
- [ ] Crear `src/middleware.ts` — protege todas las rutas `/admin/*` excepto `/admin/login`
  - Lee JWT de cookie `auth_token`
  - Si no hay token válido → redirect a `/admin/login`
- [ ] Crear `src/hooks/useAuth.ts`:
  - `login(usuario, password)` → POST `/api/auth/login` → guarda token en cookie httpOnly
  - `logout()` → POST `/api/auth/logout` → limpia cookie
  - `changePassword(actual, nuevo)` → POST `/api/auth/change-password`
- [ ] Crear `src/app/admin/login/page.tsx`:
  - Formulario usuario + password (react-hook-form + zod)
  - Toggle mostrar/ocultar contraseña (lucide-react `Eye/EyeOff`)
  - Manejo de error 429 (demasiados intentos)
- [ ] Crear `src/app/admin/layout.tsx` — sidebar de navegación admin

#### 7.2 — Dashboard
- [ ] Crear `src/app/admin/page.tsx`:
  - Tabs: Ropa | Cosméticos
  - Tabla de productos con: miniatura, nombre, precio, oferta, categoría, stock
  - Botones Editar → `/admin/productos/:id` | Borrar (DELETE con confirmación)
  - Accesos rápidos: Agregar, Categorías, Barbería, Cambiar contraseña, Cerrar sesión

#### 7.3 — Gestión de Productos
- [ ] Crear `src/components/admin/ProductForm.tsx` unificado (alta + edición):
  - Campos: nombre, sección, categoría (filtrada por sección), precio, precioAnterior, oferta, stock, tallas, colores, descripción
  - Sección de imágenes: grupos por color (`agregarGrupoColor`)
  - Preview de imágenes con badge de color editable
  - Validación con zod
  - Submit como `multipart/form-data` al backend
- [ ] Crear `src/app/admin/productos/nuevo/page.tsx` → POST `/api/products`
- [ ] Crear `src/app/admin/productos/[id]/page.tsx` → GET + PUT `/api/products/:id`
  - Eliminar imagen individual → DELETE `/api/products/:id/images/:imgId`

#### 7.4 — Categorías
- [ ] Crear `src/app/admin/categorias/page.tsx`:
  - GET `/api/categories/with-count`
  - Listado separado por sección con conteo de productos
  - Crear nueva categoría → POST `/api/categories`
  - Renombrar (modal inline) → PUT `/api/categories/:id`
  - Eliminar (con validación de productos asignados) → DELETE `/api/categories/:id`

#### 7.5 — Gestión de Barbería
- [ ] Crear `src/app/admin/barberia/page.tsx` con 2 tabs:
  - **Servicios**: CRUD completo (modal edición) → endpoints `/api/barber/services`
  - **Portafolio**: subir imagen/video (50MB) o URL YouTube → `/api/barber/media`
    - Grid con preview + botón eliminar
    - Auto-conversión URL YouTube a embed (helper en `src/lib/whatsapp.ts` o `utils.ts`)

**Entregable:** panel admin completamente funcional con JWT.

---

### FASE 8 — Variables de entorno y configuración
- [ ] `.env.local` (desarrollo):
  ```
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```
- [ ] `.env.production`:
  ```
  NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
  ```
- [ ] `next.config.ts`:
  ```ts
  const nextConfig = {
    images: {
      remotePatterns: [
        { protocol: 'http',  hostname: 'localhost',             port: '4000', pathname: '/uploads/**' },
        { protocol: 'https', hostname: 'tu-backend.railway.app', pathname: '/uploads/**' },
      ],
    },
  };
  ```

---

### FASE 9 — Limpieza de archivos PHP ✅

- [x] Eliminar `index.php`, `barberia.php`, `cosmeticos.php`, `ropa.php`
- [x] Eliminar carpeta `admin/`
- [x] Eliminar `config/conexion.php` y carpeta `config/`
- [x] Eliminar `js/cart.js`, `js/cart-ropa.js`, `js/shop-filters.js`, `js/main.js`
- [x] Eliminar carpeta `css/`
- [x] Imágenes de portafolio gestionadas por el backend (`uploads/`)
- [x] Eliminar `laguna_shop_database.sql` (el proyecto usa MongoDB)

---

### FASE 10 — Deploy en Render (servicio único)

Arquitectura: un solo Web Service en Render arranca el backend (puerto 4000 interno)
y Next.js (puerto `$PORT` público). Next.js proxea `/api/*` y `/uploads/*`
al backend mediante rewrites, por lo que el navegador solo habla con un dominio.

#### Pasos

1. **Subir cambios a GitHub** (`git push`)
2. En [render.com](https://render.com) → **New Web Service** → conectar el repo
3. Configurar el servicio:
   | Campo | Valor |
   |---|---|
   | **Root Directory** | *(dejar vacío, raíz del repo)* |
   | **Build Command** | `npm run build` |
   | **Start Command** | `npm run start` |
   | **Node Version** | 20 |
4. Agregar **variables de entorno** en el dashboard de Render:

   | Variable | Valor | Notas |
   |---|---|---|
   | `MONGODB_URI` | `mongodb+srv://...` | URI de MongoDB Atlas |
   | `JWT_SECRET` | `lagunas_barber_...` | Igual al del backend local |
   | `NEXT_PUBLIC_API_URL` | *(cadena vacía)* | Cliente usa same-domain via rewrites |
   | `API_URL` | `http://localhost:4000` | Servidor Next.js accede directo al backend |
   | `BACKEND_URL` | `http://localhost:4000` | Para rewrites en `next.config.ts` |
   | `ALLOWED_ORIGINS` | `https://tu-app.onrender.com` | CORS en el backend |
   | `PORT` | | Render lo inyecta automáticamente |

5. Hacer deploy y verificar logs
6. Cambiar `ALLOWED_ORIGINS` al dominio final si se usa dominio personalizado

---

## Notas técnicas importantes

### Manejo de imágenes del backend
```tsx
// src/lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function imgUrl(nombreArchivo: string): string {
  return `${API_URL}/uploads/${nombreArchivo}`;
}
```
Usar con `next/image`:
```tsx
<Image src={imgUrl(producto.imagenes[0].nombreArchivo)} alt={producto.nombre} fill />
```

### Carrito con Zustand
```ts
// src/hooks/useCart.ts
interface CartItem {
  id:       string;  // _id de MongoDB
  nombre:   string;
  precio:   number;
  imagen:   string;
  cantidad: number;
  talla?:   string;
  color?:   string;
}
```

### Auth con cookie httpOnly (Server Action)
El token JWT se almacena en una cookie httpOnly para evitar robo por XSS:
```ts
// src/app/admin/login/actions.ts  (Server Action)
'use server';
import { cookies } from 'next/headers';

export async function loginAction(usuario: string, password: string) {
  const res = await fetch(`${process.env.API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password }),
  });
  if (!res.ok) throw new Error('Credenciales incorrectas');
  const { token } = await res.json();
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60,
    path:     '/',
  });
}
```

### Middleware de protección admin
```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
```
> `JWT_SECRET` en el servidor de Next.js debe coincidir con el del backend (sin prefijo `NEXT_PUBLIC_`).

### WhatsApp helper
```ts
// src/lib/whatsapp.ts
const TELEFONO = '573028326617';

export function enviarPedido(items: CartItem[]): void {
  const lineas = items.map(
    (i) =>
      `▪ ${i.nombre}${i.talla ? ` | Talla: ${i.talla}` : ''}${i.color ? ` | Color: ${i.color}` : ''} × ${i.cantidad} — $${(i.precio * i.cantidad).toLocaleString('es-CO')}`
  );
  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const mensaje = `🛍️ *Pedido Laguna's Barber & Shop*\n\n${lineas.join('\n')}\n\n*Total: $${total.toLocaleString('es-CO')}*`;
  window.open(`https://wa.me/${TELEFONO}?text=${encodeURIComponent(mensaje)}`, '_blank');
}
```

---

## Progreso

| Fase | Descripción                        | Estado        |
|------|------------------------------------|---------------|
| 1    | Scaffolding Next.js + Tailwind     | ✅ Completado |
| 2    | Layout global + Navbar             | ✅ Completado |
| 3    | Página de inicio (Hero)            | ✅ Completado |
| 4    | Tienda Cosméticos                  | ✅ Completado |
| 5    | Tienda Ropa                        | ✅ Completado |
| 6    | Página Barbería                    | ✅ Completado |
| 7    | Panel de Administración            | ✅ Completado |
| 8    | Variables de entorno y config      | ✅ Completado |
| 9    | Limpieza de archivos PHP           | ✅ Completado |
| 10   | Deploy (Render servicio único)     | ⏳ Pendiente  |
