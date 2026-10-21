"use client";
// Navigation цэсэнд "Чат (3)" badge харуулахад. Чатын хуудаснаас гадуур ажиллана.
import { useEffect, useState } from "react";
import { chatApi } from "./api";

export function ChatUnreadBadge({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      chatApi
        .unread()
        .then((r) => alive && setN(r.count))
        .catch(() => {});
    };
    tick();
    const t = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      alive = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs]);

  if (!n) return null;
  return (
    <span
      aria-label={`${n} уншаагүй чат`}
      style={{
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: 99,
        background: "#3b82f6",
        color: "#fff",
        fontSize: 10.5,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}
