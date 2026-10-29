"use client";
// Үнийн санал / оролцох хүсэлтийн шийдвэрийн цонхнууд (BidsDrawer-ийн dark загвартай).
import React, { useMemo, useState } from "react";
import { Crown, Loader2, X, XCircle } from "lucide-react";
import { MIN_REASON_LEN, awardAnnouncement } from "./announcementActions";

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 700,
  background: "rgba(2,6,23,0.72)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};
const panel: React.CSSProperties = {
  width: "100%",
  maxWidth: 560,
  maxHeight: "88vh",
  display: "flex",
  flexDirection: "column",
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  color: "#e2e8f0",
  boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  overflow: "hidden",
};
const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: 88,
  resize: "vertical",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e2e8f0",
  fontSize: 13,
  lineHeight: 1.5,
  fontFamily: "inherit",
  outline: "none",
};
const btn = (kind: "ghost" | "danger" | "success"): React.CSSProperties => ({
  flex: 1,
  padding: "11px 14px",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "1px solid",
  ...(kind === "ghost" && {
    background: "transparent",
    borderColor: "rgba(255,255,255,0.12)",
    color: "#94a3b8",
  }),
  ...(kind === "danger" && {
    background: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.35)",
    color: "#f87171",
  }),
  ...(kind === "success" && {
    background: "rgba(16,185,129,0.14)",
    borderColor: "rgba(16,185,129,0.4)",
    color: "#34d399",
  }),
});

function Header({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div
      style={{
        padding: "18px 22px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 4, lineHeight: 1.5 }}>{subtitle}</div>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Хаах"
        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}
      >
        <X size={18} />
      </button>
    </div>
  );
}

/* ============================================================
   Шалтгаан бичүүлэх цонх (үнийн санал эсвэл оролцох хүсэлт татгалзах)
   ============================================================ */
export function ReasonModal({
  title,
  subtitle,
  confirmLabel = "Татгалзах",
  required = true,
  placeholder = "Жишээ: Санал болгосон үнэ төсвөөс өндөр байсан.",
  onSubmit,
  onClose,
}: {
  title: string;
  subtitle?: string;
  confirmLabel?: string;
  /** true бол MIN_REASON_LEN-ээс богино шалтгаантай илгээхгүй */
  required?: boolean;
  placeholder?: string;
  onSubmit: (reason: string) => Promise<void>;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tooShort = required && reason.trim().length < MIN_REASON_LEN;

  const submit = async () => {
    if (tooShort || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(reason.trim());
      onClose();
    } catch (e: any) {
      setError(e?.message || "Алдаа гарлаа");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <Header title={title} subtitle={subtitle} onClose={onClose} />
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>
            Шалтгаан {required ? <span style={{ color: "#f87171" }}>*</span> : <span style={{ color: "#64748b" }}>(заавал биш)</span>}
          </label>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            style={textarea}
            maxLength={2000}
          />
          <div style={{ fontSize: 11, color: tooShort && reason ? "#f87171" : "#64748b" }}>
            {required
              ? `Нийлүүлэгчид харагдана. Дор хаяж ${MIN_REASON_LEN} тэмдэгт (${reason.trim().length}/${MIN_REASON_LEN}).`
              : "Бичвэл нийлүүлэгчид харагдана."}
          </div>
          {error && <div style={{ fontSize: 12.5, color: "#f87171" }}>{error}</div>}
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10 }}>
          <button style={btn("ghost")} onClick={onClose} disabled={busy}>
            Болих
          </button>
          <button
            style={{ ...btn("danger"), opacity: tooShort || busy ? 0.5 : 1, cursor: tooShort || busy ? "not-allowed" : "pointer" }}
            onClick={submit}
            disabled={tooShort || busy}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Ялагч сонгох цонх
   Бусад шийдэгдээгүй санал бүрт шалтгаан заавал (нийтлэг + тус бүр өөрчилж болно)
   ============================================================ */
export function AwardModal({
  annId,
  winner,
  bids,
  currency = "MNT",
  onDone,
  onClose,
}: {
  annId: string;
  winner: any;
  bids: any[];
  currency?: string;
  onDone: (bids: any[]) => void;
  onClose: () => void;
}) {
  const losers = useMemo(
    () => bids.filter((b) => b.id !== winner.id && b.status !== "rejected"),
    [bids, winner.id],
  );
  const [defaultReason, setDefaultReason] = useState("");
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [openCustom, setOpenCustom] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);

  const reasonFor = (id: string) => (custom[id]?.trim() ? custom[id].trim() : defaultReason.trim());
  const incomplete = losers.filter((b) => reasonFor(b.id).length < MIN_REASON_LEN).map((b) => b.id);
  const canSubmit = !busy && incomplete.length === 0;
  const name = (b: any) => b.supplier_name || b.company_name || "Нийлүүлэгч";
  const price = (b: any) => {
    const v = Number(b.price_offer || b.budget_offer);
    return v > 0 ? `${v.toLocaleString("mn-MN")} ${currency}` : "—";
  };

  const submit = async () => {
    if (!canSubmit) {
      setMissing(incomplete);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const reasons: Record<string, string> = {};
      for (const b of losers) if (custom[b.id]?.trim()) reasons[b.id] = custom[b.id].trim();
      const res = await awardAnnouncement(annId, winner.id, defaultReason.trim(), reasons);
      onDone(res.bids);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Алдаа гарлаа");
      if (e?.missingBidIds) setMissing(e.missingBidIds);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...panel, maxWidth: 640 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <Header
          title="Ялагч сонгох"
          subtitle="Энэ шийдвэрийг дараа нь зөвхөн Super admin буцаах боломжтой. Бусад нийлүүлэгчдэд татгалзсан шалтгаан мэдэгдлээр очно."
          onClose={onClose}
        />
        <div style={{ padding: "18px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <Crown size={20} color="#34d399" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 600 }}>ЯЛАГЧ</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{name(winner)}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>{price(winner)}</div>
          </div>

          {losers.length > 0 ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>
                  Бусад {losers.length} нийлүүлэгчид очих татгалзсан шалтгаан <span style={{ color: "#f87171" }}>*</span>
                </label>
                <textarea
                  value={defaultReason}
                  onChange={(e) => setDefaultReason(e.target.value)}
                  placeholder="Жишээ: Илүү хямд, хүргэлтийн хугацаа богино санал шалгарсан."
                  style={textarea}
                  maxLength={2000}
                />
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  Тус бүрт өөр шалтгаан бичих бол доорх жагсаалтаас "Тусгай шалтгаан"-ыг дарна уу.
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {losers.map((b) => {
                  const isMissing = missing.includes(b.id) && reasonFor(b.id).length < MIN_REASON_LEN;
                  return (
                    <div
                      key={b.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${isMissing ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {name(b)}
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{price(b)}</div>
                        <button
                          onClick={() => setOpenCustom((s) => ({ ...s, [b.id]: !s[b.id] }))}
                          style={{
                            fontSize: 11,
                            padding: "4px 10px",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: "rgba(99,102,241,0.12)",
                            border: "1px solid rgba(99,102,241,0.3)",
                            color: "#a5b4fc",
                          }}
                        >
                          {openCustom[b.id] ? "Нийтлэгийг ашиглах" : "Тусгай шалтгаан"}
                        </button>
                      </div>
                      {openCustom[b.id] && (
                        <textarea
                          value={custom[b.id] ?? ""}
                          onChange={(e) => setCustom((s) => ({ ...s, [b.id]: e.target.value }))}
                          placeholder="Энэ нийлүүлэгчид очих шалтгаан"
                          style={{ ...textarea, minHeight: 64, marginTop: 8 }}
                          maxLength={2000}
                        />
                      )}
                      {isMissing && (
                        <div style={{ fontSize: 11, color: "#f87171", marginTop: 6 }}>
                          Шалтгаан дор хаяж {MIN_REASON_LEN} тэмдэгт байх ёстой
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Өөр шийдэгдээгүй үнийн санал алга.</div>
          )}
          {error && <div style={{ fontSize: 12.5, color: "#f87171" }}>{error}</div>}
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10 }}>
          <button style={btn("ghost")} onClick={onClose} disabled={busy}>
            Болих
          </button>
          <button
            style={{ ...btn("success"), opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}
            onClick={submit}
            disabled={busy}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Crown size={15} />}
            Ялагчаар баталгаажуулах
          </button>
        </div>
      </div>
    </div>
  );
}