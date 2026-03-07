import {
  SkeletonRopaCard,
  SkeletonSidebar,
} from "@/components/ui/skeletons";

/** Skeleton que se muestra mientras la página /ropa espera datos del servidor */
export default function Loading() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Encabezado ─────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-end gap-4 justify-between">
          <div>
            <div className="h-10 md:h-12 bg-white/10 animate-pulse rounded-lg w-28" />
            <div className="h-3.5 bg-white/5 animate-pulse rounded-lg w-44 mt-2" />
          </div>
          <div className="h-8 bg-white/5 animate-pulse rounded-full w-28" />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <SkeletonSidebar />

          {/* ── Contenido ────────────────────────────────────────────────── */}
          <div className="flex-1">
            {/* SearchBar */}
            <div className="mb-6 h-10 bg-white/5 animate-pulse rounded-xl" />

            {/* Grid — misma estructura que el grid real */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRopaCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
