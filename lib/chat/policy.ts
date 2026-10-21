import type { Actor, ActorRole } from "./types";

/**
 * Чатын бизнес дүрэм. Энд өөрчлөхөд API болон UI хоёулаа дагана.
 */
export const POLICY = {
  /** Нийлүүлэгч админ руу өөрөө хувийн чат эхлүүлж болох эсэх */
  supplierCanStartDirect: true,
  /** Нийлүүлэгч бусад нийлүүлэгчийг хайж олох эсэх (тендерийн шударга байдал — false байлгах) */
  supplierCanSeeSuppliers: false,
  /** Super admin бүх чатыг хяналтын горимоор (read-only) харах эсэх */
  superAdminCanReadAll: true,
  /** Группт шинээр нэмэгдсэн нийлүүлэгч өмнөх түүхийг харахгүй */
  hideHistoryForNewSuppliers: true,
  /** Мессеж буцаахад (unsend) DB-ээс агуулгыг бүр мөсөн арилгах эсэх. false = audit-д үлдээнэ */
  wipeUnsentContent: false,
  /** Өөрийн мессежийг засах хугацаа */
  editWindowMs: 15 * 60 * 1000,
  maxGroupMembers: 200,
  maxMessageLength: 5000,
  maxAttachments: 10,
  maxFileBytes: 25 * 1024 * 1024,
  rateLimit: { windowSec: 10, max: 15 },
} as const;

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "text/plain",
  "text/csv",
] as const;

/** Файлын URL ямар host-оос ирж болох. "." -ээр эхэлбэл subdomain бүгд. */
export function isAllowedFileHost(hostname: string): boolean {
  const list = (process.env.CHAT_FILE_HOSTS ?? ".public.blob.vercel-storage.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const h = hostname.toLowerCase();
  return list.some((s) => (s.startsWith(".") ? h.endsWith(s) : h === s));
}

export const isSuperAdmin = (a: Actor) => a.type === "admin" && a.role === "super_admin";

export function roleLabel(role: ActorRole | string | null | undefined): string {
  switch (role) {
    case "super_admin":
      return "Супер админ";
    case "mini_admin":
      return "Мини админ";
    case "sub_admin":
      return "Дэд админ";
    case "supplier":
      return "Нийлүүлэгч";
    default:
      return "Ажилтан";
  }
}