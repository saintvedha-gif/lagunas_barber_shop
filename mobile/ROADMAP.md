# 📱 Lagunas Barbershop — App Móvil Android (Admin Panel)

> React Native 0.84.1 · TypeScript · Android · API: https://lagunas-barber-shop.onrender.com

---

## ✅ Requisitos y Stack Técnico

| Categoría        | Tecnología                              |
|------------------|-----------------------------------------|
| Framework        | React Native CLI 0.84.1                 |
| Lenguaje         | TypeScript                              |
| Navegación       | React Navigation v7 (Stack + BottomTabs)|
| Estado global    | Zustand                                 |
| HTTP Client      | Axios                                   |
| Almacenamiento   | AsyncStorage (JWT token)                |
| Formularios      | React Hook Form                         |
| Iconos           | React Native Vector Icons               |
| Imágenes         | React Native Image Picker               |
| Splash Screen    | react-native-splash-screen              |
| UI Components    | Custom + React Native Paper (opcional)  |
| Target           | Android (primario)                      |
| Backend URL      | https://lagunas-barber-shop.onrender.com|

---

## 🗺️ Módulos — Progreso

| # | Módulo                    | Estado       | Descripción                                        |
|---|---------------------------|--------------|----------------------------------------------------|
| 1 | Estructura base + Nav     | ✅ Completo  | Setup navegación, tema, estructura de carpetas     |
| 2 | Auth (Login)              | ✅ Completo  | Pantalla login, JWT, guardas de ruta               |
| 3 | Dashboard                 | ✅ Completo  | Overview: resumen de pedidos, productos, servicios |
| 4 | Productos (CRUD)          | ✅ Completo  | Listar, crear, editar, eliminar productos          |
| 5 | Categorías                | ✅ Completo  | Gestión de categorías con modal                    |
| 6 | Pedidos                   | ✅ Completo  | Ver pedidos, cambiar estado (pendiente/completado) |
| 7 | Servicios de Barbería     | ✅ Completo  | CRUD de servicios, subida de fotos                 |
| 8 | Configuración de App      | ✅ Completo  | Cambiar contraseña, info del admin                 |
| 9 | Splash Screen + Icono     | ✅ Completo  | Logo artguru como splash, react-native-splash-screen|

---

## 📁 Estructura de Carpetas Objetivo

```
mobile/
├── android/                    # Proyecto Android nativo
├── ios/                        # Ignorado (solo Android)
├── src/
│   ├── api/
│   │   ├── client.ts           # Axios instance con baseURL + interceptor JWT
│   │   ├── auth.api.ts
│   │   ├── products.api.ts
│   │   ├── categories.api.ts
│   │   ├── colors.api.ts
│   │   ├── orders.api.ts
│   │   └── barber.api.ts
│   ├── components/
│   │   ├── common/             # Button, Input, Card, LoadingSpinner, etc.
│   │   └── screens/            # Componentes específicos de cada pantalla
│   ├── navigation/
│   │   ├── AppNavigator.tsx    # Root navigator (Auth vs Admin)
│   │   ├── AuthNavigator.tsx   # Stack para Login
│   │   └── AdminNavigator.tsx  # Bottom tabs del panel admin
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── products/
│   │   │   ├── ProductsListScreen.tsx
│   │   │   ├── ProductFormScreen.tsx
│   │   │   └── ProductDetailScreen.tsx
│   │   ├── orders/
│   │   │   ├── OrdersListScreen.tsx
│   │   │   └── OrderDetailScreen.tsx
│   │   ├── barber/
│   │   │   ├── BarberServicesScreen.tsx
│   │   │   └── BarberServiceFormScreen.tsx
│   │   ├── categories/
│   │   │   └── CategoriesScreen.tsx
│   │   └── settings/
│   │       └── SettingsScreen.tsx
│   ├── store/
│   │   └── authStore.ts        # Zustand: token, admin info, login/logout
│   ├── types/
│   │   └── index.ts            # Tipos globales (Product, Order, Barber, etc.)
│   └── utils/
│       └── imageUrl.ts         # Helper para URLs de Cloudinary
├── App.tsx                     # Entry point
├── ROADMAP.md                  # Este archivo
└── package.json
```

---

## 🔐 Módulo 2 — Auth (Login)

**Ruta API:** `POST /api/auth/login`
**Body:** `{ email, password }`
**Respuesta:** `{ token, admin: { _id, nombre, email } }`

### Flujo:
1. App abre → revisar AsyncStorage por token guardado
2. Si token existe → ir a Admin (Dashboard)
3. Si no → mostrar LoginScreen
4. Login exitoso → guardar token en AsyncStorage → navegar a Dashboard
5. Logout → eliminar token → regresar a LoginScreen

---

## 📦 Módulo 4 — Productos (CRUD)

**Endpoints:**
- `GET /api/products` — lista todos
- `POST /api/products` — crear (multipart/form-data con imagen)
- `PUT /api/products/:id` — editar
- `DELETE /api/products/:id` — eliminar

**Campos:** nombre, descripcion, precio, categoria, tipo (ropa/cosmetico), colores, tallas, stock, imagen

---

## 🛒 Módulo 6 — Pedidos

**Endpoints:**
- `GET /api/orders` — lista con populate de productos
- `PATCH /api/orders/:id` — cambiar estado

**Estados:** `pendiente` → `en_proceso` → `completado` / `cancelado`

---

## ✂️ Módulo 7 — Servicios de Barbería

**Endpoints:**
- `GET /api/barber` — lista servicios
- `POST /api/barber` — crear (multipart imagen)
- `PUT /api/barber/:id` — editar
- `DELETE /api/barber/:id` — eliminar

---

## 🎨 Módulo 9 — Splash Screen + Ícono

**Logo fuente:** `frontend/public/img/logo-artguru.png`

**Android resources necesarios:**
- `android/app/src/main/res/mipmap-*/ic_launcher.png` — ícono en varias resoluciones
- `android/app/src/main/res/drawable/splash.png` — imagen de splash
- Integrar `react-native-splash-screen`

---

## 🔄 Commits Objetivo por Módulo

```
feat(mobile): setup estructura base + navegacion React Navigation v7
feat(mobile): auth — login screen con JWT + AsyncStorage
feat(mobile): dashboard — overview stats
feat(mobile): productos — lista + CRUD completo
feat(mobile): categorias y colores
feat(mobile): pedidos — lista + cambio de estado
feat(mobile): servicios barberia — CRUD + imagen
feat(mobile): configuracion admin — cambio de password
feat(mobile): splash screen + icono con logo artguru
```

---

## 📌 Notas de Desarrollo

- El JWT se envía en header: `Authorization: Bearer <token>`
- Todas las rutas admin requieren autenticación
- Las imágenes se suben via `multipart/form-data`
- Cloudinary devuelve URL directamente desde el backend
- Backend desplegado en Render (puede tener cold start de ~30s)
- Recomendado: mostrar loading cuando el backend tarda en responder

---

*Última actualización: v1.0 — Todos los módulos implementados. Listo para build Android.*
