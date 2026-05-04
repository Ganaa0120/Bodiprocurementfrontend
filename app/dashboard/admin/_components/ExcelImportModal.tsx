"use client";
import { useState } from "react";
import { X, Download, Loader2, FileSpreadsheet, CheckCircle2, Info } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getToken = () =>
  localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";

type ExportType = "persons" | "companies";

interface Props {
  type: ExportType;
  totalCount?: number;
  currentStatus?: string;  // "" = бүгд, эсвэл "pending" / "active" / "returned"
  onClose: () => void;
  showToast: (msg: string, ok?: boolean) => void;
}

const PRESET_LIMITS = [10, 20, 30, 50, 100];

export function ExcelExportModal({ type, totalCount, currentStatus = "", onClose, showToast }: Props) {
  const [limit, setLimit] = useState<number | "all">(50);
  const [custom, setCustom] = useState("");
  const [includeStatus, setIncludeStatus] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const isPerson = type === "persons";
  const title = isPerson ? "Хувь хүний мэдээлэл татах" : "Байгууллагын мэдээлэл татах";
  const accent = isPerson ? "#3b82f6" : "#a78bfa";
  const accentBg = isPerson ? "#eff6ff" : "#f5f3ff";

  const finalLimit: number | "all" = custom ? Number(custom) || 0 : limit;

  const handleDownload = async () => {
    if (finalLimit !== "all" && (!finalLimit || finalLimit < 1)) {
      showToast("Тоо буруу байна", false);
      return;
    }

    setDownloading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", finalLimit === "all" ? "all" : String(finalLimit));
      if (includeStatus && currentStatus) {
        params.set("status", currentStatus);
      }

      const res = await fetch(`${API}/api/excel-export/${type}?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Татаж чадсангүй");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      const cd = res.headers.get("Content-Disposition");
      const m = cd?.match(/filename="?([^"]+)"?/);
      a.href = url;
      a.download = m?.[1] ?? `${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showToast("Excel татагдлаа ✓");
      onClose();
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setDownloading(false);
    }
  };

  const getStatusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: "Хянагдаж буй",
      active: "Идэвхтэй",
      approved: "Баталгаажсан",
      returned: "Буцаагдсан",
      rejected: "Татгалзсан",
      new: "Шинэ",
    };
    return map[s] || s;
  };

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .preset-btn {
          transition: all 0.15s ease;
        }
        
        .preset-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "white",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
            animation: "modalFadeIn 0.2s ease",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px 28px 20px",
              borderBottom: "1px solid #eef2f6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: accentBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileSpreadsheet size={20} style={{ color: accent }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1e2a3a",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#8a99a8",
                    marginTop: 2,
                  }}
                >
                  Excel файл болгон экспортлох
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                borderRadius: 8,
                padding: 6,
                cursor: "pointer",
                color: "#8a99a8",
                display: "flex",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "#f0f2f5";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "transparent";
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Preset limits */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#8a99a8",
                  letterSpacing: "0.5px",
                  marginBottom: 10,
                }}
              >
                ТОО ХЭМЖЭЭ
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 8,
                }}
              >
                {PRESET_LIMITS.map((n) => {
                  const selected = limit === n && !custom;
                  return (
                    <button
                      key={n}
                      onClick={() => {
                        setLimit(n);
                        setCustom("");
                      }}
                      className="preset-btn"
                      style={{
                        padding: "10px 8px",
                        borderRadius: 10,
                        cursor: "pointer",
                        background: selected ? accentBg : "white",
                        border: selected ? `1.5px solid ${accent}` : "1px solid #e2e8f0",
                        color: selected ? accent : "#5a6874",
                        fontSize: 13,
                        fontWeight: selected ? 700 : 500,
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                    >
                      {n} мөр
                    </button>
                  );
                })}
              </div>
            </div>

            {/* "Бүгд" button */}
            <div>
              <button
                onClick={() => {
                  setLimit("all");
                  setCustom("");
                }}
                className="preset-btn"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: limit === "all" && !custom ? accentBg : "white",
                  border: limit === "all" && !custom ? `1.5px solid ${accent}` : "1px solid #e2e8f0",
                  color: limit === "all" && !custom ? accent : "#5a6874",
                  fontSize: 13,
                  fontWeight: limit === "all" && !custom ? 700 : 500,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Бүгд</span>
                {typeof totalCount === "number" && (
                  <span
                    style={{
                      fontSize: 12,
                      color: limit === "all" && !custom ? accent : "#94a3b8",
                    }}
                  >
                    {totalCount.toLocaleString()} ширхэг
                  </span>
                )}
              </button>
            </div>

            {/* Custom limit */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#8a99a8",
                  letterSpacing: "0.5px",
                  marginBottom: 8,
                }}
              >
                ЭСВЭЛ ӨӨРӨӨ ОРУУЛАХ
              </div>
              <input
                type="number"
                min={1}
                value={custom}
                onChange={(e) => {
                  setCustom(e.target.value);
                  if (e.target.value) setLimit(50);
                }}
                placeholder="Жишээ: 75"
                style={{
                  width: "100%",
                  background: "white",
                  border: custom ? `1.5px solid ${accent}` : "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#1e2a3a",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "all 0.15s",
                }}
                onFocus={(e) => {
                  (e.target as HTMLElement).style.borderColor = accent;
                }}
                onBlur={(e) => {
                  (e.target as HTMLElement).style.borderColor = custom ? accent : "#e2e8f0";
                }}
              />
            </div>

            {/* Status filter checkbox */}
            {currentStatus && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#f8fafc";
                }}
              >
                <input
                  type="checkbox"
                  checked={includeStatus}
                  onChange={(e) => setIncludeStatus(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: "pointer",
                    accentColor: accent,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1e2a3a",
                    }}
                  >
                    Зөвхөн "{getStatusLabel(currentStatus)}" статустайг татах
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#8a99a8",
                      marginTop: 2,
                    }}
                  >
                    Сонголтыг болиулбал бүх статустай татна
                  </div>
                </div>
              </label>
            )}

            {/* Summary info */}
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: accentBg,
                border: `1px solid ${accent}20`,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <Info size={16} style={{ color: accent, flexShrink: 0, marginTop: 1 }} />
              <div
                style={{
                  fontSize: 12,
                  color: "#1e2a3a",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: accent }}>
                  {finalLimit === "all" ? "Бүх" : `${finalLimit.toLocaleString()}`}
                </strong>{" "}
                {isPerson ? "хувь хүний" : "байгууллагын"} мэдээлэл
                {includeStatus && currentStatus && (
                  <span style={{ color: "#5a6874" }}>
                    {" "}
                    (зөвхөн {getStatusLabel(currentStatus)} статустай)
                  </span>
                )}{" "}
                Excel файл болж татагдана
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <button
                onClick={onClose}
                disabled={downloading}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 12,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  color: "#5a6874",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: downloading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  opacity: downloading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!downloading) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#f8fafc";
                    el.style.borderColor = "#cbd5e1";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "white";
                  el.style.borderColor = "#e2e8f0";
                }}
              >
                Болих
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  flex: 2,
                  height: 46,
                  borderRadius: 12,
                  border: "none",
                  background: downloading ? "#cbd5e1" : accent,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: downloading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s",
                  opacity: downloading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!downloading) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = isPerson ? "#2563eb" : "#8b5cf6";
                    el.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!downloading) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = accent;
                    el.style.transform = "translateY(0)";
                  }
                }}
              >
                {downloading ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                    Татаж байна...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Excel татах
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}