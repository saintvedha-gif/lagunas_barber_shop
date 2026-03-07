import { SkeletonTableRows } from "@/components/ui/skeletons";

/** Skeleton de la tabla de productos — espeja la estructura real de AdminProductTable */
export default function Loading() {
  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-5xl">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="h-8 bg-white/10 animate-pulse rounded-lg w-44" />
          <div className="h-3 bg-white/5 animate-pulse rounded w-28 mt-2" />
        </div>
        <div className="h-9 bg-white/10 animate-pulse rounded-xl w-24 shrink-0" />
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-white/10 gap-4">
        <div className="h-9 bg-white/10 animate-pulse rounded-t-lg w-16" />
        <div className="h-9 bg-white/5 animate-pulse rounded-t-lg w-24" />
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-4 py-3 w-12">
                <div className="w-5 h-3 bg-white/10 animate-pulse rounded" />
              </th>
              <th className="px-4 py-3">
                <div className="h-3 bg-white/10 animate-pulse rounded-lg w-16" />
              </th>
              <th className="px-4 py-3 hidden md:table-cell">
                <div className="h-3 bg-white/10 animate-pulse rounded-lg w-20" />
              </th>
              <th className="px-4 py-3 text-right">
                <div className="h-3 bg-white/10 animate-pulse rounded-lg w-14 ml-auto" />
              </th>
              <th className="px-4 py-3 hidden sm:table-cell">
                <div className="h-3 bg-white/10 animate-pulse rounded-lg w-12 mx-auto" />
              </th>
              <th className="px-4 py-3 hidden sm:table-cell">
                <div className="h-3 bg-white/10 animate-pulse rounded-lg w-12 mx-auto" />
              </th>
              <th className="px-4 py-3">
                <div className="h-3 bg-white/10 animate-pulse rounded-lg w-16 mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <SkeletonTableRows count={8} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
