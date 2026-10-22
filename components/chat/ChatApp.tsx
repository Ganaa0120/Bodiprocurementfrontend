"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import type { AnnouncementRef } from "@/lib/chat/types";
import { ConversationInfo } from "./ConversationInfo";
import { ConversationList } from "./ConversationList";
import { NewChatModal } from "./NewChatModal";
import { Thread } from "./Thread";
import { getChatStore, useChat } from "./store";
import { C, CHAT_CSS } from "./styles";
import { Button, Spinner } from "./ui";

function useIsNarrow(px: number) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${px}px)`);
    const h = () => setNarrow(mq.matches);
    h();
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [px]);
  return narrow;
}

const readParam = () => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("c"));
function writeParam(id: string | null) {
  const u = new URL(window.location.href);
  if (id) u.searchParams.set("c", id);
  else u.searchParams.delete("c");
  window.history.replaceState(window.history.state, "", u.toString());
}

export interface ChatAppProps {
  /** Чатын хэсгийн өндөр. Жишээ: "calc(100vh - 64px)" (header-ийн өндрийг хасна) */
  height?: string;
  /** Тендерийн chip дарахад очих хаяг */
  announcementHref?: (id: string) => string;
  /** Тендерийн хуудаснаас "Чат үүсгэх" гэж ирвэл тэр тендерийг урьдчилан сонгоно */
  startWithAnnouncement?: AnnouncementRef | null;
  /** Жижиг цонх (widget) — нэг удаад нэг багана харуулна */
  compact?: boolean;
  /** false бол store-ийг энэ component асааж/унтраахгүй (ChatWidget өөрөө удирдана) */
  manageLifecycle?: boolean;
  /** Сонгосон чатыг URL-д (?c=) бичих эсэх */
  syncUrl?: boolean;
  /** Хүрээ, булангийн дугуйралтгүй (widget дотор) */
  frameless?: boolean;
}

export default function ChatApp({
  height = "calc(100vh - 64px)",
  announcementHref,
  startWithAnnouncement,
  compact = false,
  manageLifecycle = true,
  syncUrl = true,
  frameless = false,
}: ChatAppProps) {
  const store = getChatStore();
  const me = useChat((s) => s.me);
  const bootError = useChat((s) => s.bootError);
  const activeId = useChat((s) => s.activeId);
  const convs = useChat((s) => s.convs);
  const toast = useChat((s) => s.toast);
  // Hook-уудыг нөхцөлгүйгээр, үргэлж ижил дарааллаар дуудна (Rules of Hooks)
  const screenNarrow = useIsNarrow(860);
  const screenMedium = useIsNarrow(1240);
  const narrow = compact || screenNarrow;
  const wide = !compact && !screenMedium;
  const [newOpen, setNewOpen] = useState(!!startWithAnnouncement);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (!manageLifecycle) return;
    store.start();
    store.setUiVisible(true);
    const fromUrl = syncUrl ? readParam() : null;
    if (fromUrl) store.open(fromUrl);
    return () => store.stop();
  }, [store, manageLifecycle, syncUrl]);

  useEffect(() => {
    if (me && syncUrl) writeParam(activeId);
  }, [activeId, me, syncUrl]);

  // Browser tab гарчигт уншаагүй чатын тоо
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\+?\)\s*/, "");
    const n = Object.values(convs).filter(
      (c) => c.unread > 0 && !(c.mutedUntil && new Date(c.mutedUntil).getTime() > Date.now()),
    ).length;
    document.title = n ? `(${n > 99 ? "99+" : n}) ${base}` : base;
  }, [convs]);

  useEffect(() => () => {
    document.title = document.title.replace(/^\(\d+\+?\)\s*/, "");
  }, []);

  const openConv = useCallback(
    (id: string) => {
      store.open(id);
      if (narrow) setInfoOpen(false);
    },
    [narrow, store],
  );

  const shell = (children: ReactNode) => (
    <div
      className="bc-root"
      style={{
        height,
        minHeight: frameless ? 0 : 420,
        display: "flex",
        background: C.panel,
        border: frameless ? "none" : `1px solid ${C.border}`,
        borderRadius: frameless || narrow ? 0 : 18,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{CHAT_CSS}</style>
      {children}
    </div>
  );

  if (bootError) {
    return shell(
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: C.muted, fontSize: 13.5 }}>
        {bootError}
        <Button variant="ghost" onClick={() => store.start()}>
          Дахин оролдох
        </Button>
      </div>,
    );
  }
  if (!me) {
    return shell(
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>,
    );
  }

  const showList = !narrow || !activeId;
  const showThread = !narrow || !!activeId;
  const showInfo = !!activeId && infoOpen;

  return shell(
    <>
      {showList && (
        <aside
          style={{
            width: narrow ? "100%" : 340,
            flexShrink: 0,
            borderRight: narrow ? "none" : `1px solid ${C.border}`,
            background: C.panel,
            minHeight: 0,
          }}
        >
          <ConversationList onNew={() => setNewOpen(true)} onOpen={openConv} />
        </aside>
      )}

      {showThread && !(narrow && showInfo) && (
        <main style={{ flex: 1, minWidth: 0, display: "flex", background: C.bg }}>
          {activeId ? (
            <Thread
              key={activeId}
              convId={activeId}
              showBack={narrow}
              onBack={() => store.open(null)}
              infoOpen={infoOpen}
              onToggleInfo={() => setInfoOpen((o) => !o)}
              announcementHref={announcementHref}
            />
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: 99, background: C.blueSoft, color: C.blueText, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={32} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Чатаа сонгоно уу</div>
              <div style={{ fontSize: 13, color: C.muted, maxWidth: 320, lineHeight: 1.6 }}>
                Зүүн талаас чат сонгох эсвэл ажилтан, нийлүүлэгчтэй шинэ чат эхлүүлнэ үү.
              </div>
              <Button onClick={() => setNewOpen(true)}>Шинэ чат</Button>
            </div>
          )}
        </main>
      )}

      {showInfo && (
        <aside
          style={{
            width: narrow ? "100%" : 330,
            flexShrink: 0,
            borderLeft: narrow ? "none" : `1px solid ${C.border}`,
            ...(narrow || wide ? {} : { position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 30, boxShadow: "-20px 0 40px rgba(0,0,0,0.4)" }),
          }}
        >
          <ConversationInfo convId={activeId!} onClose={() => setInfoOpen(false)} />
        </aside>
      )}

      {newOpen && <NewChatModal onClose={() => setNewOpen(false)} initialAnnouncement={startWithAnnouncement} />}

      {toast && (
        <div
          role="status"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            zIndex: 500,
            padding: "10px 16px",
            borderRadius: 12,
            background: C.raised,
            border: `1px solid ${C.borderStrong}`,
            color: C.text,
            fontSize: 13,
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            maxWidth: "90%",
          }}
        >
          {toast.text}
        </div>
      )}
    </>,
  );
}