import { Suspense } from "react";
import type { Metadata } from "next";
import { API_URL } from "@/lib/api";
import type { Category, PaginatedProducts } from "@/types";
import CategorySidebar from "@/components/shop/CategorySidebar";
import SearchBar from "@/components/shop/SearchBar";
import CartButton from "@/components/shop/CartButton";
import RopaCard from "@/components/shop/RopaCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ropa | Laguna's Barber & Shop",
  description:
    "Camisas, bermudas, gorras y más ropa urbana. Laguna's Barber & Shop.",
};

interface PageProps {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    page?: string;
    oferta?: string;
  }>;
}

async function fetchData(params: {
  categoria?: string;
  q?: string;
  page?: string;
  oferta?: string;
}) {
  const qs = new URLSearchParams({ seccion: "ropa" });
  if (params.categoria) qs.set("categoria", params.categoria);
  if (params.q)         qs.set("q", params.q);
  if (params.page)      qs.set("page", params.page);
  if (params.oferta)    qs.set("oferta", "1");
  qs.set("limit", "24");

  const [catRes, prodRes] = await Promise.all([
    fetch(`${API_URL}/api/categories?seccion=ropa`, { next: { revalidate: 300 } }),
    fetch(`${API_URL}/api/products?${qs}`, { next: { revalidate: 60 } }),
  ]);

  const categorias: Category[] = catRes.ok ? await catRes.json() : [];
  const data: PaginatedProducts = prodRes.ok
    ? await prodRes.json()
    : { productos: [], total: 0, page: 1, limit: 24 };

  return { categorias, data };
}

export default async function RopaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { categorias, data } = await fetchData(params);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8 flex flex-wrap items-end gap-4 justify-between">
          <div>
            <h1 className="font-display text-4xl md:text-5xl tracking-widest text-white">
              ROPA
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {data.total} producto{data.total !== 1 ? "s" : ""} disponible
              {data.total !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Filtro oferta */}
          <a
            href={params.oferta ? "/ropa" : "/ropa?oferta=1"}
            className={[
              "text-xs uppercase tracking-wider border rounded-full px-4 py-1.5 transition-colors",
              params.oferta
                ? "bg-red-600 border-red-600 text-white"
                : "border-white/20 text-gray-400 hover:border-white hover:text-white",
            ].join(" ")}
          >
            {params.oferta ? "✕ Sólo ofertas" : "Ver ofertas"}
          </a>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <Suspense fallback={<div className="w-56 shrink-0" />}>
            <CategorySidebar categorias={categorias} seccion="ropa" />
          </Suspense>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Buscador */}
            <div className="mb-6">
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
            </div>

            {/* Grid */}
            {data.productos.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">No se encontraron productos</p>
                <p className="text-sm mt-1">
                  Prueba con otra categoría o búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.productos.map((p) => (
                  <RopaCard key={p._id} producto={p} />
                ))}
              </div>
            )}

            {/* Paginación */}
            {data.total > data.limit && (
              <div className="flex justify-center items-center gap-4 mt-10">
                {data.page > 1 && (
                  <a
                    href={`?page=${data.page - 1}`}
                    className="px-4 py-2 border border-white/20 rounded-lg text-sm text-gray-300 hover:border-white hover:text-white transition-colors"
                  >
                    ← Anterior
                  </a>
                )}
                <span className="text-gray-500 text-sm">
                  Página {data.page} de {Math.ceil(data.total / data.limit)}
                </span>
                {data.page < Math.ceil(data.total / data.limit) && (
                  <a
                    href={`?page=${data.page + 1}`}
                    className="px-4 py-2 border border-white/20 rounded-lg text-sm text-gray-300 hover:border-white hover:text-white transition-colors"
                  >
                    Siguiente →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carrito flotante */}
      <CartButton />
    </div>
  );
}
