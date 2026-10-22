"use client";
import { useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  FileText,
  Search,
  ShieldCheck,
  MessageSquarePlus,
  WifiOff,
} from "lucide-react";
import type { ConversationSummary, MemberRef } from "@/lib/chat/types";
import { ConvAvatar } from "./Avatar";
import { fmtListTime, previewText } from "./format";
import { getChatStore, useChat } from "./store";
import { C } from "./styles";
import { IconButton, Spinner, inputStyle } from "./ui";

type Filter = "all" | "unread" | "group" | "tender";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Бүгд" },
  { id: "unread", label: "Уншаагүй" },
  { id: "group", label: "Групп" },
  { id: "tender", label: "Тендер" },
];

const isMuted = (c: ConversationSummary) =>
  !!c.mutedUntil && new Date(c.mutedUntil).getTime() > Date.now();

export function ConversationList({
  onNew,
  onOpen,
}: {
  onNew: () => void;
  onOpen: (id: string) => void;
}) {
  const store = getChatStore();
  const me = useChat((s) => s.me);
  const convs = useChat((s) => s.convs);
  const order = useChat((s) => s.order);
  const activeId = useChat((s) => s.activeId);
  const scope = useChat((s) => s.scope);
  const loading = useChat((s) => s.convLoading);
  const loaded = useChat((s) => s.convLoaded);
  const hasMore = useChat((s) => s.convHasMore);
  const connection = useChat((s) => s.connection);
  const typing = useChat((s) => s.typing);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [notifPerm, setNotifPerm] = useState<string>(() =>
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported",
  );

  const meRef: MemberRef | null = me
    ? { type: me.actor.type, id: me.actor.id }
    : null;

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return order
      .map((id) => convs[id])
      .filter((c): c is ConversationSummary => !!c)
      .filter((c) => {
        if (filter === "unread" && c.unread === 0) return false;
        if (filter === "group" && c.kind !== "group") return false;
        if (filter === "tender" && !c.announcement) return false;
        if (!term) return true;
        return (
          c.title.toLowerCase().includes(term) ||
          c.announcement?.title.toLowerCase().includes(term) ||
          c.members.some((m) => m.name.toLowerCase().includes(term))
        );
      });
  }, [order, convs, q, filter]);

  if (!me || !meRef) return null;

  const requestNotif = async () => {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setNotifPerm(p);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "16px 16px 10px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <h2
          style={{
            flex: 1,
            margin: 0,
            fontSize: 21,
            fontWeight: 750,
            letterSpacing: "-0.01em",
          }}
        >
          Чат
        </h2>
        {notifPerm === "default" && (
          <IconButton label="Мэдэгдэл асаах" onClick={requestNotif}>
            <Bell size={17} />
          </IconButton>
        )}
        {me.isSuperAdmin && me.superAdminCanReadAll && (
          <IconButton
            label={
              scope === "all" ? "Миний чатууд руу буцах" : "Бүх чатыг хянах"
            }
            active={scope === "all"}
            onClick={() => store.setScope(scope === "all" ? "mine" : "all")}
          >
            <ShieldCheck size={17} />
          </IconButton>
        )}
        <IconButton label="Шинэ чат" onClick={onNew} active>
          <MessageSquarePlus size={17} />
        </IconButton>
      </div>

      {scope === "all" && (
        <div
          style={{
            margin: "0 16px 10px",
            padding: "8px 11px",
            borderRadius: 10,
            background: C.amberSoft,
            color: C.amber,
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          Хяналтын горим: байгууллагын бүх чат харагдаж байна. Та гишүүн биш
          чатад бичих боломжгүй.
        </div>
      )}

      <div style={{ padding: "0 16px 10px", position: "relative" }}>
        <Search
          size={15}
          style={{ position: "absolute", left: 28, top: 11, color: C.faint }}
        />
        <input
          className="bc-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Чат, хүн, тендер хайх"
          aria-label="Чат хайх"
          style={{
            ...inputStyle,
            paddingLeft: 36,
            borderRadius: 99,
            background: "rgba(255,255,255,0.05)",
          }}
        />
      </div>

      <div
        style={{
          padding: "0 16px 8px",
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: `1px solid ${filter === f.id ? "transparent" : C.border}`,
              background: filter === f.id ? C.blueSoft : "transparent",
              color: filter === f.id ? C.blueText : C.muted,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {(connection === "disconnected" || connection === "polling") && (
        <div
          style={{
            margin: "0 16px 8px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: C.faint,
          }}
        >
          <WifiOff size={12} />
          {connection === "polling"
            ? "Шууд холболтгүй, тогтмол шинэчилж байна"
            : "Холболт тасарсан, дахин холбогдож байна…"}
        </div>
      )}

      <div
        className="bc-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "2px 8px 12px",
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (
            hasMore &&
            !loading &&
            el.scrollTop + el.clientHeight > el.scrollHeight - 200
          )
            store.loadConversations();
        }}
      >
        {!loaded && (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 30 }}
          >
            <Spinner />
          </div>
        )}

        {loaded && list.length === 0 && (
          <div
            style={{
              padding: "36px 18px",
              textAlign: "center",
              color: C.muted,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {q || filter !== "all" ? (
              "Тохирох чат олдсонгүй."
            ) : (
              <>
                Одоогоор чат алга байна.
                <br />
                <button
                  type="button"
                  onClick={onNew}
                  style={{
                    marginTop: 12,
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "none",
                    background: C.blue,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Шинэ чат эхлүүлэх
                </button>
              </>
            )}
          </div>
        )}

        {list.map((c) => {
          const unread = c.unread > 0;
          const muted = isMuted(c);
          const typers = Object.values(typing[c.id] ?? {});
          const line =
            typers.length > 0
              ? c.kind === "group"
                ? `${typers[0].name.split(/\s+/)[0]} бичиж байна…`
                : "Бичиж байна…"
              : previewText(c.lastMessage, meRef, c.kind === "group");
          return (
            <button
              key={c.id}
              type="button"
              className="bc-conv-item"
              data-active={c.id === activeId}
              onClick={() => onOpen(c.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "9px 10px",
                border: "none",
                borderRadius: 12,
                background: "transparent",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <ConvAvatar conv={c} me={meRef} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 14,
                      fontWeight: unread ? 700 : 550,
                      color: C.text,
                    }}
                  >
                    {c.title}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: unread ? C.blueText : C.faint,
                      flexShrink: 0,
                    }}
                  >
                    {fmtListTime(c.lastMessage?.createdAt ?? c.lastMessageAt)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 2,
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 12.5,
                      color: typers.length
                        ? C.blueText
                        : unread
                          ? C.text2
                          : C.muted,
                      fontWeight: unread ? 600 : 400,
                    }}
                  >
                    {line}
                  </span>
                  {muted && (
                    <BellOff
                      size={12}
                      style={{ color: C.faint, flexShrink: 0 }}
                      aria-label="Дуугүй"
                    />
                  )}
                  {unread && (
                    <span
                      style={{
                        minWidth: 18,
                        height: 18,
                        padding: "0 5px",
                        borderRadius: 99,
                        background: muted ? "rgba(148,163,184,0.35)" : C.blue,
                        color: "#fff",
                        fontSize: 10.5,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {c.unread > 99 ? "99+" : c.unread}
                    </span>
                  )}
                </div>
                {c.announcement && (
                  <div
                    style={{
                      marginTop: 4,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      maxWidth: "100%",
                      fontSize: 10.5,
                      color: C.amber,
                      background: C.amberSoft,
                      padding: "1px 7px",
                      borderRadius: 6,
                    }}
                  >
                    <FileText size={10} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.announcement.title}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {loaded && loading && (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 12 }}
          >
            <Spinner size={16} />
          </div>
        )}
      </div>
    </div>
  );
}
