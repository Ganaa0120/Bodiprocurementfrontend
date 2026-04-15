"use client";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { API } from "./types";

interface Props {
  selected: any;
  user: any;
  onClose: () => void;
}

export default function BidModal({ selected, user, onClose }: Props) {
  const [bidSaving, setBidSaving] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidDone, setBidDone] = useState(false);

  const submitBid = async () => {
    setBidSaving(true);
    setBidError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/announcements/${selected.id}/bids`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");
      setBidDone(true);
      setTimeout(() => {
        onClose();
        setBidDone(false);
      }, 2500);
    } catch (e: any) {
      setBidError(e.message);
    } finally {
      setBidSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
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
          maxWidth: 440,
          background: "white",
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
          animation: "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            📋
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Оролцох хүсэлт гаргах
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#94a3b8",
                marginTop: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const,
              }}
            >
              {selected.title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
              borderRadius: 9,
              padding: 7,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={15} style={{ color: "#64748b" }} />
          </button>
        </div>

        <div style={{ padding: "20px 22px" }}>
          {bidDone ? (
            <div style={{ textAlign: "center" as const, padding: "24px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#059669",
                  marginBottom: 6,
                }}
              >
                Хүсэлт амжилттай илгээгдлээ!
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                Таны мэдээллийг admin нарт илгээлээ. Хариуг хүлээнэ үү.
              </div>
            </div>
          ) : (
            <>
              {bidError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    fontSize: 13,
                    color: "#dc2626",
                    marginBottom: 16,
                  }}
                >
                  {bidError}
                </div>
              )}

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    marginBottom: 10,
                  }}
                >
                  Таны мэдээлэл
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: 6,
                  }}
                >
                  {[
                    {
                      label: "Нэр",
                      value:
                        [user?.last_name, user?.first_name]
                          .filter(Boolean)
                          .join(" ") || user?.email,
                    },
                    { label: "Нийлүүлэгч №", value: user?.supplier_number },
                    { label: "И-мэйл", value: user?.email },
                    { label: "Утас", value: user?.phone },
                  ]
                    .filter((r) => r.value)
                    .map((row) => (
                      <div key={row.label} style={{ display: "flex", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            width: 100,
                            flexShrink: 0,
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#0f172a",
                          }}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: "#94a3b8",
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "#eef2ff",
                    border: "1px solid #c7d2fe",
                  }}
                >
                  💡 Дээрх мэдээлэл таны бүртгэлээс автоматаар явна
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "white",
                    color: "#64748b",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Болих
                </button>
                <button
                  onClick={submitBid}
                  disabled={bidSaving}
                  style={{
                    flex: 2,
                    padding: "11px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    opacity: bidSaving ? 0.7 : 1,
                  }}
                >
                  {bidSaving ? (
                    <>
                      <Loader2
                        size={14}
                        style={{ animation: "spin .8s linear infinite" }}
                      />{" "}
                      Илгээж байна...
                    </>
                  ) : (
                    "📨 Хүсэлт илгээх"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}