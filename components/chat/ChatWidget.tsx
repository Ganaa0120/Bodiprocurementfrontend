"use client";
// Messenger маягийн чат: дэлгэцийн баруун доод буланд товч, дарахад цонх нээгдэнэ.
// app/dashboard/layout.tsx дотор нэг удаа <ChatWidget /> гэж байрлуулна — бүх dashboard хуудсанд харагдана.
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Maximize2, MessageCircle, Minimize2, X } from "lucide-react";
import ChatApp from "./ChatApp";
import { getChatStore, useChat } from "./store";
import { C, FONT } from "./styles";

const hasToken = () =>
  typeof window !== "undefined" && !!(localStorage.getItem("super_admin_token") || localStorage.getItem("token"));

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const h = () => setM(mq.matches);
    h();
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return m;
}

export function ChatWidget({ announcementHref }: { announcementHref?: (id: string) => string }) {
  const store = getChatStore();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const mobile = useIsMobile();

  const me = useChat((s) => s.me);
  const bootError = useChat((s) => s.bootError);
  const convs = useChat((s) => s.convs);
  const openRequest = useChat((s) => s.openRequest);

  // Нэвтэрсэн үед л асна (login хуудсан дээр харагдахгүй)
  useEffect(() => {
    setEnabled(hasToken());
    const onStorage = () => setEnabled(hasToken());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Цонх хаалттай ч мессеж хүлээн авч, уншаагүй тоог шинэчилнэ
  useEffect(() => {
    if (!enabled) return;
    store.setUiVisible(false);
    store.start();
    return () => store.stop();
  }, [enabled, store]);

  useEffect(() => {
    store.setUiVisible(open);
  }, [open, store]);

  useEffect(() => {
    if (openRequest > 0) setOpen(true);
  }, [openRequest]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector('[role="dialog"]')) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const unread = useMemo(
    () =>
      Object.values(convs).filter(
        (c) => c.unread > 0 && !(c.mutedUntil && new Date(c.mutedUntil).getTime() > Date.now()),
      ).length,
    [convs],
  );

  // Нэвтрээгүй, эсвэл чат ашиглах эрхгүй (жишээ: buyer) бол юу ч харуулахгүй
  if (!enabled || (!me && bootError)) return null;

  const panelStyle: CSSProperties = mobile
    ? { position: "fixed", inset: 0, zIndex: 1000 }
    : expanded
      ? {
          position: "fixed",
          right: 20,
          bottom: 20,
          width: "min(1080px, calc(100vw - 40px))",
          height: "min(780px, calc(100vh - 40px))",
          zIndex: 1000,
          borderRadius: 18,
        }
      : {
          position: "fixed",
          right: 20,
          bottom: 92,
          width: 380,
          height: "min(620px, calc(100vh - 120px))",
          zIndex: 1000,
          borderRadius: 18,
        };

  return (
    <>
      {open && (
        <div
          role="region"
          aria-label="Чат"
          style={{
            ...panelStyle,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: C.panel,
            border: mobile ? "none" : `1px solid ${C.borderStrong}`,
            boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
            fontFamily: FONT,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              height: 40,
              padding: "0 8px 0 14px",
              borderBottom: `1px solid ${C.border}`,
              background: C.panel2,
              color: C.text2,
              flexShrink: 0,
            }}
          >
            <MessageCircle size={15} style={{ color: C.blueText }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 650, marginLeft: 6 }}>Мессеж</span>
            {!mobile && (
              <BarButton label={expanded ? "Жижигрүүлэх" : "Томруулах"} onClick={() => setExpanded((e) => !e)}>
                {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </BarButton>
            )}
            <BarButton label="Хаах" onClick={() => setOpen(false)}>
              <X size={17} />
            </BarButton>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ChatApp
              height="100%"
              compact={mobile || !expanded}
              manageLifecycle={false}
              syncUrl={false}
              frameless
              announcementHref={announcementHref}
            />
          </div>
        </div>
      )}

      {!(open && (mobile || expanded)) && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Чат хаах" : unread ? `Чат нээх, ${unread} уншаагүй` : "Чат нээх"}
          aria-expanded={open}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 1001,
            width: 58,
            height: 58,
            borderRadius: 99,
            border: "none",
            cursor: "pointer",
            background: C.blue,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(37,99,235,0.45), 0 2px 8px rgba(0,0,0,0.3)",
            transition: "transform .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {open ? <X size={24} /> : <MessageCircle size={26} />}
          {!open && unread > 0 && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                minWidth: 22,
                height: 22,
                padding: "0 6px",
                borderRadius: 99,
                background: "#ef4444",
                color: "#fff",
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: FONT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #0a1120",
              }}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      )}
    </>
  );
}

function BarButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: "none",
        background: "transparent",
        color: C.muted,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
