// Зарлалын тендерийн урсгалын API дуудлагууд нэг газар.
// AnnouncementsTab, BidsDrawer болон бусад админ компонент эндээс хэрэглэнэ.
import { API, jsonH } from "./constants";
import { chatApi } from "@/components/chat/api";
import { getChatStore } from "@/components/chat/store";

export type ParticipationStatus = "pending" | "approved" | "rejected";

/** Нэвтэрсэн админы role (super_admin | admin). Зөвхөн client дээр дуудна. */
export function currentAdminRole(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem("super_admin_user") || localStorage.getItem("user") || "{}";
    return JSON.parse(raw)?.role ?? null;
  } catch {
    return null;
  }
}

export const isSuperAdmin = () => currentAdminRole() === "super_admin";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: jsonH(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    const err = new Error(data?.message || `Алдаа гарлаа (${res.status})`) as Error & {
      missingBidIds?: string[];
    };
    err.missingBidIds = data?.missingBidIds;
    throw err;
  }
  return data as T;
}

/** Оролцох хүсэлтийг зөвшөөрөх / татгалзах */
export function decideParticipant(
  annId: string,
  participantRowId: string,
  status: Exclude<ParticipationStatus, "pending">,
  note?: string,
) {
  return request<{ participant: any }>(
    "PATCH",
    `/api/announcements/${annId}/participants/${participantRowId}/status`,
    { status, note },
  );
}

/** Нэг үнийн саналыг шалтгаантай татгалзах */
export function rejectBid(annId: string, bidId: string, reason: string) {
  return request<{ bid: any }>("PATCH", `/api/announcements/${annId}/bids/${bidId}/status`, {
    status: "rejected",
    reason,
  });
}

/** Ялагч сонгох: бусад бүх саналыг шалтгаантай татгалзана */
export function awardAnnouncement(
  annId: string,
  winnerBidId: string,
  defaultReason: string,
  reasons: Record<string, string>,
) {
  return request<{ winnerBidId: string; rejectedCount: number; bids: any[] }>(
    "POST",
    `/api/announcements/${annId}/award`,
    { winnerBidId, defaultReason, reasons },
  );
}

/**
 * Зарлалын нэгдсэн групп чатыг нээнэ (байхгүй бол үүсгэж, зөвшөөрөгдсөн бүх оролцогчийг нэмнэ).
 * Хуудаснаас гаралгүйгээр баруун доод буланд байрлах чатын цонхонд шууд харуулна.
 */
export async function openAnnouncementRoom(annId: string): Promise<void> {
  const { conversation } = await chatApi.announcementRoom(annId);
  getChatStore().openInWidget(conversation);
}

export const PARTICIPATION_BADGE: Record<
  ParticipationStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  pending: {
    label: "⏳ Хүлээгдэж байна",
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.30)",
  },
  approved: {
    label: "✓ Зөвшөөрсөн",
    color: "#34d399",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.30)",
  },
  rejected: {
    label: "✕ Татгалзсан",
    color: "#f87171",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.30)",
  },
};

export const MIN_REASON_LEN = 10;