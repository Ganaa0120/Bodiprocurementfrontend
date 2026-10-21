"use client";
import { memo, useCallback, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Reply,
  RotateCcw,
  Smile,
  Trash2,
  Undo2,
} from "lucide-react";
import type { Attachment, ChatMessage, MemberRef, Participant } from "@/lib/chat/types";
import { Avatar } from "./Avatar";
import { fmtFull, fmtSize, fmtTime, isEmojiOnly, sameRef } from "./format";
import { getChatStore } from "./store";
import { C } from "./styles";
import { MenuItem, menuBox, useClickOutside } from "./ui";

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]"'])/g;

function linkify(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(URL_RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    out.push(
      <a key={i} href={m[0]} target="_blank" rel="noopener noreferrer nofollow" className="bc-link">
        {m[0]}
      </a>,
    );
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const fileEmoji = (t: string) =>
  t.includes("pdf")
    ? "📄"
    : t.includes("word")
      ? "📝"
      : t.includes("sheet") || t.includes("excel") || t.includes("csv")
        ? "📊"
        : t.includes("presentation") || t.includes("powerpoint")
          ? "📽️"
          : t.includes("zip") || t.includes("rar")
            ? "🗜️"
            : "📎";

function ImageGrid({ images, onOpen }: { images: Attachment[]; onOpen: (a: Attachment) => void }) {
  if (images.length === 1) {
    const a = images[0];
    const ratio = a.width && a.height ? a.width / a.height : 4 / 3;
    const w = Math.min(280, ratio >= 1 ? 280 : 280 * ratio);
    return (
      <button
        type="button"
        onClick={() => onOpen(a)}
        aria-label={`Зураг нээх: ${a.name}`}
        style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in", display: "block" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={a.url}
          alt={a.name}
          loading="lazy"
          style={{
            display: "block",
            width: w,
            maxWidth: "100%",
            aspectRatio: String(ratio),
            maxHeight: 340,
            objectFit: "cover",
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
          }}
        />
      </button>
    );
  }
  const cols = images.length === 2 || images.length === 4 ? 2 : 3;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3, width: cols * 96 }}>
      {images.map((a, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(a)}
          aria-label={`Зураг нээх: ${a.name}`}
          style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.url}
            alt={a.name}
            loading="lazy"
            style={{
              display: "block",
              width: "100%",
              aspectRatio: "1",
              objectFit: "cover",
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
            }}
          />
        </button>
      ))}
    </div>
  );
}

function FileCard({ a, mine }: { a: Attachment; mine: boolean }) {
  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      download={a.name}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 11px",
        width: 260,
        maxWidth: "100%",
        borderRadius: 12,
        textDecoration: "none",
        background: mine ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${mine ? "rgba(255,255,255,0.18)" : C.border}`,
        color: mine ? "#fff" : C.text,
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{fileEmoji(a.type)}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {a.name}
        </span>
        <span style={{ fontSize: 11, opacity: 0.7 }}>{fmtSize(a.size)}</span>
      </span>
      <Download size={15} style={{ opacity: 0.7, flexShrink: 0 }} />
    </a>
  );
}

export interface MessageItemProps {
  m: ChatMessage;
  me: MemberRef;
  isGroup: boolean;
  showName: boolean;
  showAvatar: boolean;
  firstInGroup: boolean;
  lastInGroup: boolean;
  readers: Participant[];
  showStatus: boolean;
  canWrite: boolean;
  isSuperAdmin: boolean;
  editWindowMs: number;
  members: Participant[];
  highlighted: boolean;
  onReply: (m: ChatMessage) => void;
  onEdit: (m: ChatMessage) => void;
  onOpenImage: (a: Attachment) => void;
  onJump: (id: string) => void;
  onConfirmDelete: (m: ChatMessage, asAdmin: boolean) => void;
}

function MessageItemImpl(p: MessageItemProps) {
  const { m, me } = p;
  const store = getChatStore();
  const mine = sameRef(m.sender, me);
  const [open, setOpen] = useState<null | "react" | "menu">(null);
  const close = useCallback(() => setOpen(null), []);
  const ref = useClickOutside(close, open !== null);

  if (m.kind === "system") {
    return (
      <div style={{ textAlign: "center", padding: "10px 24px", fontSize: 12, color: C.faint, lineHeight: 1.5 }}>
        {m.body}
      </div>
    );
  }

  const images = m.attachments.filter((a) => a.isImage);
  const files = m.attachments.filter((a) => !a.isImage);
  const emojiOnly = !m.deleted && !m.attachments.length && !m.replyTo && isEmojiOnly(m.body);
  const pending = !!m.status;
  const canEdit =
    mine && !pending && !m.deleted && p.canWrite && Date.now() - new Date(m.createdAt).getTime() < p.editWindowMs;
  const canUnsend = mine && !pending && !m.deleted && p.canWrite;
  const canAdminDelete = p.isSuperAdmin && !mine && !m.deleted && !pending;

  const r = 18;
  const tight = 5;
  const radius = mine
    ? `${r}px ${p.firstInGroup ? r : tight}px ${p.lastInGroup ? r : tight}px ${r}px`
    : `${p.firstInGroup ? r : tight}px ${r}px ${r}px ${p.lastInGroup ? r : tight}px`;

  const reactionGroups = Object.entries(
    m.reactions.reduce<Record<string, string[]>>((acc, rx) => {
      const who = p.members.find((x) => sameRef(x, rx));
      (acc[rx.emoji] ??= []).push(who?.name ?? "Хэрэглэгч");
      return acc;
    }, {}),
  );
  const myReaction = m.reactions.find((rx) => sameRef(rx, me))?.emoji;

  const actions = !pending && !m.deleted && (
    <div
      className="bc-actions"
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        position: "relative",
        alignSelf: "center",
        flexDirection: mine ? "row-reverse" : "row",
      }}
    >
      {p.canWrite && (
        <ActionBtn label="Reaction" onClick={() => setOpen(open === "react" ? null : "react")}>
          <Smile size={15} />
        </ActionBtn>
      )}
      {p.canWrite && (
        <ActionBtn label="Хариулах" onClick={() => p.onReply(m)}>
          <Reply size={15} />
        </ActionBtn>
      )}
      <ActionBtn label="Бусад" onClick={() => setOpen(open === "menu" ? null : "menu")}>
        <MoreHorizontal size={15} />
      </ActionBtn>

      {open === "react" && (
        <div
          role="menu"
          style={{
            ...menuBox,
            minWidth: 0,
            bottom: "calc(100% + 6px)",
            [mine ? "right" : "left"]: 0,
            display: "flex",
            gap: 2,
            padding: 5,
            borderRadius: 99,
          }}
        >
          {QUICK_REACTIONS.map((e) => (
            <button
              key={e}
              type="button"
              aria-label={`${e} reaction`}
              onClick={() => {
                store.react(m, e);
                close();
              }}
              style={{
                width: 36,
                height: 36,
                fontSize: 21,
                border: "none",
                borderRadius: 99,
                cursor: "pointer",
                background: myReaction === e ? C.blueSoft : "transparent",
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {open === "menu" && (
        <div role="menu" style={{ ...menuBox, bottom: "calc(100% + 6px)", [mine ? "right" : "left"]: 0 }}>
          {m.body && (
            <MenuItem
              icon={<Copy size={14} />}
              onClick={() => {
                navigator.clipboard?.writeText(m.body).then(() => store.showToast("Хуулагдлаа"));
                close();
              }}
            >
              Текст хуулах
            </MenuItem>
          )}
          {canEdit && (
            <MenuItem
              icon={<Pencil size={14} />}
              onClick={() => {
                p.onEdit(m);
                close();
              }}
            >
              Засах
            </MenuItem>
          )}
          {canUnsend && (
            <MenuItem
              danger
              icon={<Undo2 size={14} />}
              onClick={() => {
                p.onConfirmDelete(m, false);
                close();
              }}
            >
              Бүгдээс буцаах
            </MenuItem>
          )}
          {canAdminDelete && (
            <MenuItem
              danger
              icon={<Trash2 size={14} />}
              onClick={() => {
                p.onConfirmDelete(m, true);
                close();
              }}
            >
              Устгах (супер админ)
            </MenuItem>
          )}
          <div style={{ padding: "6px 12px 4px", fontSize: 11, color: C.faint }}>{fmtFull(m.createdAt)}</div>
        </div>
      )}
    </div>
  );

  return (
    <div
      id={`msg-${m.id}`}
      className={`bc-row${p.highlighted ? " bc-flash" : ""}`}
      data-open={open !== null}
      onClick={(e) => {
        // Touch төхөөрөмж дээр товшиход үйлдлүүд гарна
        if (window.matchMedia("(hover: none)").matches && !(e.target as HTMLElement).closest("a,button")) {
          setOpen((o) => (o ? null : "menu"));
        }
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: mine ? "flex-end" : "flex-start",
        padding: `${p.firstInGroup ? 8 : 1}px 14px ${p.lastInGroup && m.reactions.length === 0 ? 2 : 1}px`,
        borderRadius: 10,
      }}
    >
      {p.showName && !mine && (
        <div style={{ fontSize: 11.5, color: C.muted, margin: "0 0 3px 50px" }}>{m.senderName}</div>
      )}

      {m.replyTo && (
        <button
          type="button"
          onClick={() => !m.replyTo!.hidden && !m.replyTo!.deleted && p.onJump(m.replyTo!.id)}
          style={{
            margin: mine ? "0 0 -8px 0" : "0 0 -8px 50px",
            maxWidth: "min(70%, 420px)",
            padding: "7px 12px 14px",
            borderRadius: 14,
            border: "none",
            textAlign: "left",
            cursor: m.replyTo.hidden || m.replyTo.deleted ? "default" : "pointer",
            background: "rgba(255,255,255,0.045)",
            color: C.muted,
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: 11, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
            <Reply size={11} />
            Хариулсан · {sameRef(m.replyTo.sender, me) ? "Таны мессеж" : m.replyTo.senderName}
          </div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.85 }}>
            {m.replyTo.hidden
              ? "Таны харах эрхгүй мессеж"
              : m.replyTo.deleted
                ? "Буцаагдсан мессеж"
                : m.replyTo.body || (m.replyTo.hasAttachments ? "Хавсралт" : "")}
          </div>
        </button>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, maxWidth: "100%", flexDirection: mine ? "row-reverse" : "row" }}>
        {!mine && (
          <div style={{ width: 34, flexShrink: 0 }}>
            {p.showAvatar && <Avatar name={m.senderName} type={m.sender.type} id={m.sender.id} size={34} />}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: mine ? "flex-end" : "flex-start",
            gap: 3,
            maxWidth: "min(72%, 560px)",
            minWidth: 0,
            opacity: pending && m.status === "sending" ? 0.7 : 1,
          }}
          title={fmtFull(m.createdAt)}
        >
          {m.deleted ? (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: radius,
                border: `1px solid ${C.borderStrong}`,
                color: C.faint,
                fontSize: 13.5,
                fontStyle: "italic",
              }}
            >
              {mine ? "Та мессежээ буцаасан" : "Мессеж буцаагдсан"}
            </div>
          ) : (
            <>
              {images.length > 0 && <ImageGrid images={images} onOpen={p.onOpenImage} />}
              {files.map((a, i) => (
                <FileCard key={i} a={a} mine={mine} />
              ))}
              {m.body &&
                (emojiOnly ? (
                  <div style={{ fontSize: 38, lineHeight: 1.15, padding: "2px 2px" }}>{m.body}</div>
                ) : (
                  <div
                    style={{
                      padding: "8px 13px",
                      borderRadius: radius,
                      background: mine ? C.blue : C.bubbleOther,
                      color: mine ? "#fff" : C.text,
                      fontSize: 14,
                      lineHeight: 1.45,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {linkify(m.body)}
                  </div>
                ))}
            </>
          )}
        </div>

        {actions}
      </div>

      {reactionGroups.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 4,
            margin: mine ? "-4px 8px 4px 0" : "-4px 0 4px 54px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {reactionGroups.map(([emoji, who]) => (
            <button
              key={emoji}
              type="button"
              disabled={!p.canWrite}
              onClick={() => store.react(m, emoji)}
              title={who.join(", ")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "1px 7px",
                borderRadius: 99,
                fontSize: 13,
                cursor: p.canWrite ? "pointer" : "default",
                background: C.raised,
                color: C.text2,
                border: `1px solid ${myReaction === emoji ? C.blue : C.borderStrong}`,
              }}
            >
              {emoji}
              {who.length > 1 && <span style={{ fontSize: 11 }}>{who.length}</span>}
            </button>
          ))}
        </div>
      )}

      {m.editedAt && !m.deleted && (
        <div style={{ fontSize: 10.5, color: C.faint, margin: mine ? "1px 6px 0 0" : "1px 0 0 54px" }}>Засварласан</div>
      )}

      {m.status === "failed" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 3,
            fontSize: 11.5,
            color: C.red,
          }}
        >
          <AlertCircle size={13} />
          <span>{m.error ?? "Илгээж чадсангүй"}</span>
          <button
            type="button"
            onClick={() => store.retry(m.conversationId, m.clientId!)}
            style={{ display: "inline-flex", alignItems: "center", gap: 3, border: "none", background: "none", color: C.blueText, cursor: "pointer", fontSize: 11.5, padding: 0 }}
          >
            <RotateCcw size={11} /> Дахин илгээх
          </button>
          <button
            type="button"
            onClick={() => store.discard(m.conversationId, m.clientId!)}
            style={{ border: "none", background: "none", color: C.faint, cursor: "pointer", fontSize: 11.5, padding: 0 }}
          >
            Устгах
          </button>
        </div>
      )}

      {m.status === "sending" && p.showStatus && (
        <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2, marginRight: 4 }}>Илгээж байна…</div>
      )}

      {!pending && (p.readers.length > 0 || p.showStatus) && (
        <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", gap: 2, marginTop: 3, marginRight: 2, marginLeft: mine ? 0 : 54 }}>
          {p.readers.length > 0 ? (
            p.readers.slice(0, 8).map((r) => (
              <span key={`${r.type}:${r.id}`} title={`${r.name} үзсэн`}>
                <Avatar name={r.name} type={r.type} id={r.id} src={r.avatarUrl} size={14} />
              </span>
            ))
          ) : (
            <span style={{ fontSize: 10.5, color: C.faint }}>Илгээсэн · {fmtTime(m.createdAt)}</span>
          )}
          {p.readers.length > 8 && <span style={{ fontSize: 10, color: C.faint }}>+{p.readers.length - 8}</span>}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="bc-icon-btn"
      style={{
        width: 28,
        height: 28,
        borderRadius: 99,
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

export const MessageItem = memo(MessageItemImpl);
