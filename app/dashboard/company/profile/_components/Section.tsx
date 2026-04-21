"use client";
import { Upload, FileText } from "lucide-react";
import { useRef, useState } from "react";

export function Section({ icon: Icon, title, children }: any) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #f1f5f9",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #f8fafc",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#eef2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} style={{ color: "#6366f1" }} />
        </div>
        <p
          style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}
        >
          {title}
        </p>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

export function DocUpload({
  label,
  fieldKey,
  preview,
  onFile,
  editing,
  accept = "image/*",
  required = false,
}: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const isDocField = accept.includes("pdf") || accept.includes(".doc");

  return (
    <div style={{ display: "block" }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#64748b",
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          margin: "0 0 8px",
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </p>

      <div
        onClick={() => editing && inputRef.current?.click()}
        style={{
          borderRadius: 12,
          minHeight: 80,
          position: "relative",
          overflow: "hidden",
          border: preview ? "1.5px solid #a7f3d0" : "1.5px dashed #e2e8f0",
          background: preview ? "#ecfdf5" : "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .15s",
          cursor: editing ? "pointer" : "default",
          flexDirection: "column" as const,
        }}
      >
        {preview ? (
          isDocField ? (
            <div style={{ textAlign: "center", padding: "12px 16px" }}>
              <FileText
                size={28}
                style={{
                  color: "#059669",
                  margin: "0 auto 6px",
                  display: "block",
                }}
              />
              <p
                style={{
                  fontSize: 11,
                  color: "#059669",
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                ✓ Байна
              </p>
              {!preview.startsWith("blob:") && (
                <a
                  href={preview}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontSize: 10,
                    color: "#6366f1",
                    marginTop: 4,
                    display: "block",
                    textDecoration: "underline",
                  }}
                >
                  Харах
                </a>
              )}
            </div>
          ) : (
            <img
              src={preview}
              alt=""
              style={{ width: "100%", height: 80, objectFit: "cover" }}
            />
          )
        ) : (
          <div style={{ textAlign: "center", padding: 16 }}>
            <Upload
              size={18}
              style={{
                color: "#cbd5e1",
                margin: "0 auto 6px",
                display: "block",
              }}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
              {editing ? "Файл оруулах" : "Байхгүй"}
            </p>
            {editing && isDocField && (
              <p style={{ fontSize: 10, color: "#cbd5e1", margin: "3px 0 0" }}>
                PDF, Word, зураг
              </p>
            )}
          </div>
        )}

        {editing && preview && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity .15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = "1")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = "0")
            }
          >
            <span style={{ fontSize: 11, color: "white", fontWeight: 600 }}>
              Солих
            </span>
          </div>
        )}
      </div>

      {/* ✅ Файлын нэр доор харуулна */}
      {preview && fileName && (
        <div
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 8px",
            borderRadius: 8,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
          }}
        >
          <FileText size={11} style={{ color: "#059669", flexShrink: 0 }} />
          <span
            style={{
              fontSize: 11,
              color: "#059669",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap" as const,
            }}
          >
            {fileName}
          </span>
        </div>
      )}

      {/* Серверийн файл байвал "Байна" харуулна */}
      {preview && !fileName && !preview.startsWith("blob:") && (
        <div
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 8px",
            borderRadius: 8,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
          }}
        >
          <FileText size={11} style={{ color: "#059669", flexShrink: 0 }} />
          <a
            href={preview}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 11,
              color: "#059669",
              fontWeight: 500,
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap" as const,
            }}
          >
            Файл харах →
          </a>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 10 * 1024 * 1024) {
            alert("Файлын хэмжээ 10MB-аас хэтрэхгүй байх ёстой");
            e.target.value = "";
            return;
          }
          setFileName(file.name);
          onFile(fieldKey, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
