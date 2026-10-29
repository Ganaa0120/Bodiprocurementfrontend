"use client";
import type {
  AnnouncementContactGroup,
  AnnouncementRef,
  Attachment,
  ChatMessage,
  ConversationSummary,
  FileItem,
  MeInfo,
  MemberInfo,
  MemberRef,
} from "@/lib/chat/types";

/**
 * Login хуудас: хувь хүн/компани → "token", super/mini admin → "super_admin_token".
 * Нэг browser-т хоёулаа үлдсэн байж болох тул аль dashboard дээр байгаагаар нь сонгоно —
 * company хуудсан дээр admin-ий token-оор чат ажиллахаас сэргийлнэ.
 */
export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  const p = window.location.pathname;
  if (p.startsWith("/dashboard/company") || p.startsWith("/dashboard/person")) {
    return localStorage.getItem("token");
  }
  return localStorage.getItem("super_admin_token") || localStorage.getItem("token");
}

export function authHeaders(): Record<string, string> {
  const t = readToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** supplier-backend-ийн хаяг. Жишээ: https://api.procurement.bodigroup.mn */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

export function authToken(): string | null {
  const h = authHeaders().Authorization;
  return h ? h.replace(/^Bearer\s+/i, "") : null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function req<T>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_BASE + url, {
      method,
      credentials: "include",
      cache: "no-store",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...authHeaders(),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Сүлжээний холболт тасарсан байна");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Алдаа гарлаа (${res.status})`);
  return data as T;
}

const qs = (o: Record<string, string | number | null | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) if (v != null && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

const enc = encodeURIComponent;

export const chatApi = {
  me: () => req<MeInfo>("GET", "/api/chat/me"),

  conversations: (p: { scope?: "mine" | "all"; cursor?: string | null; limit?: number }) =>
    req<{ items: ConversationSummary[]; nextCursor: string | null }>(
      "GET",
      `/api/chat/conversations${qs({ scope: p.scope === "all" ? "all" : null, cursor: p.cursor, limit: p.limit })}`,
    ),
  conversation: (id: string) =>
    req<{ conversation: ConversationSummary }>("GET", `/api/chat/conversations/${enc(id)}`),
  create: (body: {
    kind: "direct" | "group";
    members: MemberRef[];
    title?: string;
    announcementId?: string | null;
  }) => req<{ conversation: ConversationSummary }>("POST", "/api/chat/conversations", body),
  update: (id: string, body: { title?: string | null; announcementId?: string | null }) =>
    req<{ conversation: ConversationSummary }>("PATCH", `/api/chat/conversations/${enc(id)}`, body),
  remove: (id: string, hard = false) =>
    req<{ ok: true }>("DELETE", `/api/chat/conversations/${enc(id)}${hard ? "?hard=1" : ""}`),

  addMembers: (id: string, members: MemberRef[]) =>
    req<{ conversation: ConversationSummary }>("POST", `/api/chat/conversations/${enc(id)}/members`, {
      members,
    }),
  removeMember: (id: string, m: MemberRef) =>
    req<{ ok: true }>("DELETE", `/api/chat/conversations/${enc(id)}/members${qs({ type: m.type, id: m.id })}`),
  setRole: (id: string, member: MemberRef, role: "admin" | "member") =>
    req<{ conversation: ConversationSummary }>("PATCH", `/api/chat/conversations/${enc(id)}/members`, {
      member,
      role,
    }),

  markRead: (id: string, messageId: string) =>
    req<{ lastReadAt?: string }>("PATCH", `/api/chat/conversations/${enc(id)}/me`, { readUpTo: messageId }),
  setMute: (id: string, mutedUntil: string | null) =>
    req<{ mutedUntil?: string | null }>("PATCH", `/api/chat/conversations/${enc(id)}/me`, { mutedUntil }),

  messages: (id: string, p: { before?: string | null; after?: string | null; limit?: number }) =>
    req<{ messages: ChatMessage[]; hasMoreBefore: boolean; hasMoreAfter: boolean }>(
      "GET",
      `/api/chat/conversations/${enc(id)}/messages${qs(p)}`,
    ),
  send: (
    id: string,
    body: { body: string; attachments: Attachment[]; replyToId?: string | null; clientId: string },
  ) => req<{ message: ChatMessage }>("POST", `/api/chat/conversations/${enc(id)}/messages`, body),
  files: (id: string) => req<{ files: FileItem[] }>("GET", `/api/chat/conversations/${enc(id)}/files`),

  message: (id: string) => req<{ message: ChatMessage }>("GET", `/api/chat/messages/${enc(id)}`),
  edit: (id: string, body: string) => req<{ message: ChatMessage }>("PATCH", `/api/chat/messages/${enc(id)}`, { body }),
  unsend: (id: string) => req<{ message: ChatMessage }>("DELETE", `/api/chat/messages/${enc(id)}`),
  react: (id: string, emoji: string | null) =>
    req<{ message: ChatMessage }>("PUT", `/api/chat/messages/${enc(id)}/reaction`, { emoji }),

  directory: (q: string, kind: "all" | "admin" | "person" | "company" = "all") =>
    req<{ items: MemberInfo[] }>("GET", `/api/chat/directory${qs({ q, kind })}`),
  announcements: (q: string) => req<{ items: AnnouncementRef[] }>("GET", `/api/chat/announcements${qs({ q })}`),
  /** Нийлүүлэгч: оролцох зөвшөөрөл авсан зарлалууд ба чатлаж болох ажилтнууд */
  announcementContacts: () => req<{ items: AnnouncementContactGroup[] }>("GET", "/api/chat/announcement-contacts"),
  /** Админ: зарлалын нэгдсэн групп чатыг нээх (байхгүй бол үүсгэнэ) */
  announcementRoom: (annId: string) =>
    req<{ conversation: ConversationSummary }>("POST", `/api/chat/announcements/${enc(annId)}/room`),

  /** Файлыг backend-ээр дамжуулж Azure Blob-д хадгална (multipart) */
  upload: async (file: File): Promise<{ url: string; name: string; size: number; type: string }> => {
    const fd = new FormData();
    fd.append("file", file, file.name);
    let res: Response;
    try {
      res = await fetch(API_BASE + "/api/chat/upload", {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: fd,
      });
    } catch {
      throw new ApiError(0, "Сүлжээний холболт тасарсан байна");
    }
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, data?.error ?? "Файл байршуулж чадсангүй");
    return data;
  },
  heartbeat: () => req<{ ok: true }>("POST", "/api/chat/heartbeat"),
  unread: () => req<{ count: number }>("GET", "/api/chat/unread"),
};