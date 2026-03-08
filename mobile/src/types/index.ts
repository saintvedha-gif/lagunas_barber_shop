// ─── Auth ──────────────────────────────────────────────────────────
export interface Admin {
  _id: string;
  nombre: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

// ─── Categories / Colors ───────────────────────────────────────────
export interface Category {
  _id: string;
  nombre: string;
}

export interface Color {
  _id: string;
  nombre: string;
  hex: string;
}

// ─── Products ──────────────────────────────────────────────────────
export type ProductType = 'ropa' | 'cosmetico';

export interface ColorGroup {
  color: string;
  colorHex?: string;
  tallas: string[];
  stock: number;
  imagen?: string;
}

export interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: ProductType;
  categoria?: Category | string;
  coloresGrupos: ColorGroup[];
  imagen?: string;
  createdAt: string;
}

// ─── Barber Services ───────────────────────────────────────────────
export interface BarberService {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion?: number;
  imagen?: string;
  activo: boolean;
}

// ─── Orders ────────────────────────────────────────────────────────
export type OrderStatus = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';

export interface OrderItem {
  producto: Product | string;
  cantidad: number;
  precio: number;
  talla?: string;
  color?: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  estado: OrderStatus;
  nombre?: string;
  email?: string;
  telefono?: string;
  createdAt: string;
}

// ─── Navigation Params ─────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Admin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Productos: undefined;
  Pedidos: undefined;
  Barberia: undefined;
  Mas: undefined;
};

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductForm: { productId?: string };
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

export type BarberStackParamList = {
  BarberServicesList: undefined;
  BarberServiceForm: { serviceId?: string };
};

export type MasStackParamList = {
  MasMenu: undefined;
  Categorias: undefined;
  Colores: undefined;
  Settings: undefined;
};
