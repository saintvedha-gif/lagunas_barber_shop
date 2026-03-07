import {
  SkeletonMetricCard,
  SkeletonQuickAction,
  SkeletonCategoryPanel,
} from "@/components/ui/skeletons";

/** Skeleton del dashboard admin — cubre el área de contenido del panel */
export default function Loading() {
  return (
    <div className="space-y-8 pb-20 md:pb-6 max-w-5xl">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div>
        <div className="h-8 bg-white/10 animate-pulse rounded-lg w-48" />
        <div className="h-3 bg-white/5 animate-pulse rounded-lg w-56 mt-2" />
      </div>

      {/* ── Métricas ────────────────────────────────────────────────────── */}
      <section>
        <div className="h-3 bg-white/5 animate-pulse rounded w-20 mb-3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
      </section>

      {/* ── Acciones rápidas ────────────────────────────────────────────── */}
      <section>
        <div className="h-3 bg-white/5 animate-pulse rounded w-32 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonQuickAction key={i} />
          ))}
        </div>
      </section>

      {/* ── Categorías activas ──────────────────────────────────────────── */}
      <section>
        <div className="h-3 bg-white/5 animate-pulse rounded w-36 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SkeletonCategoryPanel />
          <SkeletonCategoryPanel />
        </div>
      </section>
    </div>
  );
}
