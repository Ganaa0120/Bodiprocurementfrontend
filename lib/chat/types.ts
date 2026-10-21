// Server болон client хоёуланд хэрэглэгдэх төрлүүд. Энд server-only import оруулахгүй.

export type MemberType = "admin" | "supplier";
export type ActorRole = "super_admin" | "mini_admin" | "sub_admin" | "supplier";
export type ParticipantRole = "owner" | "admin" | "member";
export type ConversationKind = "direct" | "group";

export interface MemberRef {
  type: MemberType;
  id: string;
}

export interface Actor extends MemberRef {
  role: ActorRole;
  name: string;
}

export interface MemberInfo extends MemberRef {
  name: string;
  subtitle: string | null;
  avatarUrl: string | null;
  exists: boolean;
}

export interface Participant extends MemberInfo {
  role: ParticipantRole;
  lastReadAt: string | null;
  joinedAt: string | null;
  online: boolean;
  lastSeenAt: string | null;
}

export interface Attachment {
  url: string;
  name: string;
  size: number;
  type: string;
  isImage: boolean;
  width?: number;
  height?: number;
}

export interface Reaction {
  type: MemberType;
  id: string;
  emoji: string;
}

export interface ReplyPreview {
  id: string;
  body: string;
  sender: MemberRef;
  senderName: string;
  deleted: boolean;
  hidden: boolean;
  hasAttachments: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: MemberRef;
  senderName: string;
  kind: "text" | "system";
  body: string;
  attachments: Attachment[];
  replyTo: ReplyPreview | null;
  reactions: Reaction[];
  editedAt: string | null;
  deleted: boolean;
  createdAt: string;
  /** Pagination cursor (microsecond нарийвчлалтай). Эрэмбэлэхэд хэрэглэнэ. */
  cursor: string;
  clientId: string | null;
  /** Зөвхөн client: optimistic мессежийн төлөв */
  status?: "sending" | "failed";
  error?: string;
}

export interface LastMessagePreview {
  id: string;
  kind: "text" | "system";
  body: string;
  sender: MemberRef;
  senderName: string;
  attachmentKind: "image" | "file" | null;
  attachmentCount: number;
  deleted: boolean;
  createdAt: string;
}

export interface AnnouncementRef {
  id: string;
  title: string;
}

export interface ConversationSummary {
  id: string;
  kind: ConversationKind;
  title: string;
  customTitle: string | null;
  avatarUrl: string | null;
  announcement: AnnouncementRef | null;
  members: Participant[];
  lastMessage: LastMessagePreview | null;
  lastMessageAt: string;
  createdAt: string;
  cursor: string;
  unread: number;
  mutedUntil: string | null;
  myRole: ParticipantRole | null;
  isMember: boolean;
  canManage: boolean;
}

export interface MeInfo {
  actor: Actor;
  displayName: string;
  isSuperAdmin: boolean;
  canCreateGroup: boolean;
  canSearchSuppliers: boolean;
  superAdminCanReadAll: boolean;
  editWindowMs: number;
  maxAttachments: number;
  maxFileBytes: number;
  maxMessageLength: number;
}

export interface FileItem {
  messageId: string;
  createdAt: string;
  sender: MemberRef;
  senderName: string;
  attachment: Attachment;
}

export const CHAT_EVENTS = [
  "message:new",
  "message:update",
  "conversation:upsert",
  "conversation:remove",
  "read",
] as const;
export type ChatEventName = (typeof CHAT_EVENTS)[number];

export interface MessageEventPayload {
  message?: ChatMessage;
  /** Pusher 10KB хязгаараас том бол зөвхөн stub ирнэ, client өөрөө татна */
  stub?: { conversationId: string; messageId: string };
}
export interface ConversationEventPayload {
  conversationId: string;
}
export interface ReadEventPayload {
  conversationId: string;
  member: MemberRef;
  lastReadAt: string;
}
export interface TypingPayload {
  type: MemberType;
  id: string;
  name: string;
}