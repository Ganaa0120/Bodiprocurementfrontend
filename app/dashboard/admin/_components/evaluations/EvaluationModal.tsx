"use client";
// Ялагч нийлүүлэгчийг үнэлэх цонх.
// Шалгуур бүрт 1–5 оноо (тайлбартай), бага оноонд тайлбар заавал, ерөнхий тайлбар.
// Бусад админуудын өгсөн үнэлгээ доор нь харагдана (зөвхөн админуудад).
import React, { useEffect, useMemo, useState } from "react";
import { Crown, Loader2, Lock, Star, X } from "lucide-react";
import {
  ApiFailure,
  KIND_LABEL,
  evaluationApi,
  scoreColor,
  type Criterion,
  type HistoryRow,
  type WinnerDetail,
} from "./evaluationApi";
import { RatingStars } from "./RatingStars";

const MIN_COMMENT = 10;

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 800,
  background: "rgba(2,6,23,0.75)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};
const panel: React.CSSProperties = {
  width: "100%",
  maxWidth: 760,
  maxHeight: "92vh",
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
  minHeight: 60,
  resize: "vertical",
  boxSizing: "border-box",
  padding: "9px 11px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e2e8f0",
  fontSize: 13,
  lineHeight: 1.5,
  fontFamily: "inherit",
  outline: "none",
};

type Draft = Record<string, { score: number | null; comment: string }>;

function weighted(criteria: Criterion[], draft: Draft) {
  let total = 0;
  for (const c of criteria) {
    const s = draft[String(c.id)]?.score;
    if (!s) return null;
    total += (s / 5) * Number(c.weight_pct);
  }
  return Math.round(total * 10) / 10;
}

export function EvaluationModal({
  bidId,
  onClose,
  onSaved,
}: {
  bidId: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [data, setData] = useState<WinnerDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [general, setGeneral] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<HistoryRow[] | null>(null);

  useEffect(() => {
    let alive = true;
    evaluationApi
      .detail(bidId)
      .then((d) => {
        if (!alive) return;
        setData(d);
        const initial: Draft = {};
        for (const c of d.criteria) initial[String(c.id)] = { score: null, comment: "" };
        for (const s of d.my_evaluation?.scores ?? []) {
          initial[String(s.criterion_id)] = { score: s.score, comment: s.comment ?? "" };
        }
        setDraft(initial);
        setGeneral(d.my_evaluation?.general_comment ?? "");
        evaluationApi
          .history(d.winner.supplier_type, d.winner.supplier_id)
          .then((h) => alive && setHistory(h.history))
          .catch(() => alive && setHistory([]));
      })
      .catch((e) => alive && setLoadError(e.message));
    return () => {
      alive = false;
    };
  }, [bidId]);

  const criteria = data?.criteria ?? [];
  const total = useMemo(() => weighted(criteria, draft), [criteria, draft]);
  const mine = data?.my_evaluation ?? null;
  const readOnly = !!mine && !data?.winner.can_edit_my_evaluation;
  // Миний энэ ажлын үнэлгээг түүхээс хасна (дээр нь засварлах хэсэгт байгаа)
  const pastRows = (history ?? []).filter((h) => !(mine && String(h.id) === String(mine.id)));

  const localErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    for (const c of criteria) {
      const d = draft[String(c.id)];
      if (!d?.score) errs[c.id] = "Оноо сонгоно уу";
      else if (d.score <= c.comment_required_max && d.comment.trim().length < MIN_COMMENT)
        errs[c.id] = `${d.score} оноонд тайлбар заавал (${MIN_COMMENT}+ тэмдэгт)`;
    }
    return errs;
  }, [criteria, draft]);
  const canSave = !readOnly && !busy && Object.keys(localErrors).length === 0;

  const setScore = (id: string, score: number) =>
    setDraft((d) => ({ ...d, [id]: { ...(d[id] ?? { comment: "" }), score } }));
  const setComment = (id: string, comment: string) =>
    setDraft((d) => ({ ...d, [id]: { ...(d[id] ?? { score: null }), comment } }));

  const save = async () => {
    if (!canSave) {
      setFieldErrors(localErrors);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await evaluationApi.save(bidId, {
        scores: criteria.map((c) => ({
          criterionId: c.id,
          score: draft[String(c.id)].score as number,
          comment: draft[String(c.id)].comment.trim() || undefined,
        })),
        generalComment: general.trim() || undefined,
      });
      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Хадгалж чадсангүй");
      if (e instanceof ApiFailure && e.fieldErrors) setFieldErrors(e.fieldErrors);
    } finally {
      setBusy(false);
    }
  };

  const w = data?.winner;
  const summary = w ? data?.supplier_summary?.[w.category] : null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700 }}>
              <Star size={17} color="#fbbf24" /> Үнэлгээ өгөх
            </div>
            {w && (
              <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 6, lineHeight: 1.6 }}>
                <Crown size={12} style={{ verticalAlign: -1, color: "#34d399" }} />{" "}
                <strong style={{ color: "#e2e8f0" }}>{w.supplier_name}</strong> · {w.announcement_title}
                <br />
                {KIND_LABEL[w.category]}
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ color: "#64748b" }}>Group үнэлгээ:</span>
                  <RatingStars score={summary?.score} count={summary?.rated_count} size={15} />
                </div>
              </div>
            )}
          </div>
          <button onClick={onClose} aria-label="Хаах" style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", alignSelf: "flex-start" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {!data && !loadError && (
            <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "#94a3b8" }}>
              <Loader2 size={20} style={{ animation: "spin .8s linear infinite" }} />
            </div>
          )}
          {loadError && <div style={{ color: "#f87171", fontSize: 13 }}>{loadError}</div>}

          {data && readOnly && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "#fbbf24", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", padding: "8px 12px", borderRadius: 10, lineHeight: 1.5 }}>
              <Lock size={14} style={{ flexShrink: 0 }} />
              {data.my_reevaluation?.status === "pending"
                ? "Дахин үнэлэх хүсэлт тань Super admin-д хүлээгдэж байна."
                : "Үнэлгээг нэг л удаа өгнө. Дахин үнэлэх бол жагсаалтаас \"Дахин үнэлэх хүсэлт\" илгээнэ үү."}
            </div>
          )}
          {data && !readOnly && mine && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "#34d399", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", padding: "8px 12px", borderRadius: 10 }}>
              Super admin дахин үнэлэхийг зөвшөөрсөн. Хадгалсны дараа дахин түгжигдэнэ.
            </div>
          )}

          {criteria.map((c) => {
            const id = String(c.id);
            const d = draft[id] ?? { score: null, comment: "" };
            const needComment = !!d.score && d.score <= c.comment_required_max;
            const err = fieldErrors[id] && localErrors[id] ? localErrors[id] : null;
            return (
              <div
                key={id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${err ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>Жин {Number(c.weight_pct)}%</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = d.score === n;
                    const col = n >= 4 ? "#34d399" : n === 3 ? "#fbbf24" : "#f87171";
                    return (
                      <button
                        key={n}
                        type="button"
                        disabled={readOnly}
                        onClick={() => setScore(id, n)}
                        title={c.anchors?.[String(n)]}
                        style={{
                          padding: "8px 6px",
                          borderRadius: 10,
                          cursor: readOnly ? "default" : "pointer",
                          textAlign: "left",
                          background: active ? `${col}22` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${active ? col : "rgba(255,255,255,0.08)"}`,
                          color: active ? col : "#cbd5e1",
                          minHeight: 64,
                        }}
                      >
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{n}</div>
                        <div style={{ fontSize: 10.5, lineHeight: 1.35, color: active ? col : "#94a3b8" }}>
                          {c.anchors?.[String(n)]}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {(needComment || d.comment) && (
                  <textarea
                    value={d.comment}
                    disabled={readOnly}
                    onChange={(e) => setComment(id, e.target.value)}
                    placeholder={needComment ? `Бага оноо өгсөн шалтгаан (заавал, ${MIN_COMMENT}+ тэмдэгт)` : "Тайлбар"}
                    style={{ ...textarea, marginTop: 10 }}
                    maxLength={2000}
                  />
                )}
                {err && <div style={{ fontSize: 11.5, color: "#f87171", marginTop: 6 }}>{err}</div>}
              </div>
            );
          })}

          {data && (
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>Ерөнхий тайлбар (заавал биш)</span>
              <textarea
                value={general}
                disabled={readOnly}
                onChange={(e) => setGeneral(e.target.value)}
                placeholder="Нийлүүлэгчийн гүйцэтгэлийн талаарх нэмэлт тэмдэглэл"
                style={textarea}
                maxLength={4000}
              />
            </label>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginTop: 4 }}>
              Үнэлгээний түүх — Group-ийн бүх компани {history ? `(${pastRows.length})` : ""}
            </div>
            {history === null && data && (
              <div style={{ color: "#64748b", fontSize: 12 }}>
                <Loader2 size={13} style={{ animation: "spin .8s linear infinite", verticalAlign: -2 }} /> Ачаалж байна...
              </div>
            )}
            {history && pastRows.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 12 }}>Өмнө нь өгсөн үнэлгээ алга.</div>
            )}
            {pastRows.map((h) => (
              <div key={h.id} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600 }}>
                    {h.evaluator_name || "Админ"}
                    <span style={{ color: "#64748b", fontWeight: 400 }}>
                      {" "}· {h.buyer_company || h.evaluator_company || "Group"} · {new Date(h.created_at).toLocaleDateString("mn-MN")}
                    </span>
                  </div>
                  <RatingStars score={h.total_pct} size={13} />
                </div>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 3 }}>
                  {h.announcement_title} · {KIND_LABEL[h.category]}
                </div>
                <div style={{ display: "grid", gap: 3, marginTop: 6 }}>
                  {h.scores.map((sc) => (
                    <div key={String(sc.criterion_id)} style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5 }}>
                      <span style={{ color: "#94a3b8" }}>{sc.criterion_name}:</span>{" "}
                      <strong style={{ color: sc.score >= 4 ? "#34d399" : sc.score === 3 ? "#fbbf24" : "#f87171" }}>{sc.score}</strong>
                      {sc.comment && <span style={{ color: "#94a3b8" }}> — {sc.comment}</span>}
                    </div>
                  ))}
                </div>
                {h.general_comment && (
                  <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 6, fontStyle: "italic" }}>“{h.general_comment}”</div>
                )}
              </div>
            ))}
          </div>
          {error && <div style={{ fontSize: 12.5, color: "#f87171" }}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, fontSize: 13, color: "#94a3b8" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              Миний үнэлгээ:
              <RatingStars score={total} size={16} emptyLabel="Бүх шалгуурыг үнэлнэ үү" />
              {total != null && <span style={{ color: scoreColor(total), fontWeight: 700 }}>{total} / 100</span>}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ padding: "10px 16px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", fontWeight: 600, cursor: "pointer" }}
          >
            {readOnly ? "Хаах" : "Болих"}
          </button>
          {!readOnly && (
            <button
              onClick={save}
              disabled={busy}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: "none",
                background: canSave ? "linear-gradient(135deg,#f59e0b,#fbbf24)" : "rgba(255,255,255,0.08)",
                color: canSave ? "#1f1300" : "#64748b",
                fontWeight: 700,
                cursor: canSave ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {busy ? <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} /> : <Star size={15} />}
              {mine ? "Дахин үнэлгээ хадгалах" : "Үнэлгээ хадгалах"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}