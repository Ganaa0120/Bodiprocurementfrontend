"use client";
import { useEffect, useState } from "react";

/**
 * Returns the current window width.
 * Returns 0 during SSR / first render before useEffect runs.
 */
export function useW() {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

/**
 * Convenience hook returning common breakpoint flags.
 *   isMobile : < 640
 *   isTablet : 640 ≤ w < 1024
 *   isDesktop: ≥ 1024
 */
export function useBreakpoint() {
  const w = useW();
  return {
    w,
    isMobile: w > 0 && w < 640,
    isTablet: w >= 640 && w < 1024,
    isDesktop: w >= 1024,
  };
}

// ── Shared types used across direction-picker / page ──────────
export type DirItem = {
  id: number;
  label: string;
  children: { id: number; label: string }[];
};

export type SelDir = { main_id: number; sub_ids: number[] };

export type PermType = { id: number; label: string };