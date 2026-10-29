"use client";
// Нийлүүлэгчийн (компани / хувь хүн) уншаагүй мэдэгдлийн тоо.
// Шинэчлэгдэх үе: анх ачаалахад, 30 секунд тутам, цонх идэвхжихэд, хуудас солигдоход,
// мөн "notifications:changed" event ирэхэд (мэдэгдэл уншсаны дараа dispatch хийж болно).
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const POLL_MS = 30_000;

export function useUnreadNotifications() {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/notifications/mine?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const d = await res.json();
      if (typeof d.unread_count === "number") {
        setCount(d.unread_count);
      } else {
        const list = d.notifications ?? d.data ?? [];
        setCount(list.filter((n: any) => !n.is_read).length);
      }
    } catch {
      /* сүлжээний алдаа гарвал өмнөх тоо хэвээр */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("notifications:changed", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("notifications:changed", onFocus);
    };
  }, [refresh]);

  return count;
}

/** Мэдэгдэл уншсан гэж тэмдэглэсний дараа дуудна — sidebar-ын тоо шууд шинэчлэгдэнэ */
export const notifyNotificationsChanged = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("notifications:changed"));
};