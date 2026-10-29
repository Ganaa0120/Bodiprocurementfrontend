"use client";
import { useEffect, useState, type ReactNode } from "react";
import { FileText, Loader2, MessageCircle, Users } from "lucide-react";
import type { AnnouncementContactGroup, AnnouncementRef, MemberInfo } from "@/lib/chat/types";
import { chatApi } from "./api";
import { AnnouncementPicker, DirectoryPicker } from "./Pickers";
import { getChatStore, useChat } from "./store";
import { C } from "./styles";
import { Button, Modal, inputStyle } from "./ui";

export function NewChatModal({
  onClose,
  initialAnnouncement,
}: {
  onClose: () => void;
  initialAnnouncement?: AnnouncementRef | null;
}) {
  const me = useChat((s) => s.me)!;
  // Нийлүүлэгч ажилтнуудын жагсаалт харахгүй: зөвхөн оролцож буй зарлалаараа чатлана
  if (me.actor.type !== "admin") return <SupplierNewChat onClose={onClose} />;
  return <AdminNewChat onClose={onClose} initialAnnouncement={initialAnnouncement} />;
}

/* ════════════════════════════════════════════════════════════════
   Нийлүүлэгч: оролцох зөвшөөрөл авсан зарлал → зарлалыг нийтэлсэн ажилтан
   ════════════════════════════════════════════════════════════════ */
function SupplierNewChat({ onClose }: { onClose: () => void }) {
  const store = getChatStore();
  const [items, setItems] = useState<AnnouncementContactGroup[] | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    chatApi
      .announcementContacts()
      .then((r) => alive && setItems(r.items))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Ачаалж чадсангүй"));
    return () => {
      alive = false;
    };
  }, []);

  const start = async (g: AnnouncementContactGroup, m: AnnouncementContactGroup["contacts"][number]) => {
    const key = `${g.announcement.id}:${m.id}`;
    setBusyKey(key);
    setError(null);
    try {
      if (m.conversationId) {
        store.open(m.conversationId);
      } else {
        await store.createConversation({
          kind: "direct",
          members: [{ type: m.type, id: m.id }],
          announcementId: g.announcement.id,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Чат эхлүүлж чадсангүй");
      setBusyKey(null);
    }
  };

  return (
    <Modal
      title="Шинэ чат"
      onClose={onClose}
      footer={
        <Button variant="ghost" onClick={onClose}>
          Хаах
        </Button>
      }
    >
      <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginBottom: 14 }}>
        Та зөвхөн оролцох зөвшөөрөл авсан зарлалынхаа хүрээнд тухайн зарлалыг нийтэлсэн ажилтантай чатлах боломжтой.
      </div>

      {items === null && !error && (
        <div style={{ display: "flex", justifyContent: "center", padding: 24, color: C.muted }}>
          <Loader2 size={18} className="bc-spin" />
        </div>
      )}

      {items && items.length === 0 && (
        <div
          style={{
            padding: "18px 14px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            color: C.muted,
            fontSize: 13,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          Одоогоор оролцох зөвшөөрөл авсан зарлал алга.
          <br />
          Зарлалд оролцох хүсэлт илгээж, зөвшөөрөгдсөний дараа энд харагдана.
        </div>
      )}

      {items && items.length > 0 && (
        <div style={{ display: "grid", gap: 10, maxHeight: 420, overflowY: "auto" }}>
          {items.map((g) => (
            <div
              key={g.announcement.id}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <FileText size={15} color={C.muted} />
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: C.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {g.announcement.title}
                </div>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {g.contacts.map((m) => {
                  const key = `${g.announcement.id}:${m.id}`;
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{m.name}</div>
                        {m.subtitle && <div style={{ fontSize: 11.5, color: C.faint }}>{m.subtitle}</div>}
                      </div>
                      <Button onClick={() => start(g, m)} loading={busyKey === key} disabled={!!busyKey}>
                        <MessageCircle size={14} />
                        {m.conversationId ? "Нээх" : "Чатлах"}
                      </Button>
                    </div>
                  );
                })}
                {g.groups.map((gr) => (
                  <div key={gr.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: C.text2 }}>
                      <Users size={13} style={{ verticalAlign: -2, marginRight: 6 }} />
                      {gr.title}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        store.open(gr.id);
                        onClose();
                      }}
                    >
                      Нээх
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ marginTop: 12, color: C.red, fontSize: 12.5 }}>{error}</div>}
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════
   Ажилтан: хувийн / групп чат. Нийлүүлэгч сонговол зарлал заавал.
   ════════════════════════════════════════════════════════════════ */
function AdminNewChat({
  onClose,
  initialAnnouncement,
}: {
  onClose: () => void;
  initialAnnouncement?: AnnouncementRef | null;
}) {
  const store = getChatStore();
  const me = useChat((s) => s.me)!;
  const [mode, setMode] = useState<"direct" | "group">(initialAnnouncement && me.canCreateGroup ? "group" : "direct");
  const [selected, setSelected] = useState<MemberInfo[]>([]);
  const [title, setTitle] = useState(initialAnnouncement ? initialAnnouncement.title.slice(0, 120) : "");
  const [ann, setAnn] = useState<AnnouncementRef | null>(initialAnnouncement ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSupplier = selected.some((m) => m.type !== "admin");
  const needsAnnouncement = hasSupplier && me.supplierChatRequiresAnnouncement !== false;
  const showAnnouncementPicker = mode === "group" || hasSupplier;
  const canSubmit =
    (mode === "direct" ? selected.length === 1 : selected.length >= 1) && (!needsAnnouncement || !!ann);

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await store.createConversation({
        kind: mode,
        members: selected.map((m) => ({ type: m.type, id: m.id })),
        title: mode === "group" ? title.trim() || undefined : undefined,
        announcementId: showAnnouncementPicker ? (ann?.id ?? null) : null,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Чат үүсгэж чадсангүй");
      setBusy(false);
    }
  };

  const tab = (id: "direct" | "group", label: string, icon: ReactNode) => (
    <button
      type="button"
      onClick={() => {
        setMode(id);
        if (id === "direct" && selected.length > 1) setSelected(selected.slice(0, 1));
      }}
      aria-pressed={mode === id}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        padding: "9px 10px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        background: mode === id ? C.raised : "transparent",
        color: mode === id ? C.text : C.muted,
      }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <Modal
      title="Шинэ чат"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Болих
          </Button>
          <Button onClick={submit} disabled={!canSubmit} loading={busy}>
            {mode === "direct" ? "Чат эхлүүлэх" : `Групп үүсгэх${selected.length ? ` (${selected.length + 1})` : ""}`}
          </Button>
        </>
      }
    >
      {me.canCreateGroup && (
        <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "rgba(255,255,255,0.04)", marginBottom: 16 }}>
          {tab("direct", "Хувийн чат", <MessageCircle size={15} />)}
          {tab("group", "Групп чат", <Users size={15} />)}
        </div>
      )}

      {mode === "group" && (
        <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>Группийн нэр</span>
            <input
              className="bc-input"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ: Сүлжээний засвар — техникийн хэлэлцүүлэг"
              style={inputStyle}
            />
          </label>
        </div>
      )}

      {showAnnouncementPicker && (
        <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>
            Холбогдох тендер{" "}
            {needsAnnouncement ? (
              <span style={{ color: C.red, fontWeight: 400 }}>(нийлүүлэгчтэй тул заавал)</span>
            ) : (
              <span style={{ color: C.faint, fontWeight: 400 }}>(заавал биш)</span>
            )}
          </span>
          <AnnouncementPicker
            value={ann}
            onChange={(v) => {
              setAnn(v);
              if (v && mode === "group" && !title.trim()) setTitle(v.title.slice(0, 120));
            }}
          />
          {hasSupplier && (
            <div style={{ fontSize: 11.5, color: C.faint }}>
              Зөвхөн тухайн зарлалд оролцох зөвшөөрөл авсан нийлүүлэгчийг нэмэх боломжтой.
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 8 }}>
        {mode === "direct" ? "Хэнтэй чатлах вэ?" : "Гишүүд нэмэх"}
      </div>
      <DirectoryPicker
        multiple={mode === "group"}
        selected={selected}
        onChange={setSelected}
        allowSuppliers={me.canSearchSuppliers}
        autoFocus
      />

      {mode === "group" && hasSupplier && (
        <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: 10, background: C.amberSoft, color: C.amber, fontSize: 12, lineHeight: 1.5 }}>
          Энэ группт нийлүүлэгч байгаа тул бүх гишүүн бие биеийнхээ мессежийг харна. Олон өрсөлдөгч нийлүүлэгчийг нэг группт оруулахдаа
          тендерийн нууцлалыг анхаарна уу.
        </div>
      )}

      {error && <div style={{ marginTop: 12, color: C.red, fontSize: 12.5 }}>{error}</div>}
    </Modal>
  );
}