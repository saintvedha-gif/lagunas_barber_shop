"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve `true` cuando el usuario ha hecho scroll > 30px.
 * Reemplaza el main.js del proyecto PHP.
 */
export function useScrolled(threshold = 30): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}
