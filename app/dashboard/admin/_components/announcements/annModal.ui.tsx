"use client";
// ════════════════════════════════════════════════════════════════
//  AnnModal — дахин ашиглагдах UI primitives
//  RichTextEditor (dynamic), Section, Field, FilePicker
// ════════════════════════════════════════════════════════════════
import { useState, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { Upload, Loader2, Paperclip, X, AlertCircle } from "lucide-react";
import { API, authH, lbl } from "./constants";
import type { AttachedFile } from "./types";

// ── RichTextEditor — SSR унтрааж dynamic load (нэг л газар тодорхойлно) ──
export const RichTextEditor = dynamic(
  () => import("./RichEditor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "40px 20px",
          textAlign: "center",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <Loader2
          size={20}
          style={{ animation: "spin 0.8s linear infinite", color: "#94a3b8" }}
        />
      </div>
    ),
  },
);

// ── Section: дэд хэсгийн картын wrapper ──
export function Section({
  title,
  icon: Icon,
  accentColor,
  children,
}: {
  title: string;
  icon: any;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#334155",
        borderRadius: 14,
        padding: "14px 16px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          color: accentColor,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
          letterSpacing: "0.05em",
        }}
      >
        <Icon size={12} /> {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

// ── Field: input-ийн labelтай wrapper ──
export function Field({
  label: labelText,
  required,
  icon: Icon,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  icon?: any;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          ...lbl,
          color: "#cbd5e1",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {Icon && <Icon size={11} style={{ color: "#94a3b8" }} />}
        {labelText} {required && <span style={{ color: "#ef4444" }}>*</span>}
        {hint && (
          <span
            style={{
              fontSize: 9,
              color: "#64748b",
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: 0,
              marginLeft: 4,
            }}
          >
            ({hint})
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

// ── FilePicker: олон файл зэрэг хуулах (parallel + алдаа мэдээлэх) ──
export function FilePicker({
  files,
  onChange,
  accentColor,
  label = "Файл сонгох",
}: {
  files: AttachedFile[];
  onChange: (files: AttachedFile[]) => void;
  accentColor: string;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [failed, setFailed] = useState(0);

  const uploadOne = async (file: File): Promise<AttachedFile | null> => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API}/api/announcements/upload-attachment`, {
        method: "POST",
        headers: authH(), // ⚠️ Content-Type БИТГИЙ нэм — browser multipart boundary-г өөрөө тавина
        body: fd,
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.url) return null;
      return {
        name: data.name ?? file.name,
        size: data.size ?? file.size,
        type: data.type ?? file.type,
        url: data.url,
        isImage: (data.type ?? file.type ?? "").startsWith("image/"),
      };
    } catch {
      return null;
    }
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    setUploading(true);
    setFailed(0);

    // Бүх сонгосон файлыг ЗЭРЭГ хуулна
    const results = await Promise.all(Array.from(list).map(uploadOne));
    const ok = results.filter((r): r is AttachedFile => r !== null);

    if (ok.length) onChange([...files, ...ok]);
    setFailed(results.length - ok.length);
    setUploading(false);
    e.target.value = ""; // ижил файлыг дахин сонгох боломжтой болгоно
  };

  return (
    <div>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "14px",
          borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1.5px dashed rgba(255,255,255,0.15)",
          cursor: uploading ? "not-allowed" : "pointer",
          color: uploading ? "#64748b" : "#94a3b8",
          fontSize: 12,
          fontWeight: 500,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.color = accentColor;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.color = uploading ? "#64748b" : "#94a3b8";
        }}
      >
        {uploading ? (
          <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
        ) : (
          <Upload size={14} />
        )}
        {uploading ? "Хуулж байна..." : `${label} (олон файл сонгож болно)`}
        <input
          type="file"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {failed > 0 && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "#f87171",
          }}
        >
          <AlertCircle size={12} /> {failed} файл хуулж чадсангүй
        </div>
      )}

      {files.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 10,
          }}
        >
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Paperclip size={12} style={{ color: accentColor, flexShrink: 0 }} />
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  color: "white",
                  textDecoration: "none",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {f.name}
              </a>
              <span style={{ fontSize: 10, color: "#64748b", flexShrink: 0 }}>
                {(f.size / 1024).toFixed(1)} KB
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "none",
                  borderRadius: 6,
                  padding: 4,
                  cursor: "pointer",
                  color: "#f87171",
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}