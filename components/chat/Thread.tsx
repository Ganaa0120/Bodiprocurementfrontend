"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
} from "react";
import { ArrowDown, ArrowLeft, ChevronLeft, ChevronRight, Download, Eye, FileText, Info, Upload, X } from "lucide-react";
import type { Attachment, ChatMessage, MemberRef, Participant } from "@/lib/chat/types";
import { ConvAvatar } from "./Avatar";
import { Composer, type ComposerHandle } from "./Composer";
import { MessageItem } from "./MessageItem";
import { fmtDayLabel, fmtLastSeen, fmtTime, sameRef } from "./format";
import { getChatStore, useChat } from "./store";
import { C } from "./styles";
import { Button, IconButton, Modal, Spinner } from "./ui";

const GROUP_GAP_MS = 5 * 60 * 1000;
const TIME_SEP_GAP_MS = 30 * 60 * 1000;
const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

export function Thread({
  convId,
  showBack,
  onBack,
  infoOpen,
  onToggleInfo,
  announcementHref,
}: {
  convId: string;
  showBack: boolean;
  onBack: () => void;
  infoOpen: boolean;
  onToggleInfo: () => void;
  announcementHref?: (id: string) => string;
}) {
  const store = getChatStore();
  const me = useChat((s) => s.me);
  const conv = useChat((s) => s.convs[convId]);
  const thread = useChat((s) => s.threads[convId]);
  const typingMap = useChat((s) => s.typing[convId]);

  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [lightbox, setLightbox] = useState<{ list: Attachment[]; index: number } | null>(null);
  const [confirmDel, setConfirmDel] = useState<{ m: ChatMessage; asAdmin: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [newBelow, setNewBelow] = useState(0);
  const [highlight, setHighlight] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ComposerHandle>(null);
  const prevFirstId = useRef<string | null>(null);
  const prevLastId = useRef<string | null>(null);
  const prevHeight = useRef(0);
  const dragDepth = useRef(0);

  const meRef: MemberRef | null = me ? { type: me.actor.type, id: me.actor.id } : null;
  const items = thread?.items ?? [];

  // Чат солигдоход state цэвэрлэх
  useEffect(() => {
    setReplyTo(null);
    setEditing(null);
    setNewBelow(0);
    setAtBottom(true);
    prevFirstId.current = null;
    prevLastId.current = null;
  }, [convId]);

  // Scroll удирдлага: эхний ачаалал → доош, хуучин ачаалал → байрлал хадгалах, шинэ → доош (ойр байвал)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !items.length) return;
    const firstId = items[0].id;
    const last = items[items.length - 1];

    if (prevFirstId.current === null) {
      el.scrollTop = el.scrollHeight;
    } else if (firstId !== prevFirstId.current && last.id === prevLastId.current) {
      el.scrollTop += el.scrollHeight - prevHeight.current;
    } else if (last.id !== prevLastId.current) {
      // Шинэ мессеж ирэхээс өмнө доороос хэр зайтай байсныг шалгана
      const nearBottom = prevHeight.current - el.scrollTop - el.clientHeight < 160;
      const mine = meRef && sameRef(last.sender, meRef);
      if (nearBottom || mine) {
        el.scrollTop = el.scrollHeight;
        setNewBelow(0);
      } else if (last.kind === "text") {
        setNewBelow((n) => n + 1);
      }
    }
    prevFirstId.current = firstId;
    prevLastId.current = last.id;
    prevHeight.current = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Зураг ачаалагдаж өндөр өөрчлөгдөхөд доод хэсэгт байгаа бол доор нь үлдээх
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const inner = el.firstElementChild;
    if (!inner) return;
    const ro = new ResizeObserver(() => {
      if (atBottom) el.scrollTop = el.scrollHeight;
      prevHeight.current = el.scrollHeight;
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [atBottom, convId]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (bottom !== atBottom) setAtBottom(bottom);
    if (bottom) {
      if (newBelow) setNewBelow(0);
      store.markReadSoon(convId);
    }
    if (el.scrollTop < 120 && thread?.hasMoreBefore && !thread.loadingOlder) store.loadOlder(convId);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setNewBelow(0);
  };

  const jumpTo = useCallback(
    async (id: string) => {
      for (let i = 0; i < 10; i++) {
        const el = document.getElementById(`msg-${id}`);
        if (el) {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
          setHighlight(id);
          setTimeout(() => setHighlight((h) => (h === id ? null : h)), 1700);
          return;
        }
        const t = store.getState().threads[convId];
        if (!t?.hasMoreBefore) break;
        await store.loadOlder(convId);
      }
      store.showToast("Тухайн мессеж олдсонгүй");
    },
    [convId, store],
  );

  const allImages = useMemo(() => items.flatMap((m) => (m.deleted ? [] : m.attachments.filter((a) => a.isImage))), [items]);
  const openImage = useCallback(
    (a: Attachment) => setLightbox({ list: allImages, index: Math.max(0, allImages.findIndex((x) => x.url === a.url)) }),
    [allImages],
  );

  // "Үзсэн" аватарууд: гишүүн бүрийг уншсан хамгийн сүүлийн мессеж дээр нь
  const readersByMsg = useMemo(() => {
    const map = new Map<string, Participant[]>();
    if (!conv || !meRef) return map;
    const real = items.filter((m) => !m.status);
    for (const p of conv.members) {
      if (sameRef(p, meRef) || !p.lastReadAt) continue;
      let target: ChatMessage | null = null;
      for (let i = real.length - 1; i >= 0; i--) {
        if (real[i].createdAt <= p.lastReadAt) {
          target = real[i];
          break;
        }
      }
      if (!target) continue;
      const list = map.get(target.id) ?? [];
      list.push(p);
      map.set(target.id, list);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, conv?.members, me]);

  if (!me || !meRef) return null;

  if (!conv) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner />
      </div>
    );
  }

  const others = conv.members.filter((m) => !sameRef(m, meRef));
  const typers = Object.values(typingMap ?? {});
  const canWrite = conv.isMember && !conv.lockedReason;
  const lastMine = [...items].reverse().find((m) => sameRef(m.sender, meRef) && m.kind === "text");

  let subtitle = "";
  if (conv.kind === "direct") {
    const o = others[0];
    subtitle = o ? fmtLastSeen(o.lastSeenAt, o.online) || (o.subtitle ?? "") : "";
  } else {
    const online = others.filter((m) => m.online).length;
    subtitle = `${conv.members.length} гишүүн${online ? ` · ${online} идэвхтэй` : ""}`;
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (canWrite && !editing && e.dataTransfer.files?.length) composerRef.current?.addFiles(e.dataTransfer.files);
  };

  return (
    <div
      style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%", position: "relative" }}
      onDragEnter={(e) => {
        if (!canWrite || !e.dataTransfer.types.includes("Files")) return;
        dragDepth.current++;
        setDragging(true);
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDragOver={(e) => canWrite && e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderBottom: `1px solid ${C.border}`,
          background: C.panel,
          minHeight: 62,
        }}
      >
        {showBack && (
          <IconButton label="Буцах" onClick={onBack}>
            <ArrowLeft size={19} />
          </IconButton>
        )}
        <button
          type="button"
          onClick={onToggleInfo}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "none",
            color: "inherit",
            textAlign: "left",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <ConvAvatar conv={conv} me={meRef} size={40} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {conv.title}
            </div>
            <div style={{ fontSize: 12, color: typers.length ? C.blueText : C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {typers.length
                ? conv.kind === "group"
                  ? `${typers.map((t) => t.name.split(/\s+/)[0]).join(", ")} бичиж байна…`
                  : "Бичиж байна…"
                : subtitle}
            </div>
          </div>
        </button>
        {conv.announcement && (
          <a
            href={announcementHref ? announcementHref(conv.announcement.id) : undefined}
            title={conv.announcement.title}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              maxWidth: 220,
              padding: "5px 10px",
              borderRadius: 8,
              background: C.amberSoft,
              color: C.amber,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            <FileText size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.announcement.title}</span>
          </a>
        )}
        <IconButton label="Чатын мэдээлэл" onClick={onToggleInfo} active={infoOpen}>
          <Info size={19} />
        </IconButton>
      </div>

      {conv.isMember && conv.lockedReason && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            background: C.amberSoft,
            color: C.amber,
            fontSize: 12,
          }}
        >
          <Eye size={14} /> {conv.lockedReason}
        </div>
      )}

      {!conv.isMember && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            background: C.amberSoft,
            color: C.amber,
            fontSize: 12,
          }}
        >
          <Eye size={14} /> Хяналтын горим — та энэ чатын гишүүн биш тул зөвхөн харах боломжтой.
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="bc-scroll"
        style={{ flex: 1, minHeight: 0, overflowY: "auto", background: C.bg }}
      >
        <div style={{ padding: "10px 0 8px", minHeight: "100%", display: "flex", flexDirection: "column" }}>
          {thread?.loadingOlder && (
            <div style={{ display: "flex", justifyContent: "center", padding: 10 }}>
              <Spinner size={16} />
            </div>
          )}

          {thread?.loaded && !thread.hasMoreBefore && (
            <div style={{ textAlign: "center", padding: "28px 20px 18px" }}>
              <div style={{ display: "inline-block" }}>
                <ConvAvatar conv={conv} me={meRef} size={68} ring={C.bg} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 10 }}>{conv.title}</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>
                {conv.kind === "direct"
                  ? others[0]?.subtitle ?? ""
                  : conv.announcement
                    ? `"${conv.announcement.title}" тендертэй холбоотой групп`
                    : `${conv.members.length} гишүүнтэй групп`}
              </div>
            </div>
          )}

          {!thread?.loaded && !thread?.error && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Spinner />
            </div>
          )}
          {thread?.error && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: C.muted, fontSize: 13 }}>
              {thread.error}
              <Button variant="ghost" onClick={() => store.open(convId)}>
                Дахин ачаалах
              </Button>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {items.map((m, i) => {
            const prev = items[i - 1];
            const next = items[i + 1];
            const dayBreak = !prev || !sameDay(prev.createdAt, m.createdAt);
            const timeBreak =
              !dayBreak && prev && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() > TIME_SEP_GAP_MS;
            const groupable = (a?: ChatMessage, b?: ChatMessage) =>
              !!a &&
              !!b &&
              a.kind === "text" &&
              b.kind === "text" &&
              sameRef(a.sender, b.sender) &&
              sameDay(a.createdAt, b.createdAt) &&
              Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) < GROUP_GAP_MS;
            const nextBreaks =
              !!next && new Date(next.createdAt).getTime() - new Date(m.createdAt).getTime() > TIME_SEP_GAP_MS;
            const first = dayBreak || timeBreak || !groupable(prev, m);
            const last = !groupable(m, next) || nextBreaks || (!!next && !sameDay(m.createdAt, next.createdAt));

            return (
              <div key={m.clientId && m.status ? `c_${m.clientId}` : m.id}>
                {(dayBreak || timeBreak) && (
                  <div style={{ textAlign: "center", fontSize: 11.5, color: C.faint, padding: "14px 0 6px" }}>
                    {dayBreak ? `${fmtDayLabel(m.createdAt)} · ${fmtTime(m.createdAt)}` : fmtTime(m.createdAt)}
                  </div>
                )}
                <MessageItem
                  m={m}
                  me={meRef}
                  isGroup={conv.kind === "group"}
                  showName={conv.kind === "group" && first}
                  showAvatar={last}
                  firstInGroup={first}
                  lastInGroup={last}
                  readers={readersByMsg.get(m.id) ?? []}
                  showStatus={m === lastMine && !readersByMsg.get(m.id)?.length && items[items.length - 1] === m}
                  canWrite={canWrite}
                  isSuperAdmin={me.isSuperAdmin}
                  editWindowMs={me.editWindowMs}
                  members={conv.members}
                  highlighted={highlight === m.id}
                  onReply={(x) => {
                    setEditing(null);
                    setReplyTo(x);
                  }}
                  onEdit={(x) => {
                    setReplyTo(null);
                    setEditing(x);
                  }}
                  onOpenImage={openImage}
                  onJump={jumpTo}
                  onConfirmDelete={(x, asAdmin) => setConfirmDel({ m: x, asAdmin })}
                />
              </div>
            );
          })}

          {typers.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 4px 56px" }}>
              <div style={{ display: "inline-flex", gap: 4, padding: "11px 14px", borderRadius: 18, background: C.bubbleOther }}>
                <span className="bc-dot" />
                <span className="bc-dot" />
                <span className="bc-dot" />
              </div>
            </div>
          )}
        </div>
      </div>

      {!atBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Доош очих"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: canWrite ? 92 : 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: newBelow ? "7px 14px" : 8,
            borderRadius: 99,
            border: `1px solid ${C.borderStrong}`,
            background: C.raised,
            color: newBelow ? C.blueText : C.text2,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            zIndex: 5,
          }}
        >
          <ArrowDown size={15} />
          {newBelow > 0 && `${newBelow} шинэ мессеж`}
        </button>
      )}

      {canWrite && (
        <Composer
          ref={composerRef}
          convId={convId}
          me={me}
          replyTo={replyTo}
          editing={editing}
          onCancelReply={() => setReplyTo(null)}
          onCancelEdit={() => setEditing(null)}
          onSent={() => requestAnimationFrame(scrollToBottom)}
        />
      )}

      {dragging && (
        <div
          style={{
            position: "absolute",
            inset: 8,
            zIndex: 20,
            borderRadius: 16,
            border: `2px dashed ${C.blue}`,
            background: "rgba(13,21,38,0.88)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            color: C.blueText,
            fontSize: 14,
            fontWeight: 600,
            pointerEvents: "none",
          }}
        >
          <Upload size={28} />
          Файлаа энд тавьж хавсаргана уу
        </div>
      )}

      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} onIndex={(index) => setLightbox({ ...lightbox, index })} />}

      {confirmDel && (
        <Modal
          title={confirmDel.asAdmin ? "Мессеж устгах" : "Мессежийг бүгдээс буцаах уу?"}
          onClose={() => setConfirmDel(null)}
          width={420}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmDel(null)}>
                Болих
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  store.unsend(confirmDel.m);
                  setConfirmDel(null);
                }}
              >
                {confirmDel.asAdmin ? "Устгах" : "Буцаах"}
              </Button>
            </>
          }
        >
          <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
            {confirmDel.asAdmin
              ? `${confirmDel.m.senderName}-ийн мессеж бүх гишүүнээс арилна. Устгалт хяналтын бүртгэлд хадгалагдана.`
              : "Энэ мессеж чатын бүх гишүүнээс арилж, оронд нь “Мессеж буцаагдсан” гэж харагдана."}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Lightbox({
  list,
  index,
  onClose,
  onIndex,
}: {
  list: Attachment[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const a = list[index];
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1);
      if (e.key === "ArrowRight" && index < list.length - 1) onIndex(index + 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [index, list.length, onClose, onIndex]);
  if (!a) return null;
  const navBtn = (side: "left" | "right"): CSSProperties => ({
    position: "absolute",
    top: "50%",
    [side]: 16,
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: 99,
    border: "none",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  });
  return (
    <div
      role="dialog"
      aria-label="Зураг"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
        <a
          href={a.url}
          download={a.name}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Татах"
          style={{ width: 40, height: 40, borderRadius: 99, background: "rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Download size={18} />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Хаах"
          style={{ width: 40, height: 40, borderRadius: 99, border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <X size={18} />
        </button>
      </div>
      {index > 0 && (
        <button type="button" aria-label="Өмнөх" style={navBtn("left")} onClick={(e) => (e.stopPropagation(), onIndex(index - 1))}>
          <ChevronLeft size={22} />
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={a.url}
        alt={a.name}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "92vw", maxHeight: "86vh", objectFit: "contain", borderRadius: 8 }}
      />
      {index < list.length - 1 && (
        <button type="button" aria-label="Дараах" style={navBtn("right")} onClick={(e) => (e.stopPropagation(), onIndex(index + 1))}>
          <ChevronRight size={22} />
        </button>
      )}
      <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
        {a.name} · {index + 1}/{list.length}
      </div>
    </div>
  );
}