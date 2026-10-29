"use client";
// ════════════════════════════════════════════════════════════════
//  Нийлүүлэгчийн зарлалын дэлгэрэнгүй дээрх үйлдлийн товчнууд.
//  Компани болон хувь хүний хуудас хоёулаа үүнийг ашиглана.
//
//  Урсгал:
//    (хүсэлтгүй)  → "👋 Оролцох хүсэлт илгээх"
//    pending      → "⏳ Хүсэлт хянагдаж байна"   (идэвхгүй)
//    rejected     → "✕ Татгалзсан"              (идэвхгүй, шалтгаантай)
//    approved     → "Үнийн санал илгээх" + "💬 Админтай чатлах"
//    санал илгээсэн → "✓ Үнийн санал илгээсэн" + "💬 Админтай чатлах"
// ════════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { chatApi } from "@/components/chat/api";
import { getChatStore } from "@/components/chat/store";
import { CheckCircle2, Clock, Loader2, MessageCircle, Send, XCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ParticipationStatus = "pending" | "approved" | "rejected" | null;

export interface ParticipationAnnouncement {
  id: string;
  participation_status?: ParticipationStatus;
  participation_note?: string | null;
  is_participated?: boolean;
  is_bid_submitted?: boolean;
  /** submitted | accepted | rejected */
  bid_status?: string | null;
}

const token = () => (typeof window === "undefined" ? "" : localStorage.getItem("token") || "");

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    const err = new Error(data?.message || `Алдаа гарлаа (${res.status})`) as Error & { data?: any };
    err.data = data;
    throw err;
  }
  return data as T;
}

/**
 * Зарлалын хүрээнд админтай хувийн чатыг нээнэ (байхгүй бол үүсгэнэ).
 * Хуудаснаас гаралгүйгээр баруун доод буланд байрлах чатын цонхонд шууд харуулна.
 */
export async function openAnnouncementDirectChat(annId: string): Promise<void> {
  const store = getChatStore();
  const { items } = await chatApi.announcementContacts();
  const entry = items.find((i) => String(i.announcement.id) === String(annId));
  const contact = entry?.contacts?.[0];
  if (!contact) throw new Error("Энэ зарлалд чатлах ажилтан олдсонгүй");
  if (contact.conversationId) {
    store.openInWidget(contact.conversationId);
    return;
  }
  const { conversation } = await chatApi.create({
    kind: "direct",
    members: [{ type: contact.type, id: contact.id }],
    announcementId: annId,
  });
  store.openInWidget(conversation);
}

type Theme = "light" | "dark";

const palette = (theme: Theme) =>
  theme === "dark"
    ? {
        neutralBg: "rgba(255,255,255,0.05)",
        neutralBorder: "rgba(255,255,255,0.12)",
        neutralText: "#94a3b8",
        pendingBg: "rgba(245,158,11,0.10)",
        pendingText: "#fbbf24",
        rejectBg: "rgba(239,68,68,0.10)",
        rejectText: "#f87171",
        doneBg: "rgba(16,185,129,0.10)",
        doneText: "#34d399",
        chatBg: "rgba(99,102,241,0.12)",
        chatBorder: "rgba(99,102,241,0.35)",
        chatText: "#a5b4fc",
        note: "#f87171",
      }
    : {
        neutralBg: "#f1f5f9",
        neutralBorder: "#e2e8f0",
        neutralText: "#94a3b8",
        pendingBg: "#fffbeb",
        pendingText: "#b45309",
        rejectBg: "#fef2f2",
        rejectText: "#b91c1c",
        doneBg: "#ecfdf5",
        doneText: "#047857",
        chatBg: "white",
        chatBorder: "#c7d2fe",
        chatText: "#4f46e5",
        note: "#b91c1c",
      };

export function ParticipationActions({
  announcement,
  isExpired,
  theme = "light",
  accent = "linear-gradient(135deg,#0072BC,#3b9be0)",
  chatBasePath,
  onParticipated,
  onOpenBid,
  onError,
}: {
  announcement: ParticipationAnnouncement;
  isExpired: boolean;
  theme?: Theme;
  /** "Үнийн санал илгээх" товчны дэвсгэр */
  accent?: string;
  /** Хуучин хувилбартай нийцүүлэх (одоо ашиглагдахгүй: чат баруун доод буланд нээгдэнэ) */
  chatBasePath?: string;
  /** Оролцох хүсэлт амжилттай илгээгдсэний дараа */
  onParticipated: (status: Exclude<ParticipationStatus, null>) => void;
  /** Үнийн санал илгээх цонхыг нээх */
  onOpenBid: () => void;
  onError?: (message: string) => void;
}) {
  const c = palette(theme);
  const [busy, setBusy] = useState<"participate" | "chat" | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Хуучин API (зөвхөн is_participated) ирвэл pending гэж үзнэ
  const status: ParticipationStatus =
    announcement.participation_status ?? (announcement.is_participated ? "pending" : null);
  const bidSent = !!announcement.is_bid_submitted;
  const bidRejected = announcement.bid_status === "rejected";
  const bidWon = announcement.bid_status === "accepted";
  // Үнийн санал татгалзагдсан бол зарлалын чат хаагдана
  const canChat = status === "approved" && !bidRejected;

  const fail = (m: string) => {
    setLocalError(m);
    onError?.(m);
  };

  const participate = async () => {
    setBusy("participate");
    setLocalError(null);
    try {
      const res = await api<{ participation_status?: string }>(
        "POST",
        `/api/announcements/${announcement.id}/participate`,
        {},
      );
      onParticipated((res.participation_status as any) || "pending");
    } catch (e: any) {
      // Аль хэдийн илгээсэн бол серверийн төлөвийг авна
      if (e?.data?.participation_status) onParticipated(e.data.participation_status);
      else fail(e.message);
    } finally {
      setBusy(null);
    }
  };

  const openChat = async () => {
    setBusy("chat");
    setLocalError(null);
    try {
      await openAnnouncementDirectChat(announcement.id);
    } catch (e: any) {
      fail(e.message);
    } finally {
      setBusy(null);
    }
  };

  const base: React.CSSProperties = {
    flex: 1,
    minWidth: 160,
    padding: "13px 22px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
  };
  const disabled = (bg: string, color: string): React.CSSProperties => ({
    ...base,
    background: bg,
    color,
    cursor: "not-allowed",
  });
  const spin = <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} />;

  let main: React.ReactNode;
  if (status === null) {
    main = (
      <button
        onClick={participate}
        disabled={isExpired || busy === "participate"}
        style={
          isExpired
            ? disabled(c.neutralBg, c.neutralText)
            : { ...base, background: accent, color: "white", cursor: busy ? "wait" : "pointer" }
        }
      >
        {busy === "participate" ? spin : "👋"}
        {isExpired ? "Хугацаа дууссан" : "Оролцох хүсэлт илгээх"}
      </button>
    );
  } else if (status === "pending") {
    main = (
      <button disabled style={disabled(c.pendingBg, c.pendingText)}>
        <Clock size={15} /> Хүсэлт хянагдаж байна
      </button>
    );
  } else if (status === "rejected") {
    main = (
      <button disabled style={disabled(c.rejectBg, c.rejectText)}>
        <XCircle size={15} /> Татгалзсан
      </button>
    );
  } else if (bidRejected) {
    main = (
      <button disabled style={disabled(c.rejectBg, c.rejectText)}>
        <XCircle size={15} /> Үнийн санал татгалзагдсан
      </button>
    );
  } else if (bidSent) {
    main = (
      <button disabled style={disabled(c.doneBg, c.doneText)}>
        <CheckCircle2 size={15} /> {bidWon ? "🏆 Шалгарсан" : "Үнийн санал илгээсэн"}
      </button>
    );
  } else {
    main = (
      <button
        onClick={() => !isExpired && onOpenBid()}
        disabled={isExpired}
        style={
          isExpired
            ? disabled(c.neutralBg, c.neutralText)
            : {
                ...base,
                background: accent,
                color: "white",
                cursor: "pointer",
                boxShadow: theme === "light" ? "0 8px 20px rgba(0,114,188,0.35)" : "none",
              }
        }
      >
        {isExpired ? "Хугацаа дууссан" : (<><Send size={15} /> Үнийн санал илгээх</>)}
      </button>
    );
  }

  return (
    <>
      {canChat && (
        <button
          onClick={openChat}
          disabled={busy === "chat"}
          style={{
            ...base,
            flex: "0 1 auto",
            minWidth: 0,
            background: c.chatBg,
            color: c.chatText,
            border: `1.5px solid ${c.chatBorder}`,
            cursor: busy === "chat" ? "wait" : "pointer",
          }}
        >
          {busy === "chat" ? spin : <MessageCircle size={15} />}
          Админтай чатлах
        </button>
      )}
      {main}
      {(localError || (status === "rejected" && announcement.participation_note)) && (
        <div style={{ flexBasis: "100%", fontSize: 12.5, color: c.note, lineHeight: 1.5 }}>
          {localError ?? `Татгалзсан шалтгаан: ${announcement.participation_note}`}
        </div>
      )}
    </>
  );
}

export default ParticipationActions;