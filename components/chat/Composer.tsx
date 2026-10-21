"use client";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, Paperclip, Pencil, Reply, SendHorizontal, Smile, X } from "lucide-react";
import type { Attachment, ChatMessage, MeInfo } from "@/lib/chat/types";
import { ALLOWED_FILE_TYPES } from "@/lib/chat/policy";
import { fmtSize, randomId, sameRef } from "./format";
import { getChatStore, useChat } from "./store";
import { C } from "./styles";
import { IconButton, Spinner, menuBox, useClickOutside } from "./ui";
import { uploadChatFile } from "./upload";

const EMOJIS = [
  "😀", "😂", "🙂", "😉", "😍", "🤝", "👍", "👏", "🙏", "💪", "🔥", "✅",
  "❌", "⚠️", "📌", "📎", "📄", "📊", "💰", "🚚", "🏗️", "⏰", "❤️", "😮",
  "😢", "🤔", "👌", "🎉", "👀", "💯", "🙌", "😅",
];

interface PendingFile {
  localId: string;
  file: File;
  previewUrl: string | null;
  status: "uploading" | "done" | "error";
  attachment?: Attachment;
  error?: string;
}

export interface ComposerHandle {
  addFiles: (files: FileList | File[]) => void;
  focus: () => void;
}

export const Composer = forwardRef<
  ComposerHandle,
  {
    convId: string;
    me: MeInfo;
    replyTo: ChatMessage | null;
    editing: ChatMessage | null;
    onCancelReply: () => void;
    onCancelEdit: () => void;
    onSent: () => void;
  }
>(function Composer({ convId, me, replyTo, editing, onCancelReply, onCancelEdit, onSent }, ref) {
  const store = getChatStore();
  const draft = useChat((s) => s.drafts[convId] ?? "");
  const [text, setText] = useState(draft);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const closeEmoji = useCallback(() => setEmojiOpen(false), []);
  const emojiRef = useClickOutside(closeEmoji, emojiOpen);

  // Чат солигдоход draft сэргээх, файлуудыг цэвэрлэх
  useEffect(() => {
    setText(store.getState().drafts[convId] ?? "");
    setFiles((fs) => {
      fs.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      return [];
    });
    setLocalError(null);
  }, [convId, store]);

  useEffect(() => {
    if (editing) {
      setText(editing.body);
      requestAnimationFrame(() => {
        const ta = taRef.current;
        if (ta) {
          ta.focus();
          ta.setSelectionRange(ta.value.length, ta.value.length);
        }
      });
    }
  }, [editing]);

  useEffect(() => {
    if (replyTo) taRef.current?.focus();
  }, [replyTo]);

  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(ta.scrollHeight, 168) + "px";
  }, [text]);

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      setLocalError(null);
      const arr = Array.from(list);
      const room = me.maxAttachments - files.length;
      if (room <= 0) {
        setLocalError(`Нэг мессежэд хамгийн ихдээ ${me.maxAttachments} файл`);
        return;
      }
      const accepted: PendingFile[] = [];
      for (const f of arr.slice(0, room)) {
        if (f.size > me.maxFileBytes) {
          setLocalError(`"${f.name}" ${fmtSize(me.maxFileBytes)}-аас том байна`);
          continue;
        }
        if (!(ALLOWED_FILE_TYPES as readonly string[]).includes(f.type)) {
          setLocalError(`"${f.name}" төрлийн файл хавсаргах боломжгүй`);
          continue;
        }
        accepted.push({
          localId: randomId(),
          file: f,
          previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
          status: "uploading",
        });
      }
      if (arr.length > room) setLocalError(`Зөвхөн эхний ${room} файл нэмэгдлээ`);
      if (!accepted.length) return;
      setFiles((fs) => [...fs, ...accepted]);
      for (const pf of accepted) {
        uploadChatFile(pf.file)
          .then((attachment) =>
            setFiles((fs) => fs.map((x) => (x.localId === pf.localId ? { ...x, status: "done", attachment } : x))),
          )
          .catch((e) =>
            setFiles((fs) =>
              fs.map((x) =>
                x.localId === pf.localId ? { ...x, status: "error", error: e?.message ?? "Байршуулж чадсангүй" } : x,
              ),
            ),
          );
      }
    },
    [files.length, me.maxAttachments, me.maxFileBytes],
  );

  useImperativeHandle(ref, () => ({ addFiles, focus: () => taRef.current?.focus() }), [addFiles]);

  const removeFile = (id: string) =>
    setFiles((fs) => {
      const f = fs.find((x) => x.localId === id);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return fs.filter((x) => x.localId !== id);
    });

  const uploading = files.some((f) => f.status === "uploading");
  const ready = files.filter((f) => f.status === "done").map((f) => f.attachment!);
  const trimmed = text.trim();
  const tooLong = trimmed.length > me.maxMessageLength;
  const canSend = !uploading && !tooLong && (editing ? trimmed.length > 0 || editing.attachments.length > 0 : trimmed.length > 0 || ready.length > 0);

  const submit = () => {
    if (!canSend) return;
    if (editing) {
      if (trimmed !== editing.body) store.edit(editing, trimmed);
      onCancelEdit();
      setText(store.getState().drafts[convId] ?? "");
      return;
    }
    store.send(convId, { body: trimmed, attachments: ready, replyTo });
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setText("");
    setLocalError(null);
    onCancelReply();
    onSent();
  };

  const insertEmoji = (e: string) => {
    const ta = taRef.current;
    if (!ta) return setText((t) => t + e);
    const start = ta.selectionStart ?? text.length;
    const end = ta.selectionEnd ?? text.length;
    const next = text.slice(0, start) + e + text.slice(end);
    setText(next);
    if (!editing) store.setDraft(convId, next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + e.length, start + e.length);
    });
  };

  const bar = editing ? (
    <ContextBar icon={<Pencil size={13} />} title="Мессеж засаж байна" body={editing.body} onClose={() => {
      onCancelEdit();
      setText(store.getState().drafts[convId] ?? "");
    }} />
  ) : replyTo ? (
    <ContextBar
      icon={<Reply size={13} />}
      title={sameRef(replyTo.sender, me.actor) ? "Өөрийн мессежид хариулж байна" : `${replyTo.senderName}-д хариулж байна`}
      body={replyTo.body || (replyTo.attachments.length ? "Хавсралт" : "")}
      onClose={onCancelReply}
    />
  ) : null;

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 12px 12px", background: C.panel }}>
      {bar}

      {files.length > 0 && (
        <div className="bc-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "6px 2px 8px" }}>
          {files.map((f) => (
            <div
              key={f.localId}
              title={f.error ?? f.file.name}
              style={{
                position: "relative",
                flexShrink: 0,
                width: f.previewUrl ? 64 : 180,
                height: 64,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${f.status === "error" ? "rgba(239,68,68,0.5)" : C.border}`,
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {f.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ padding: "0 26px 0 10px", minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.file.name}
                  </div>
                  <div style={{ fontSize: 11, color: f.status === "error" ? C.red : C.faint }}>
                    {f.status === "error" ? "Алдаа" : fmtSize(f.file.size)}
                  </div>
                </div>
              )}
              {f.status === "uploading" && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(10,17,32,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Spinner size={18} />
                </div>
              )}
              {f.status === "error" && f.previewUrl && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(127,29,29,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertCircle size={18} color="#fff" />
                </div>
              )}
              <button
                type="button"
                aria-label="Хасах"
                onClick={() => removeFile(f.localId)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: 99,
                  border: "none",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {(localError || tooLong) && (
        <div style={{ fontSize: 11.5, color: C.red, padding: "2px 4px 6px" }}>
          {tooLong ? `Мессеж ${me.maxMessageLength} тэмдэгтээс хэтэрлээ (${trimmed.length})` : localError}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
        {!editing && (
          <>
            <IconButton label="Файл хавсаргах" onClick={() => fileRef.current?.click()} style={{ color: C.blueText }}>
              <Paperclip size={19} />
            </IconButton>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              accept={(ALLOWED_FILE_TYPES as readonly string[]).join(",")}
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </>
        )}

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 20,
            padding: "4px 4px 4px 14px",
            minWidth: 0,
          }}
        >
          <textarea
            ref={taRef}
            className="bc-input bc-scroll"
            value={text}
            rows={1}
            aria-label="Мессеж бичих"
            placeholder={editing ? "Мессежээ засна уу" : "Мессеж бичих…"}
            onChange={(e) => {
              setText(e.target.value);
              if (!editing) {
                store.setDraft(convId, e.target.value);
                if (e.target.value) store.notifyTyping(convId);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              } else if (e.key === "Escape") {
                if (editing) {
                  onCancelEdit();
                  setText(store.getState().drafts[convId] ?? "");
                } else if (replyTo) onCancelReply();
              }
            }}
            onPaste={(e) => {
              if (editing) return;
              const pasted = Array.from(e.clipboardData.files);
              if (pasted.length) {
                e.preventDefault();
                addFiles(pasted);
              }
            }}
            style={{
              flex: 1,
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              color: C.text,
              fontSize: 14,
              lineHeight: "20px",
              padding: "6px 0",
              maxHeight: 168,
              fontFamily: "inherit",
              minWidth: 0,
            }}
          />
          <div ref={emojiRef} style={{ position: "relative" }}>
            <IconButton label="Emoji" onClick={() => setEmojiOpen((o) => !o)} size={32} active={emojiOpen}>
              <Smile size={18} />
            </IconButton>
            {emojiOpen && (
              <div
                style={{
                  ...menuBox,
                  bottom: "calc(100% + 8px)",
                  right: 0,
                  width: 284,
                  display: "grid",
                  gridTemplateColumns: "repeat(8, 1fr)",
                  gap: 2,
                  padding: 8,
                }}
              >
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => insertEmoji(e)}
                    aria-label={e}
                    className="bc-menu-item"
                    style={{ height: 32, fontSize: 19, border: "none", borderRadius: 8, background: "transparent", cursor: "pointer" }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <IconButton
          label={editing ? "Хадгалах" : "Илгээх"}
          onClick={submit}
          disabled={!canSend}
          size={38}
          style={{ color: canSend ? C.blueText : C.faint }}
        >
          {uploading ? <Spinner size={18} /> : <SendHorizontal size={20} />}
        </IconButton>
      </div>
    </div>
  );
});

function ContextBar({
  icon,
  title,
  body,
  onClose,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 4px 8px" }}>
      <div style={{ color: C.blueText, display: "flex" }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {body}
        </div>
      </div>
      <IconButton label="Болих" onClick={onClose} size={28}>
        <X size={15} />
      </IconButton>
    </div>
  );
}
