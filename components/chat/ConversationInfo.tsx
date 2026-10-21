"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BellOff,
  ChevronDown,
  Crown,
  Download,
  FileText,
  LogOut,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import type { AnnouncementRef, FileItem, MemberInfo, Participant } from "@/lib/chat/types";
import { chatApi } from "./api";
import { Avatar, ConvAvatar } from "./Avatar";
import { fmtLastSeen, fmtListTime, fmtSize, refKey, sameRef } from "./format";
import { AnnouncementPicker, DirectoryPicker } from "./Pickers";
import { getChatStore, useChat } from "./store";
import { C } from "./styles";
import { Button, IconButton, MenuItem, Modal, Spinner, inputStyle, menuBox, useClickOutside } from "./ui";

const MUTE_OPTIONS: { label: string; ms: number | null }[] = [
  { label: "1 цаг", ms: 3600_000 },
  { label: "8 цаг", ms: 8 * 3600_000 },
  { label: "24 цаг", ms: 24 * 3600_000 },
  { label: "Нэг долоо хоног", ms: 7 * 24 * 3600_000 },
  { label: "Дахин асаах хүртэл", ms: null },
];
const FOREVER = "2999-12-31T00:00:00.000Z";

export function ConversationInfo({ convId, onClose }: { convId: string; onClose: () => void }) {
  const store = getChatStore();
  const me = useChat((s) => s.me)!;
  const conv = useChat((s) => s.convs[convId]);
  const [files, setFiles] = useState<FileItem[] | null>(null);
  const [filesOpen, setFilesOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [annOpen, setAnnOpen] = useState(false);
  const [muteOpen, setMuteOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "leave" | "delete">(null);
  const [busy, setBusy] = useState(false);

  const closeMute = useCallback(() => setMuteOpen(false), []);
  const muteRef = useClickOutside(closeMute, muteOpen);

  useEffect(() => {
    setFiles(null);
    setFilesOpen(false);
    setEditingTitle(false);
  }, [convId]);

  useEffect(() => {
    if (!filesOpen || files) return;
    chatApi
      .files(convId)
      .then((r) => setFiles(r.files))
      .catch(() => setFiles([]));
  }, [filesOpen, files, convId]);

  if (!conv) return null;
  const meRef = { type: me.actor.type, id: me.actor.id };
  const muted = !!conv.mutedUntil && new Date(conv.mutedUntil).getTime() > Date.now();
  const isGroup = conv.kind === "group";
  const isOwner = conv.myRole === "owner";
  const other = conv.kind === "direct" ? conv.members.find((m) => !sameRef(m, meRef)) : null;

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      store.showToast(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setBusy(false);
    }
  };

  const saveTitle = () =>
    run(async () => {
      await store.updateConversation(convId, { title: title.trim() || null });
      setEditingTitle(false);
    });

  const images = (files ?? []).filter((f) => f.attachment.isImage);
  const docs = (files ?? []).filter((f) => !f.attachment.isImage);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: C.panel }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 12px 0" }}>
        <div style={{ flex: 1 }} />
        <IconButton label="Хаах" onClick={onClose}>
          <X size={17} />
        </IconButton>
      </div>

      <div className="bc-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 20px" }}>
        <div style={{ textAlign: "center", padding: "4px 0 18px" }}>
          <div style={{ display: "inline-block" }}>
            <ConvAvatar conv={conv} me={meRef} size={76} />
          </div>
          {editingTitle ? (
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <input
                className="bc-input"
                autoFocus
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") setEditingTitle(false);
                }}
                placeholder="Группийн нэр"
                style={inputStyle}
              />
              <Button onClick={saveTitle} loading={busy} style={{ padding: "8px 12px" }}>
                Хадгалах
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{conv.title}</div>
              {conv.canManage && (
                <IconButton
                  label="Нэр өөрчлөх"
                  size={28}
                  onClick={() => {
                    setTitle(conv.customTitle ?? "");
                    setEditingTitle(true);
                  }}
                >
                  <Pencil size={14} />
                </IconButton>
              )}
            </div>
          )}
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>
            {other ? fmtLastSeen(other.lastSeenAt, other.online) || other.subtitle : `${conv.members.length} гишүүн`}
          </div>
        </div>

        {conv.isMember && (
          <div ref={muteRef} style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <Button
              variant="ghost"
              onClick={() => (muted ? run(() => store.setMute(convId, null)) : setMuteOpen((o) => !o))}
              style={{ gap: 7 }}
            >
              {muted ? <Bell size={15} /> : <BellOff size={15} />}
              {muted ? "Мэдэгдэл асаах" : "Дуугүй болгох"}
            </Button>
            {muteOpen && (
              <div style={{ ...menuBox, top: "calc(100% + 6px)" }}>
                {MUTE_OPTIONS.map((o) => (
                  <MenuItem
                    key={o.label}
                    onClick={() => {
                      setMuteOpen(false);
                      run(() => store.setMute(convId, o.ms ? new Date(Date.now() + o.ms).toISOString() : FOREVER));
                    }}
                  >
                    {o.label}
                  </MenuItem>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Тендер */}
        {(conv.announcement || conv.canManage) && (
          <Section title="Холбогдох тендер">
            {annOpen ? (
              <AnnouncementPicker
                value={null}
                onChange={(v: AnnouncementRef | null) => {
                  setAnnOpen(false);
                  if (v) run(() => store.updateConversation(convId, { announcementId: v.id }));
                }}
              />
            ) : conv.announcement ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 10, background: C.amberSoft, color: C.amber }}>
                <FileText size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conv.announcement.title}
                </span>
                {conv.canManage && (
                  <>
                    <IconButton label="Өөр тендертэй холбох" size={26} onClick={() => setAnnOpen(true)} style={{ color: C.amber }}>
                      <Pencil size={13} />
                    </IconButton>
                    <IconButton
                      label="Холбоос салгах"
                      size={26}
                      onClick={() => run(() => store.updateConversation(convId, { announcementId: null }))}
                      style={{ color: C.amber }}
                    >
                      <X size={14} />
                    </IconButton>
                  </>
                )}
              </div>
            ) : (
              <Button variant="ghost" onClick={() => setAnnOpen(true)} style={{ width: "100%" }}>
                <FileText size={14} /> Тендертэй холбох
              </Button>
            )}
          </Section>
        )}

        {/* Гишүүд */}
        {isGroup && (
          <Section title={`Гишүүд (${conv.members.length})`}>
            {conv.canManage && (
              <button
                type="button"
                className="bc-pick"
                onClick={() => setAddOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  width: "100%",
                  padding: "8px 6px",
                  border: "none",
                  borderRadius: 10,
                  background: "transparent",
                  color: C.blueText,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <span style={{ width: 36, height: 36, borderRadius: 99, background: C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserPlus size={17} />
                </span>
                Гишүүн нэмэх
              </button>
            )}
            {conv.members.map((m) => (
              <MemberRow
                key={refKey(m)}
                m={m}
                isMe={sameRef(m, meRef)}
                canManage={conv.canManage}
                canChangeRole={(isOwner || me.isSuperAdmin) && m.role !== "owner"}
                onRemove={() => run(() => store.removeMember(convId, m))}
                onRole={(role) => run(() => store.setRole(convId, m, role))}
              />
            ))}
          </Section>
        )}

        {/* Файл, зураг */}
        <Section
          title="Зураг ба файл"
          collapsible
          open={filesOpen}
          onToggle={() => setFilesOpen((o) => !o)}
        >
          {filesOpen && !files && (
            <div style={{ display: "flex", justifyContent: "center", padding: 14 }}>
              <Spinner size={16} />
            </div>
          )}
          {filesOpen && files && files.length === 0 && (
            <div style={{ fontSize: 12.5, color: C.muted, padding: "6px 2px" }}>Хуваалцсан файл алга</div>
          )}
          {filesOpen && images.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginBottom: 10 }}>
              {images.slice(0, 24).map((f, i) => (
                <a key={i} href={f.attachment.url} target="_blank" rel="noopener noreferrer" title={f.attachment.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.attachment.url}
                    alt={f.attachment.name}
                    loading="lazy"
                    style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, display: "block", background: "rgba(255,255,255,0.04)" }}
                  />
                </a>
              ))}
            </div>
          )}
          {filesOpen &&
            docs.map((f, i) => (
              <a
                key={i}
                href={f.attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                download={f.attachment.name}
                className="bc-pick"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderRadius: 10, textDecoration: "none", color: C.text }}
              >
                <FileText size={18} style={{ color: C.blueText, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.attachment.name}
                  </span>
                  <span style={{ fontSize: 11, color: C.faint }}>
                    {fmtSize(f.attachment.size)} · {f.senderName} · {fmtListTime(f.createdAt)}
                  </span>
                </span>
                <Download size={14} style={{ color: C.faint, flexShrink: 0 }} />
              </a>
            ))}
        </Section>

        {/* Үйлдлүүд */}
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {isGroup && conv.isMember && (
            <Button variant="ghost" onClick={() => setConfirm("leave")} style={{ justifyContent: "flex-start", color: C.red }}>
              <LogOut size={15} /> Группээс гарах
            </Button>
          )}
          {me.isSuperAdmin && (
            <Button variant="danger" onClick={() => setConfirm("delete")} style={{ justifyContent: "flex-start" }}>
              <Trash2 size={15} /> Чатыг устгах
            </Button>
          )}
        </div>
      </div>

      {addOpen && (
        <AddMembersModal
          exclude={conv.members}
          allowSuppliers={me.canSearchSuppliers}
          onClose={() => setAddOpen(false)}
          onAdd={async (list) => {
            await store.addMembers(convId, list.map((m) => ({ type: m.type, id: m.id })));
            setAddOpen(false);
          }}
        />
      )}

      {confirm === "leave" && (
        <Modal
          title="Группээс гарах уу?"
          width={420}
          onClose={() => setConfirm(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirm(null)}>
                Болих
              </Button>
              <Button variant="danger" loading={busy} onClick={() => run(() => store.removeMember(convId, meRef))}>
                Гарах
              </Button>
            </>
          }
        >
          <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
            Гарсны дараа энэ группийн мессежийг харах, бичих боломжгүй болно. Дахин орохын тулд группийн админ таныг нэмэх шаардлагатай.
          </div>
        </Modal>
      )}

      {confirm === "delete" && <DeleteModal convTitle={conv.title} onClose={() => setConfirm(null)} onDelete={(hard) => store.deleteConversation(convId, hard)} />}
    </div>
  );
}

function Section({
  title,
  children,
  collapsible,
  open = true,
  onToggle,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      {collapsible ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "6px 2px",
            border: "none",
            background: "none",
            color: C.text2,
            fontSize: 13,
            fontWeight: 650,
            cursor: "pointer",
          }}
        >
          <span style={{ flex: 1, textAlign: "left" }}>{title}</span>
          <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
        </button>
      ) : (
        <div style={{ fontSize: 13, fontWeight: 650, color: C.text2, padding: "6px 2px" }}>{title}</div>
      )}
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
}

function MemberRow({
  m,
  isMe,
  canManage,
  canChangeRole,
  onRemove,
  onRole,
}: {
  m: Participant;
  isMe: boolean;
  canManage: boolean;
  canChangeRole: boolean;
  onRemove: () => void;
  onRole: (r: "admin" | "member") => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside(close, open);
  const showMenu = !isMe && (canManage || canChangeRole) && m.role !== "owner";
  const roleText = m.role === "owner" ? "Эзэн" : m.role === "admin" ? "Группийн админ" : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "7px 6px" }}>
      <Avatar name={m.name} type={m.type} id={m.id} src={m.avatarUrl} size={36} online={m.online} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {m.name}
            {isMe && <span style={{ color: C.faint, fontWeight: 400 }}> (та)</span>}
          </span>
          {m.role === "owner" && <Crown size={12} style={{ color: C.amber, flexShrink: 0 }} />}
          {m.role === "admin" && <ShieldCheck size={12} style={{ color: C.blueText, flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: 11.5, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {[roleText, m.subtitle].filter(Boolean).join(" · ")}
        </div>
      </div>
      {showMenu && (
        <div ref={ref} style={{ position: "relative" }}>
          <IconButton label="Гишүүний үйлдэл" size={30} onClick={() => setOpen((o) => !o)}>
            <MoreHorizontal size={16} />
          </IconButton>
          {open && (
            <div style={{ ...menuBox, right: 0, top: "calc(100% + 4px)" }}>
              {canChangeRole && m.type === "admin" && (
                <MenuItem
                  icon={<ShieldCheck size={14} />}
                  onClick={() => {
                    close();
                    onRole(m.role === "admin" ? "member" : "admin");
                  }}
                >
                  {m.role === "admin" ? "Энгийн гишүүн болгох" : "Группийн админ болгох"}
                </MenuItem>
              )}
              {canManage && (
                <MenuItem
                  danger
                  icon={<UserMinus size={14} />}
                  onClick={() => {
                    close();
                    onRemove();
                  }}
                >
                  Группээс хасах
                </MenuItem>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddMembersModal({
  exclude,
  allowSuppliers,
  onClose,
  onAdd,
}: {
  exclude: Participant[];
  allowSuppliers: boolean;
  onClose: () => void;
  onAdd: (list: MemberInfo[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<MemberInfo[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSupplier = selected.some((m) => m.type !== "admin");

  return (
    <Modal
      title="Гишүүн нэмэх"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Болих
          </Button>
          <Button
            disabled={!selected.length}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await onAdd(selected);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Нэмж чадсангүй");
                setBusy(false);
              }
            }}
          >
            Нэмэх{selected.length ? ` (${selected.length})` : ""}
          </Button>
        </>
      }
    >
      <DirectoryPicker multiple selected={selected} onChange={setSelected} exclude={exclude} allowSuppliers={allowSuppliers} autoFocus />
      {hasSupplier && (
        <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: 10, background: C.blueSoft, color: C.blueText, fontSize: 12, lineHeight: 1.5 }}>
          Шинээр нэмэгдсэн нийлүүлэгч зөвхөн нэмэгдсэнээс хойших мессежийг харна. Өмнөх дотоод яриа нууц хэвээр үлдэнэ.
        </div>
      )}
      {error && <div style={{ marginTop: 12, color: C.red, fontSize: 12.5 }}>{error}</div>}
    </Modal>
  );
}

function DeleteModal({
  convTitle,
  onClose,
  onDelete,
}: {
  convTitle: string;
  onClose: () => void;
  onDelete: (hard: boolean) => Promise<void>;
}) {
  const [hard, setHard] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ok = !hard || confirmText.trim() === "УСТГАХ";

  return (
    <Modal
      title="Чатыг устгах"
      width={460}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Болих
          </Button>
          <Button
            variant="danger"
            disabled={!ok}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await onDelete(hard);
                onClose();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Устгаж чадсангүй");
                setBusy(false);
              }
            }}
          >
            {hard ? "Бүрмөсөн устгах" : "Устгах"}
          </Button>
        </>
      }
    >
      <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>
        <b style={{ color: C.text }}>“{convTitle}”</b> чат бүх гишүүнээс шууд алга болно.
      </div>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 14, fontSize: 13, color: C.text2, cursor: "pointer", lineHeight: 1.5 }}>
        <input type="checkbox" checked={hard} onChange={(e) => setHard(e.target.checked)} style={{ marginTop: 3 }} />
        <span>
          Бүрмөсөн устгах — мессеж, хавсаргасан файлууд серверээс арилж <b>сэргээх боломжгүй</b>. Сонгохгүй бол хяналтын зорилгоор
          өгөгдлийн санд нуугдмал хадгалагдана.
        </span>
      </label>
      {hard && (
        <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 12, color: C.muted }}>Баталгаажуулахын тулд УСТГАХ гэж бичнэ үү</span>
          <input className="bc-input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} style={inputStyle} />
        </label>
      )}
      {error && <div style={{ marginTop: 12, color: C.red, fontSize: 12.5 }}>{error}</div>}
    </Modal>
  );
}
