"use client";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Auto-logout hook — Хэрэглэгч идэвхгүй удаан байвал гарах
 *
 * @param timeoutMinutes - Идэвхгүй болсноос гарах хүртэлх минут (default: 30)
 * @param warningMinutes - Гарахаас өмнө сэрэмжлүүлэх минут (default: 1)
 * @param onLogout - Logout хийхээс өмнө дуудах callback (optional)
 *
 * @example
 * useAutoLogout(30, 1);
 *
 * // Эсвэл custom:
 * useAutoLogout(30, 1, () => {
 *   // localStorage cleanup, сэрэмжлүүлэг г.м.
 * });
 */
export function useAutoLogout(
  timeoutMinutes: number = 30,
  warningMinutes: number = 1,
  onLogout?: () => void,
) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const logout = useCallback(() => {
    // Custom callback
    if (onLogout) {
      try {
        onLogout();
      } catch (e) {
        console.error("Auto-logout callback error:", e);
      }
    }

    // Бүх auth-тай холбоотой localStorage цэвэрлэх
    [
      "token",
      "super_admin_token",
      "user",
      "admin",
      "super_admin",
    ].forEach((k) => localStorage.removeItem(k));

    // Login руу шилжих
    router.push("/login");
  }, [router, onLogout]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    warningShownRef.current = false;

    // Сэрэмжлүүлэг (logout-аас warningMinutes өмнө)
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
    if (warningMs > 0) {
      warningRef.current = setTimeout(() => {
        warningShownRef.current = true;
        // Custom event — компонент дотроос сонсож, өөрийн UI харуулах боломжтой
        window.dispatchEvent(
          new CustomEvent("auto-logout-warning", {
            detail: { remainingMinutes: warningMinutes },
          }),
        );
      }, warningMs);
    }

    // Logout
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      logout();
    }, timeoutMs);
  }, [timeoutMinutes, warningMinutes, logout]);

  useEffect(() => {
    // Ажиллах event-ууд (хэрэглэгчийн идэвх)
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Throttle — дуудлагыг хэт олон удаа хийхгүй (1 секундэд нэг л удаа)
    let lastReset = 0;
    const handler = () => {
      const now = Date.now();
      if (now - lastReset > 1000) {
        lastReset = now;
        resetTimer();
      }
    };

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));

    // Анх timer эхлүүлэх
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimer]);
}