import { Suspense } from "react";
import type { Metadata } from "next";
import { API_URL } from "@/lib/api";
import type { Category, PaginatedProducts } from "@/types";
import CategorySidebar from "@/components/shop/CategorySidebar";
import ProductGrid from "@/components/shop/ProductGrid";
import SearchBar from "@/components/shop/SearchBar";
import CartButton from "@/components/shop/CartButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cosméticos Capilares | Laguna's Barber & Shop",
  description:
    "Pomadas, aceites, shampoos y productos capilares profesionales. Laguna's Barber & Shop.",
};

interface PageProps {
  searchParams: Promise<{ categoria?: string; q?: string; page?: string }>;
}

async function fetchData(params: { categoria?: string; q?: string; page?: string }) {
  const qs = new URLSearchParams({ seccion: "cosmetico" });
  if (params.categoria) qs.set("categoria", params.categoria);
  if (params.q)         qs.set("q", params.q);
  if (params.page)      qs.set("page", params.page);
  qs.set("limit", "24");

  const [catRes, prodRes] = await Promise.all([
    fetch(`${API_URL}/api/categories?seccion=cosmetico`, { next: { revalidate: 300 } }),
    fetch(`${API_URL}/api/products?${qs}`, { next: { revalidate: 60 } }),
  ]);

  const categorias: Category[] = catRes.ok ? await catRes.json() : [];
  const data: PaginatedProducts = prodRes.ok
    ? await prodRes.json()
    : { productos: [], total: 0, page: 1, limit: 24 };

  return { categorias, data };
}

export default async function CosmeticosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { categorias, data } = await fetchData(params);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl tracking-widest text-white">
            COSMÉTICOS CAPILARES
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {data.total} producto{data.total !== 1 ? "s" : ""} disponible
            {data.total !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar — Suspense para useSearchParams en CategorySidebar */}
          <Suspense fallback={<div className="w-56 shrink-0" />}>
            <CategorySidebar categorias={categorias} seccion="cosmetico" />
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
            <ProductGrid productos={data.productos} modo="cosmetico" />

            {/* Paginación simple */}
            {data.total > data.limit && (
              <PaginacionSimple
                page={data.page}
                total={data.total}
                limit={data.limit}
              />
            )}
          </div>
        </div>
      </div>

      {/* Carrito flotante */}
      <CartButton />
    </div>
  );
}

function PaginacionSimple({
  page,
  total,
  limit,
}: {
  page: number;
  total: number;
  limit: number;
}) {
  const totalPages = Math.ceil(total / limit);
  return (
    <div className="flex justify-center items-center gap-4 mt-10">
      {page > 1 && (
        <a
          href={`?page=${page - 1}`}
          className="px-4 py-2 border border-white/20 rounded-lg text-sm text-gray-300 hover:border-white hover:text-white transition-colors"
        >
          ← Anterior
        </a>
      )}
      <span className="text-gray-500 text-sm">
        Página {page} de {totalPages}
      </span>
      {page < totalPages && (
        <a
          href={`?page=${page + 1}`}
          className="px-4 py-2 border border-white/20 rounded-lg text-sm text-gray-300 hover:border-white hover:text-white transition-colors"
        >
          Siguiente →
        </a>
      )}
    </div>
  );
}
