import type { ShopFilters, LoginResponse } from "@/types";

// Servidor (RSC, Server Actions): acceso interno directo al backend
// Cliente (browser): "" → las peticiones van al mismo dominio vía rewrites
// Limpia comillas accidentales: si en Render NEXT_PUBLIC_API_URL se guardó
// como   ''   o   ""   (con comillas literales), las removemos.
function cleanUrl(raw: string | undefined, fallback: string): string {
  if (raw === undefined) return fallback;
  const trimmed = raw.replace(/^['"`]+|['"`]+$/g, "").trim();
  return trimmed || fallback;
}

export const API_URL =
  typeof window === "undefined"
    ? cleanUrl(process.env.API_URL, "http://localhost:4000")
    : cleanUrl(process.env.NEXT_PUBLIC_API_URL, "");

/** Devuelve la URL de una imagen almacenada en MongoDB.
 *  nombreArchivo ahora es el _id del documento ImageFile.
 *  Ruta relativa → funciona vía rewrites en producción. */
export function imgUrl(nombreArchivo: string): string {
  return `/api/images/${nombreArchivo}`;
}

/** Convierte una URL de YouTube a su versión embed */
export function toYoutubeEmbed(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}

// ─── Headers compartidos ──────────────────────────────────────────────────────
function authHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body?.error ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Productos ────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (filters: ShopFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.seccion)   params.set("seccion",   filters.seccion);
    if (filters.categoria) params.set("categoria", filters.categoria);
    if (filters.oferta)    params.set("oferta",    "1");
    if (filters.q)         params.set("q",         filters.q);
    if (filters.page)      params.set("page",      String(filters.page));
    if (filters.limit)     params.set("limit",     String(filters.limit));
    return fetch(`${API_URL}/api/products?${params}`, { next: { revalidate: 60 } });
  },

  get: (id: string) =>
    fetch(`${API_URL}/api/products/${id}`, { next: { revalidate: 60 } }),

  create: (formData: FormData, token: string) =>
    fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }),

  update: (id: string, formData: FormData, token: string) =>
    fetch(`${API_URL}/api/products/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }),

  delete: (id: string, token: string) =>
    fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  deleteImage: (productId: string, imgId: string, token: string) =>
    fetch(`${API_URL}/api/products/${productId}/images/${imgId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
};

// ─── Categorías ───────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: (seccion?: "ropa" | "cosmetico") => {
    const params = seccion ? `?seccion=${seccion}` : "";
    return fetch(`${API_URL}/api/categories${params}`, { next: { revalidate: 60 } });
  },

  withCount: (token: string) =>
    fetch(`${API_URL}/api/categories/with-count`, {
      headers: authHeaders(token),
    }),

  create: (body: { nombre: string; seccion: string }, token: string) =>
    fetch(`${API_URL}/api/categories`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),

  update: (id: string, nombre: string, token: string) =>
    fetch(`${API_URL}/api/categories/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ nombre }),
    }),

  delete: (id: string, token: string) =>
    fetch(`${API_URL}/api/categories/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  addSubcategoria: (id: string, nombre: string, token: string) =>
    fetch(`${API_URL}/api/categories/${id}/subcategorias`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ nombre }),
    }),

  removeSubcategoria: (id: string, nombre: string, token: string) =>
    fetch(`${API_URL}/api/categories/${id}/subcategorias/${encodeURIComponent(nombre)}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
};

// ─── Barbería ─────────────────────────────────────────────────────────────────
export const barberApi = {
  getServices: () =>
    fetch(`${API_URL}/api/barber/services`, { next: { revalidate: 60 } }),

  createService: (
    body: { nombre: string; precio: number; descripcion?: string },
    token: string
  ) =>
    fetch(`${API_URL}/api/barber/services`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),

  updateService: (
    id: string,
    body: { nombre?: string; precio?: number; descripcion?: string },
    token: string
  ) =>
    fetch(`${API_URL}/api/barber/services/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }),

  deleteService: (id: string, token: string) =>
    fetch(`${API_URL}/api/barber/services/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  getMedia: () =>
    fetch(`${API_URL}/api/barber/media`, { next: { revalidate: 60 } }),

  createMedia: (formData: FormData, token: string) =>
    fetch(`${API_URL}/api/barber/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }),

  deleteMedia: (id: string, token: string) =>
    fetch(`${API_URL}/api/barber/media/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (usuario: string, password: string): Promise<LoginResponse> =>
    fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    }).then((r) => handleResponse<LoginResponse>(r)),

  logout: (token: string) =>
    fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: authHeaders(token),
    }),

  changePassword: (
    passwords: { passwordActual: string; passwordNuevo: string },
    token: string
  ) =>
    fetch(`${API_URL}/api/auth/change-password`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(passwords),
    }),
};

// ─── Órdenes ──────────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (body: {
    items: {
      producto: string;
      nombre: string;
      precio: number;
      cantidad: number;
      talla?: string;
      color?: string;
      imagen?: string;
    }[];
    total: number;
    notas?: string;
  }) =>
    fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  list: (token: string) =>
    fetch(`${API_URL}/api/orders`, { headers: authHeaders(token) }),

  get: (id: string, token: string) =>
    fetch(`${API_URL}/api/orders/${id}`, { headers: authHeaders(token) }),

  updateStatus: (
    id: string,
    estado: string,
    token: string
  ) =>
    fetch(`${API_URL}/api/orders/${id}/status`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ estado }),
    }),
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  getAll: (): Promise<Record<string, string>> =>
    fetch(`${API_URL}/api/settings`, { next: { revalidate: 300 } })
      .then((r) => handleResponse<Record<string, string>>(r)),

  upsert: (clave: string, valor: string, token: string) =>
    fetch(`${API_URL}/api/settings/${clave}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ valor }),
    }),
};
