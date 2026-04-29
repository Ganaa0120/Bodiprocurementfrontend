"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Image as ImgIcon, Paperclip } from "lucide-react";
import type { AttachedFile } from "./types";

// ── Paste sanitizer ─────────────────────────────────────────────
// Whitelist of tags allowed in editor; everything else gets unwrapped.
const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "DIV",
  "SPAN",
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "S",
  "STRIKE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "A",
  "IMG",
  "BLOCKQUOTE",
]);

// Per-tag attribute allowlist
const ALLOWED_ATTRS: Record<string, string[]> = {
  A: ["href", "target", "rel"],
  IMG: ["src", "alt"],
};

// Word/Docs/web-ээс ирсэн HTML-ийг цэвэрлэнэ
function sanitizeHtml(rawHtml: string): string {
  // DOMParser ашиглаж inert document үүсгэнэ — img.onload, script гүйхгүй
  const doc = new DOMParser().parseFromString(rawHtml, "text/html");
  const tmp = doc.body;

  // Бүхэлд нь хасах ёстой tags
  tmp
    .querySelectorAll(
      "style, meta, link, script, title, head, iframe, object, embed, form, input, button, textarea, select",
    )
    .forEach((n) => n.remove());

  // HTML comments хасах
  const walker = doc.createTreeWalker(tmp, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode as Comment);
  comments.forEach((c) => c.remove());

  // Recursive cleaner — children-ийг урьдчилж цэвэрлээд дараа нь parent
  const clean = (node: Element) => {
    const childrenSnapshot = Array.from(node.children);
    childrenSnapshot.forEach((c) => clean(c));

    const tag = node.tagName;

    // Зөвшөөрөгдөөгүй tag → unwrap (зөвхөн агуулга нь үлдэнэ)
    if (!ALLOWED_TAGS.has(tag)) {
      const parent = node.parentNode;
      if (parent) {
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
      }
      return;
    }

    // Зөвшөөрөгдсөн tag-ийн бүх attribute-ыг хасах
    // (зөвхөн whitelist-д байгааг үлдээнэ)
    const allowed = ALLOWED_ATTRS[tag] || [];
    Array.from(node.attributes).forEach((attr) => {
      if (!allowed.includes(attr.name.toLowerCase())) {
        node.removeAttribute(attr.name);
      }
    });

    // <a href=javascript:...> аюулгүйн шалгалт
    if (tag === "A") {
      const href = (node.getAttribute("href") || "").trim();
      if (/^\s*javascript:/i.test(href) || /^\s*data:/i.test(href)) {
        node.removeAttribute("href");
      }
      // External links target="_blank" + rel="noreferrer"
      if (node.getAttribute("href")) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noreferrer noopener");
      }
    }

    // <img> зөвхөн http(s)/data:image зөвшөөрнө
    if (tag === "IMG") {
      const src = (node.getAttribute("src") || "").trim();
      if (!/^(https?:|data:image\/)/i.test(src)) {
        node.remove();
      }
    }
  };

  Array.from(tmp.children).forEach((c) => clean(c as Element));

  // Editor-ийн өөрийн style-уудыг img дээр буцааж тавих
  tmp.querySelectorAll("img").forEach((img) => {
    img.setAttribute(
      "style",
      "max-width:100%;border-radius:8px;margin:6px 0;display:block;",
    );
  });

  // Хоосон wrapper цэвэрлэх
  return tmp.innerHTML
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>")
    .replace(/<(p|div)>\s*<\/\1>/gi, "")
    .trim();
}

// Selection дээр HTML оруулах (execCommand("insertHTML")-ийн орлуулагч)
function insertHtmlAtCursor(html: string) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const frag = range.createContextualFragment(html);
  const last = frag.lastChild;
  range.insertNode(frag);
  if (last) {
    const r = document.createRange();
    r.setStartAfter(last);
    r.setEndAfter(last);
    sel.removeAllRanges();
    sel.addRange(r);
  }
}

const divider = (
  <span
    style={{
      width: 1,
      height: 18,
      background: "rgba(255,255,255,0.08)",
      margin: "0 2px",
    }}
  />
);

export function RichEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const edRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const fRef = useRef<HTMLInputElement>(null);
  const initialValue = useRef(value);
  const [focused, setFocused] = useState(false);
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [, tick] = useState(0);

  // initial value-ийг нэг л удаа оруулна
  useEffect(() => {
    if (edRef.current) edRef.current.innerHTML = initialValue.current || "";
  }, []);

  // Toolbar active state-ийг автоматаар синк хийнэ (Ctrl+B гэх мэт keyboard
  // shortcut эсвэл cursor хөдлөхөд button highlight шинэчлэгдэнэ)
  useEffect(() => {
    const handler = () => {
      const ed = edRef.current;
      if (!ed) return;
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode) return;
      let n: Node | null = sel.anchorNode;
      while (n && n !== ed) n = n.parentNode;
      if (n === ed) tick((x) => x + 1);
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  const sync = useCallback(() => {
    if (edRef.current) onChange(edRef.current.innerHTML);
  }, [onChange]);

  const ex = useCallback(
    (cmd: string, v?: string) => {
      document.execCommand(cmd, false, v);
      edRef.current?.focus();
      sync();
    },
    [sync],
  );

  const on = (cmd: string) => {
    try {
      return document.queryCommandState(cmd);
    } catch {
      return false;
    }
  };

  const bs = (a: boolean): React.CSSProperties => ({
    background: a ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
    border: a
      ? "1px solid rgba(59,130,246,0.4)"
      : "1px solid rgba(255,255,255,0.07)",
    borderRadius: 6,
    padding: "4px 8px",
    cursor: "pointer",
    color: a ? "#60a5fa" : "rgba(148,163,184,0.7)",
    fontSize: 12,
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
  });

  const insertImageBlob = useCallback(
    (blob: Blob) => {
      if (blob.size > 5 * 1024 * 1024) {
        alert("Зургийн хэмжээ 5MB-ээс хэтэрсэн байна");
        return;
      }
      const r = new FileReader();
      r.onload = () => {
        edRef.current?.focus();
        insertHtmlAtCursor(
          `<img src="${r.result}" style="max-width:100%;border-radius:8px;margin:6px 0;display:block;"/>`,
        );
        sync();
      };
      r.readAsDataURL(blob);
    },
    [sync],
  );

  const addImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((f) => insertImageBlob(f));
    e.target.value = "";
  };

  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((f) =>
      setFiles((p) => [
        ...p,
        {
          name: f.name,
          size: f.size,
          type: f.type,
          url: URL.createObjectURL(f),
          isImage: f.type.startsWith("image/"),
        },
      ]),
    );
    e.target.value = "";
  };

  // ── Paste handler — main fix ───────────────────────────────
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cd = e.clipboardData;
    if (!cd) return;

    // 1) Image paste
    for (const item of Array.from(cd.items)) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) insertImageBlob(blob);
        return;
      }
    }

    // 2) HTML paste — sanitize
    const html = cd.getData("text/html");
    if (html) {
      const cleaned = sanitizeHtml(html);
      edRef.current?.focus();
      insertHtmlAtCursor(cleaned);
      sync();
      return;
    }

    // 3) Plain text — escape + line breaks
    const text = cd.getData("text/plain");
    if (text) {
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .split(/\r?\n/)
        .map((line) => line || "&nbsp;")
        .join("<br>");
      edRef.current?.focus();
      insertHtmlAtCursor(escaped);
      sync();
    }
  };

  // ── Drag & drop image / file ───────────────────────────────
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer?.files?.length) return;
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach((f) => {
      if (f.type.startsWith("image/")) insertImageBlob(f);
      else
        setFiles((p) => [
          ...p,
          {
            name: f.name,
            size: f.size,
            type: f.type,
            url: URL.createObjectURL(f),
            isImage: false,
          },
        ]);
    });
  };

  const fmt = (b: number) =>
    b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
  const fileIcon = (t: string) =>
    t.includes("pdf")
      ? "📄"
      : t.includes("word")
        ? "📝"
        : t.includes("sheet") || t.includes("excel")
          ? "📊"
          : "📎";

  return (
    <div
      style={{
        border: focused
          ? "1px solid rgba(59,130,246,0.4)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        overflow: "hidden",
        transition: "border-color .2s",
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          padding: "6px 10px",
          flexWrap: "wrap",
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {(
          [
            ["bold", "B", { fontWeight: 700 }],
            ["italic", "I", { fontStyle: "italic" }],
            ["underline", "U", { textDecoration: "underline" }],
            ["strikeThrough", "S", { textDecoration: "line-through" }],
          ] as [string, string, React.CSSProperties][]
        ).map(([cmd, ic, st]) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              ex(cmd);
            }}
            style={{ ...bs(on(cmd)), minWidth: 27 }}
          >
            <span style={st}>{ic}</span>
          </button>
        ))}
        {divider}
        {["H1", "H2", "H3"].map((h, i) => (
          <button
            key={h}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              ex("formatBlock", `<h${i + 1}>`);
            }}
            style={{
              ...bs(false),
              minWidth: 27,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {h}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            ex("formatBlock", "<p>");
          }}
          style={{ ...bs(false), minWidth: 27, fontSize: 10, fontWeight: 700 }}
        >
          P
        </button>
        {divider}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            ex("insertUnorderedList");
          }}
          style={{ ...bs(on("insertUnorderedList")), minWidth: 27 }}
        >
          •≡
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            ex("insertOrderedList");
          }}
          style={{ ...bs(on("insertOrderedList")), minWidth: 27 }}
        >
          1≡
        </button>
        {divider}
        {(
          [
            ["◀", "justifyLeft"],
            ["▬", "justifyCenter"],
            ["▶", "justifyRight"],
          ] as [string, string][]
        ).map(([ic, cmd]) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              ex(cmd);
            }}
            style={{ ...bs(on(cmd)), minWidth: 26, fontSize: 11 }}
          >
            {ic}
          </button>
        ))}
        {divider}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("URL:", "https://");
            if (url) ex("createLink", url);
          }}
          style={{ ...bs(false), padding: "4px 9px", gap: 4 }}
        >
          🔗 <span style={{ fontSize: 11 }}>Холбоос</span>
        </button>
        {divider}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            imgRef.current?.click();
          }}
          style={{
            ...bs(false),
            padding: "4px 9px",
            gap: 4,
            color: "rgba(52,211,153,0.85)",
          }}
        >
          <ImgIcon size={12} />
          <span style={{ fontSize: 11 }}>Зураг</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            fRef.current?.click();
          }}
          style={{
            ...bs(false),
            padding: "4px 9px",
            gap: 4,
            color: "rgba(96,165,250,0.85)",
          }}
        >
          <Paperclip size={12} />
          <span style={{ fontSize: 11 }}>Файл</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            // Бүх formatting (font, color, background, size) арилгах
            ex("removeFormat");
            // Block-level (headings, lists)-ийг ч ердийн paragraph болгох
            document.execCommand("formatBlock", false, "<p>");
            sync();
          }}
          style={{
            ...bs(false),
            padding: "4px 9px",
            marginLeft: "auto",
            color: "rgba(239,68,68,0.6)",
            fontSize: 11,
          }}
        >
          ✕ Арилгах
        </button>
      </div>

      <input
        ref={imgRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={addImg}
      />
      <input
        ref={fRef}
        type="file"
        accept="*/*"
        multiple
        style={{ display: "none" }}
        onChange={addFile}
      />

      {/* ── Editor body ── */}
      <div
        ref={edRef}
        contentEditable
        suppressContentEditableWarning
        className="rich-ed"
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          sync();
        }}
        onInput={sync}
        onPaste={handlePaste}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            insertHtmlAtCursor("&nbsp;&nbsp;&nbsp;&nbsp;");
            sync();
          }
        }}
        data-placeholder={placeholder}
        style={{
          minHeight: 160,
          padding: "14px 16px",
          fontSize: 13,
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.75,
          outline: "none",
          background: "rgba(255,255,255,0.03)",
          fontFamily: "inherit",
        }}
      />

      {/* ── Attached files ── */}
      {files.length > 0 && (
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.015)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "rgba(148,163,184,0.35)",
            }}
          >
            Хавсаргасан файл ({files.length})
          </span>
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 10px",
                borderRadius: 9,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {f.isImage ? (
                <img
                  src={f.url}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    flexShrink: 0,
                    background: "rgba(59,130,246,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {fileIcon(f.type)}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.8)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.name}
                </div>
                <div style={{ fontSize: 10, color: "rgba(148,163,184,0.4)" }}>
                  {fmt(f.size)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.18)",
                  borderRadius: 6,
                  padding: "4px 7px",
                  cursor: "pointer",
                  color: "rgba(239,68,68,0.7)",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fRef.current?.click()}
            style={{
              border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "7px",
              background: "none",
              cursor: "pointer",
              color: "rgba(148,163,184,0.4)",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          >
            + Файл нэмэх
          </button>
        </div>
      )}

      {/* ── Editor styles — ХАМГИЙН ЧУХАЛ: !important-аар хүчний background-уудыг override хийнэ ── */}
      <style>{`
        .rich-ed:empty:before{content:attr(data-placeholder);color:rgba(148,163,184,0.3);pointer-events:none}

        /* Бүх дотоод элементийн background-ыг хүчээр transparent болгож, өнгийг editor-ийн өнгөнд тааруулна.
           Энэ нь paste sanitizer дамжсан ч эсвэл хуучин content дотор үлдсэн байсан ч ажиллана. */
        .rich-ed *{background:transparent !important;background-color:transparent !important;
          font-family:inherit !important;}
        .rich-ed *:not(a):not(strong):not(b):not(em):not(i):not(u){
          color:inherit !important;
        }

        .rich-ed h1{font-size:20px;font-weight:700;margin:10px 0 4px;color:rgba(255,255,255,0.92) !important;line-height:1.3}
        .rich-ed h2{font-size:16px;font-weight:700;margin:8px 0 4px;color:rgba(255,255,255,0.87) !important;line-height:1.3}
        .rich-ed h3{font-size:14px;font-weight:600;margin:6px 0 3px;color:rgba(255,255,255,0.82) !important}
        .rich-ed ul{padding-left:22px;margin:6px 0;list-style:disc}
        .rich-ed ol{padding-left:22px;margin:6px 0;list-style:decimal}
        .rich-ed li{margin:3px 0;color:rgba(255,255,255,0.82) !important}
        .rich-ed a{color:#60a5fa !important;text-decoration:underline}
        .rich-ed strong,.rich-ed b{font-weight:700}
        .rich-ed em,.rich-ed i{font-style:italic}
        .rich-ed p{margin:4px 0;color:rgba(255,255,255,0.85) !important}
        .rich-ed div{color:rgba(255,255,255,0.85) !important}
        .rich-ed span{color:inherit !important}
        .rich-ed img{max-width:100%;border-radius:8px;margin:6px 0;display:block}
        .rich-ed blockquote{border-left:3px solid rgba(59,130,246,.5);margin:6px 0;padding:4px 12px;color:rgba(148,163,184,.7) !important}
      `}</style>
    </div>
  );
}
