// Tipos sincronizados con los modelos Mongoose del /backend

// ─── Categoría ───────────────────────────────────────────────────────────────
export interface Category {
  _id: string;
  nombre: string;
  seccion: "ropa" | "cosmetico";
  activa: boolean;
  creadaEn: string;
  subcategorias: string[];
  // solo presente con /api/categories/with-count
  totalProductos?: number;
}

// ─── Producto ─────────────────────────────────────────────────────────────────
export interface ProductImage {
  _id: string;
  nombreArchivo: string;
  color: string | null;
  esPortada: boolean;
  orden: number;
}

export interface Product {
  _id: string;
  nombre: string;
  seccion: "ropa" | "cosmetico";
  categoria: Category | string | null;
  precio: number;
  precioAnterior?: number | null;
  enOferta: boolean;
  stock: number;
  tallas: string[];
  colores: string[];
  descripcion?: string | null;
  imagenes: ProductImage[];
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

// ─── Barbería ─────────────────────────────────────────────────────────────────
export interface BarberService {
  _id: string;
  nombre: string;
  precio: number;
  descripcion?: string | null;
  activo: boolean;
  orden: number;
}

export interface BarberMedia {
  _id: string;
  tipo: "imagen" | "video" | "embed";
  nombreArchivo?: string | null;
  urlEmbed?: string | null;
  descripcion?: string | null;
  activo: boolean;
  orden: number;
}

// ─── Órdenes ──────────────────────────────────────────────────────────────────
export interface OrderItem {
  producto: string; // ID del producto
  nombre: string;
  precio: number;
  cantidad: number;
  talla?: string;
  color?: string;
  imagen?: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  estado: "pendiente" | "confirmado" | "enviado" | "entregado" | "cancelado";
  notas?: string;
  creadaEn: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  usuario: string;
  nombre: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

// ─── Respuestas paginadas ─────────────────────────────────────────────────────
export interface PaginatedProducts {
  productos: Product[];
  total: number;
  page: number;
  limit: number;
}

// ─── Carrito (estado cliente — Zustand) ───────────────────────────────────────
export interface CartItem {
  id: string;       // _id del producto
  nombre: string;
  precio: number;
  imagen: string;   // nombreArchivo de la imagen portada
  cantidad: number;
  talla?: string;
  color?: string;
}

// ─── Filtros de tienda ────────────────────────────────────────────────────────
export interface ShopFilters {
  seccion?: "ropa" | "cosmetico";
  categoria?: string;
  oferta?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}
