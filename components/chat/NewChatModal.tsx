"use client";
import { useState, type ReactNode } from "react";
import { MessageCircle, Users } from "lucide-react";
import type { AnnouncementRef, MemberInfo } from "@/lib/chat/types";
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
  const store = getChatStore();
  const me = useChat((s) => s.me)!;
  const [mode, setMode] = useState<"direct" | "group">(initialAnnouncement && me.canCreateGroup ? "group" : "direct");
  const [selected, setSelected] = useState<MemberInfo[]>([]);
  const [title, setTitle] = useState(initialAnnouncement ? initialAnnouncement.title.slice(0, 120) : "");
  const [ann, setAnn] = useState<AnnouncementRef | null>(initialAnnouncement ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = mode === "direct" ? selected.length === 1 : selected.length >= 1;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await store.createConversation({
        kind: mode,
        members: selected.map((m) => ({ type: m.type, id: m.id })),
        title: mode === "group" ? title.trim() || undefined : undefined,
        announcementId: mode === "group" ? (ann?.id ?? null) : null,
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
          <div style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>
              Холбогдох тендер <span style={{ color: C.faint, fontWeight: 400 }}>(заавал биш)</span>
            </span>
            <AnnouncementPicker
              value={ann}
              onChange={(v) => {
                setAnn(v);
                if (v && !title.trim()) setTitle(v.title.slice(0, 120));
              }}
            />
          </div>
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

      {mode === "group" && selected.some((m) => m.type !== "admin") && (
        <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: 10, background: C.amberSoft, color: C.amber, fontSize: 12, lineHeight: 1.5 }}>
          Энэ группт нийлүүлэгч байгаа тул бүх гишүүн бие биеийнхээ мессежийг харна. Олон өрсөлдөгч нийлүүлэгчийг нэг группт оруулахдаа
          тендерийн нууцлалыг анхаарна уу.
        </div>
      )}

      {error && <div style={{ marginTop: 12, color: C.red, fontSize: 12.5 }}>{error}</div>}
    </Modal>
  );
}
