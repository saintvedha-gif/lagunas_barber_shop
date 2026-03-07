"use client";

import AdminProfileMenu from "./AdminProfileMenu";

export default function AdminTopbar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#111] border-b border-white/10 z-40 flex items-center justify-between px-5">
      {/* Marca */}
      <div className="flex items-center gap-2.5">
        <p className="font-display text-base tracking-widest text-white leading-none">ADMIN</p>
        <span className="text-white/20 text-xs">|</span>
        <p className="text-gray-500 text-[10px] tracking-widest uppercase leading-none hidden sm:block">
          Laguna&apos;s Barber &amp; Shop
        </p>
      </div>

      {/* Avatar + menú */}
      <AdminProfileMenu />
    </header>
  );
}
