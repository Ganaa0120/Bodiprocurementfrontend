// components/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Paperclip,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  X,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { API, authH } from "./constants";
import type { AttachedFile } from "./types";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  files?: AttachedFile[];
  onFilesChange?: (files: AttachedFile[]) => void;
  accentColor?: string;
}

async function uploadToServer(
  file: File,
): Promise<{
  url: string;
  name: string;
  size: number;
  type: string;
  isImage: boolean;
}> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/api/announcements/upload-attachment`, {
    method: "POST",
    headers: authH(),
    body: fd,
  });
  const d = await res.json();
  if (!res.ok || !d.success) throw new Error(d.message || "Upload failed");
  return d;
}

const fileIconMap: Record<string, string> = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  xls: "📊",
  xlsx: "📊",
  ppt: "📽️",
  pptx: "📽️",
  zip: "🗜️",
  rar: "🗜️",
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Бичнэ үү...",
  files: externalFiles,
  onFilesChange,
  accentColor = "#8b5cf6",
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [internalFiles, setInternalFiles] = useState<AttachedFile[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const files = externalFiles ?? internalFiles;
  const setFiles = (newFiles: AttachedFile[]) => {
    if (onFilesChange) onFilesChange(newFiles);
    else setInternalFiles(newFiles);
  };

  // Focus detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFocus = (e: FocusEvent) => {
      if (container.contains(e.target as Node)) {
        setIsFocused(true);
      }
    };
    const handleBlur = (e: FocusEvent) => {
      if (!container.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: true, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rich-text-editor",
      },
    },
    immediatelyRender: false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Зургийн хэмжээ 10MB-аас бага байх ёстой");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadToServer(file);
      editor?.chain().focus().setImage({ src: result.url }).run();
    } catch (err: any) {
      alert("Зураг upload хийж чадсангүй: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Файлын хэмжээ 50MB-аас бага байх ёстой");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadToServer(file);
      const newFile: AttachedFile = {
        name: result.name,
        size: result.size,
        type: result.type,
        url: result.url,
        isImage: result.isImage,
      };
      setFiles([...files, newFile]);

      editor
        ?.chain()
        .focus()
        .insertContent(
          `<a href="${result.url}" target="_blank" style="color: ${accentColor}">📎 ${result.name}</a>`,
        )
        .run();
    } catch (err: any) {
      alert("Файл upload хийж чадсангүй: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith("image/")) return "🖼️";
    const ext = type.split("/").pop()?.toLowerCase() || "";
    return fileIconMap[ext] || "📎";
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    disabled,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: isActive ? `${accentColor}20` : "rgba(255,255,255,0.05)",
        border: isActive ? `1px solid ${accentColor}50` : "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "6px 10px",
        cursor: disabled ? "not-allowed" : "pointer",
        color: isActive ? accentColor : "#94a3b8",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          e.currentTarget.style.color = "white";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          e.currentTarget.style.color = "#94a3b8";
        }
      }}
    >
      {children}
    </button>
  );

  if (!editor) {
    return (
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "60px 20px",
          textAlign: "center",
          background: "#1e293b",
        }}
      >
        <Loader2 size={24} style={{ animation: "spin 0.8s linear infinite", color: "#94a3b8" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        border: `1px solid ${isFocused ? accentColor : "rgba(255,255,255,0.12)"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "border-color 0.15s",
        background: "#1e293b",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 4,
          padding: "8px 12px",
          background: "#0f172a",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
        >
          <Underline size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
        >
          <Strikethrough size={14} />
        </ToolbarButton>

        <div
          style={{
            width: 1,
            height: 24,
            background: "rgba(255,255,255,0.12)",
            margin: "0 4px",
          }}
        />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 size={14} />
        </ToolbarButton>

        <div
          style={{
            width: 1,
            height: 24,
            background: "rgba(255,255,255,0.12)",
            margin: "0 4px",
          }}
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered size={14} />
        </ToolbarButton>

        <div
          style={{
            width: 1,
            height: 24,
            background: "rgba(255,255,255,0.12)",
            margin: "0 4px",
          }}
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight size={14} />
        </ToolbarButton>

        <div
          style={{
            width: 1,
            height: 24,
            background: "rgba(255,255,255,0.12)",
            margin: "0 4px",
          }}
        />

        <ToolbarButton
          onClick={() => {
            const url = prompt("Холбоосын URL оруулна уу:", "https://");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          isActive={editor.isActive("link")}
        >
          <LinkIcon size={14} />
        </ToolbarButton>

        <div
          style={{
            width: 1,
            height: 24,
            background: "rgba(255,255,255,0.12)",
            margin: "0 4px",
          }}
        />

        <ToolbarButton
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2
              size={14}
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          ) : (
            <ImageIcon size={14} />
          )}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Paperclip size={14} />
        </ToolbarButton>

        <div
          style={{
            width: 1,
            height: 24,
            background: "rgba(255,255,255,0.12)",
            margin: "0 4px",
          }}
        />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={14} />
        </ToolbarButton>

        <div style={{ flex: 1 }} />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <X size={14} />
          <span style={{ fontSize: 11, marginLeft: 4 }}>Цэвэрлэх</span>
        </ToolbarButton>
      </div>

      {/* Editor - style шууд биш, харин className-аар дамжуулна */}
      <EditorContent editor={editor} />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* Attached files */}
      {files.length > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "#0f172a",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#64748b",
              marginBottom: 10,
            }}
          >
            Хавсаргасан файл ({files.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {files.map((file, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  background: "#1e293b",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: `${accentColor}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {file.isImage ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    getFileIcon(file.type)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#e2e8f0",
                      textDecoration: "none",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = accentColor;
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#e2e8f0";
                      e.currentTarget.style.textDecoration = "none";
                    }}
                  >
                    {file.name}
                  </a>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    cursor: "pointer",
                    color: "#f87171",
                    fontSize: 12,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.color = "#f87171";
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .rich-text-editor {
          outline: none;
          min-height: 180px;
          padding: 14px 16px;
          font-size: 13px;
          line-height: 1.6;
          color: #cbd5e1;
          background: #1e293b;
        }
        .rich-text-editor p {
          margin: 0.5em 0;
          color: #cbd5e1;
        }
        .rich-text-editor h1 {
          font-size: 1.75em;
          font-weight: 700;
          margin: 0.75em 0 0.5em;
          color: white;
        }
        .rich-text-editor h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin: 0.67em 0 0.5em;
          color: white;
        }
        .rich-text-editor h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 0.6em 0 0.4em;
          color: #e2e8f0;
        }
        .rich-text-editor ul, .rich-text-editor ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        .rich-text-editor li {
          margin: 0.25em 0;
          color: #cbd5e1;
        }
        .rich-text-editor a {
          color: ${accentColor};
          text-decoration: underline;
        }
        .rich-text-editor a:hover {
          color: ${accentColor}dd;
        }
        .rich-text-editor img {
          max-width: 100%;
          border-radius: 8px;
          margin: 10px 0;
        }
        .rich-text-editor blockquote {
          border-left: 3px solid ${accentColor};
          margin: 10px 0;
          padding: 8px 16px;
          background: #334155;
          color: #94a3b8;
        }
        .rich-text-editor code {
          background: #334155;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
          color: #e2e8f0;
        }
        .rich-text-editor pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
        }
        .rich-text-editor pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }
        .rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
          pointer-events: none;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}