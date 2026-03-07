import { SkeletonCategoryCard } from "@/components/ui/skeletons";

/** Skeleton del gestor de categorías */
export default function Loading() {
  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-2xl">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div>
        <div className="h-8 bg-white/10 animate-pulse rounded-lg w-44" />
        <div className="h-3 bg-white/5 animate-pulse rounded w-72 mt-2" />
      </div>

      {/* ── Tab switcher (Ropa / Cosméticos) ────────────────────────────── */}
      <div className="flex bg-[#111] border border-white/8 rounded-2xl p-1 gap-1">
        <div className="flex-1 h-9 bg-white/10 animate-pulse rounded-xl" />
        <div className="flex-1 h-9 bg-white/5 animate-pulse rounded-xl" />
      </div>

      {/* ── Cards de categorías ──────────────────────────────────────────── */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCategoryCard key={i} />
        ))}
      </div>

      {/* ── Formulario nueva categoría ───────────────────────────────────── */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-4">
        <div className="h-3 bg-white/8 animate-pulse rounded-lg w-36 mb-3" />
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-white/5 animate-pulse rounded-xl" />
          <div className="w-24 h-9 bg-white/10 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}
