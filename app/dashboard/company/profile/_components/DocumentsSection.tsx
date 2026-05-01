"use client";
import { FileText, Plus } from "lucide-react";
import { Section, DocUpload } from "./Section";
import { useBreakpoint } from "./useW";

function FileError({ msg }: { msg: string }) {
  return (
    <div
      data-error="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        marginTop: 6,
        padding: "3px 8px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 6,
      }}
    >
      <span style={{ fontSize: 10, color: "#ef4444" }}>✕</span>
      <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 500 }}>{msg}</span>
    </div>
  );
}

export function DocumentsSection({
  form,
  previews,
  onFile,
  editing,
  fieldErrors,
  setFieldErrors,
  extraFiles,
  setExtraFiles,
  extraFileUrls,
  setExtraFileUrls,
}: any) {
  const { isMobile, isTablet } = useBreakpoint();
  const gDoc = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)";

  return (
    <Section icon={FileText} title="КОМПАНИЙН БАРИМТ БИЧГИЙН ХУУЛБАР">
      <div style={{ display: "grid", gridTemplateColumns: gDoc, gap: 14, marginBottom: 14 }}>
        <div>
          <DocUpload
            label="Улсын бүртгэлийн гэрчилгээ"
            fieldKey="doc_state_registry"
            preview={previews.doc_state_registry}
            onFile={(k: string, f: File) => {
              onFile(k, f);
              setFieldErrors((p: any) => ({ ...p, doc_state_registry: "" }));
            }}
            editing={editing}
            accept=".pdf,image/*"
            required
          />
          {fieldErrors.doc_state_registry && (
            <FileError msg={fieldErrors.doc_state_registry} />
          )}
        </div>

        <div>
          <DocUpload
            label="НӨАТ-ын гэрчилгээ"
            fieldKey="doc_vat_certificate"
            preview={previews.doc_vat_certificate}
            onFile={(k: string, f: File) => {
              onFile(k, f);
              setFieldErrors((p: any) => ({ ...p, doc_vat_certificate: "" }));
            }}
            editing={editing}
            accept=".pdf,image/*"
            required
          />
          {fieldErrors.doc_vat_certificate && (
            <FileError msg={fieldErrors.doc_vat_certificate} />
          )}
        </div>

        <div>
          <DocUpload
            label="Тусгай зөвшөөрөл"
            fieldKey="doc_special_permission"
            preview={previews.doc_special_permission}
            onFile={(k: string, f: File) => {
              onFile(k, f);
              setFieldErrors((p: any) => ({ ...p, doc_special_permission: "" }));
            }}
            editing={editing}
            accept=".pdf,image/*"
            required={form.has_special_permission}
          />
          {fieldErrors.doc_special_permission && (
            <FileError msg={fieldErrors.doc_special_permission} />
          )}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#64748b",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            display: "block",
            marginBottom: 10,
          }}
        >
          Нэмэлт баримт бичиг
        </label>
        {extraFileUrls.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {extraFileUrls.map((url: string, i: number) => {
              const name = decodeURIComponent(
                url.split("/").pop()?.split("?")[0] || `Файл ${i + 1}`,
              );
              return (
                <div
                  key={`url-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "#f0fdf4",
                    border: "1px solid #a7f3d0",
                  }}
                >
                  <FileText size={14} style={{ color: "#059669", flexShrink: 0 }} />
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      color: "#059669",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    {name}
                  </a>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#6ee7b7",
                      fontWeight: 600,
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    ✓ Хадгалагдсан
                  </span>
                  {editing && (
                    <button
                      type="button"
                      onClick={() =>
                        setExtraFileUrls((p: string[]) => p.filter((_, j) => j !== i))
                      }
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 6,
                        padding: "3px 8px",
                        cursor: "pointer",
                        fontSize: 11,
                        color: "#ef4444",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      Хасах
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {extraFiles.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {extraFiles.map((f: File, i: number) => (
              <div
                key={`new-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                }}
              >
                <FileText size={14} style={{ color: "#f59e0b", flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 12,
                    color: "#1e293b",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {f.name}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#f59e0b",
                    fontWeight: 600,
                    whiteSpace: "nowrap" as const,
                  }}
                >
                  {(f.size / 1024).toFixed(0)} KB · Хадгалагдаагүй
                </span>
                {editing && (
                  <button
                    type="button"
                    onClick={() =>
                      setExtraFiles((p: File[]) => p.filter((_, j) => j !== i))
                    }
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 6,
                      padding: "3px 8px",
                      cursor: "pointer",
                      fontSize: 11,
                      color: "#ef4444",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    Хасах
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {editing && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px",
              borderRadius: 12,
              border: "1.5px dashed #0072BC",
              background: "#0072BC1A",
              cursor: "pointer",
              transition: "all .15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#cce4f4")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#0072BC1A")
            }
          >
            <Plus size={14} style={{ color: "#0072BC" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0072BC" }}>Файл нэмэх</span>
            <input
              type="file"
              multiple
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
              onChange={(e) => {
                const newFiles = Array.from(e.target.files || []);
                if (newFiles.some((f) => f.size > 10 * 1024 * 1024)) {
                  alert("10MB-аас хэтэрсэн файл байна");
                  return;
                }
                setExtraFiles((p: File[]) => [...p, ...newFiles]);
                e.target.value = "";
              }}
            />
          </label>
        )}
        {!editing && extraFileUrls.length === 0 && extraFiles.length === 0 && (
          <div style={{ fontSize: 13, color: "#cbd5e1" }}>—</div>
        )}
      </div>
    </Section>
  );
}