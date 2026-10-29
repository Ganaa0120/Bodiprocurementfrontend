"use client";
// ════════════════════════════════════════════════════════════════
//  "Үнэлгээ өгөх" цэс — Super admin, Mini admin, дэд админуудад.
//  Ялагчаар сонгогдсон компани / хувь хүмүүс энд автоматаар орно.
//    1. Ажил явагдаж буй  → "Ажил дууссан" товч
//    2. Үнэлэх            → "Үнэлгээ өгөх" товч (цонх нээгдэнэ)
//    3. Үнэлсэн           → оноо харагдана, 7 хоногт засна
//  Үнэлгээ Group дотор нууц: нийлүүлэгчид огт харагдахгүй.
// ════════════════════════════════════════════════════════════════
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Crown,
  Eye,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  Star,
  User,
} from "lucide-react";
import { SupplierDetailModal } from "../announcements/BidsDrawer";
import { EvaluationModal } from "./EvaluationModal";
import { KIND_LABEL, evaluationApi, type Winner, type WinnerStage } from "./evaluationApi";
import { RatingStars } from "./RatingStars";
import { isSuperAdmin } from "../announcements/announcementActions";
import type { ReevalRequest } from "./evaluationApi";

type Filter = "all" | WinnerStage;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Бүгд" },
  { id: "in_progress", label: "Ажил явагдаж буй" },
  { id: "to_rate", label: "Үнэлэх" },
  { id: "rated", label: "Үнэлсэн" },
];

const STAGE_BADGE: Record<WinnerStage, { label: string; color: string; bg: string }> = {
  in_progress: { label: "Ажил явагдаж байна", color: "#93c5fd", bg: "rgba(59,130,246,0.12)" },
  to_rate: { label: "Үнэлгээ хүлээж байна", color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
  rated: { label: "Үнэлсэн", color: "#34d399", bg: "rgba(16,185,129,0.12)" },
};

const money = (v: unknown, cur?: string | null) => {
  const n = Number(v);
  return n > 0 ? `${n.toLocaleString("mn-MN")} ${cur || "MNT"}` : "—";
};
const date = (v?: string | null) => (v ? new Date(v).toLocaleDateString("mn-MN") : "—");

export function EvaluationsTab({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [rateBid, setRateBid] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ id: string; type: "company" | "individual" } | null>(null);
  const [fulfilling, setFulfilling] = useState<string | null>(null);
  const [confirmBid, setConfirmBid] = useState<Winner | null>(null);
  const [reevalTarget, setReevalTarget] = useState<Winner | null>(null);
  const [reevalReason, setReevalReason] = useState("");
  const [reevalBusy, setReevalBusy] = useState(false);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [requests, setRequests] = useState<ReevalRequest[]>([]);
  const [decideBusy, setDecideBusy] = useState<string | null>(null);

  // showToast нь эх компонентод render бүрт шинээр үүсдэг тул ref-д хадгална.
  // Эс тэгвэл алдааны toast → дахин render → дахин ачаалах гэсэн төгсгөлгүй гогцоо үүснэ.
  const toastRef = useRef(showToast);
  toastRef.current = showToast;
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { winners } = await evaluationApi.winners();
      setWinners(winners);
    } catch (e: any) {
      const msg = e?.message || "Ачаалж чадсангүй";
      setLoadError(msg);
      toastRef.current(msg, false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const { requests } = await evaluationApi.reevalRequests("pending");
      setRequests(requests);
    } catch {
      /* Super admin биш бол 403 — үл тооно */
    }
  }, []);

  useEffect(() => {
    load();
    const sa = isSuperAdmin();
    setSuperAdmin(sa);
    if (sa) loadRequests();
  }, [load, loadRequests]);

  const sendReeval = async () => {
    if (!reevalTarget || reevalReason.trim().length < 10) return;
    setReevalBusy(true);
    try {
      await evaluationApi.requestReevaluation(reevalTarget.bid_id, reevalReason.trim());
      toastRef.current("Дахин үнэлэх хүсэлт Super admin-д илгээгдлээ");
      setReevalTarget(null);
      setReevalReason("");
      load();
      if (superAdmin) loadRequests();
    } catch (e: any) {
      toastRef.current(e.message, false);
    } finally {
      setReevalBusy(false);
    }
  };

  const decide = async (r: ReevalRequest, status: "approved" | "rejected") => {
    setDecideBusy(String(r.id));
    try {
      await evaluationApi.decideReeval(r.id, status);
      toastRef.current(status === "approved" ? "Зөвшөөрөгдлөө ✓" : "Татгалзлаа");
      setRequests((list) => list.filter((x) => x.id !== r.id));
      load();
    } catch (e: any) {
      toastRef.current(e.message, false);
    } finally {
      setDecideBusy(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: winners.length, in_progress: 0, to_rate: 0, rated: 0 };
    for (const w of winners) c[w.stage] += 1;
    return c;
  }, [winners]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return winners.filter(
      (w) =>
        (filter === "all" || w.stage === filter) &&
        (!term ||
          w.supplier_name.toLowerCase().includes(term) ||
          w.announcement_title.toLowerCase().includes(term) ||
          (w.buyer_company ?? "").toLowerCase().includes(term)),
    );
  }, [winners, filter, q]);

  const fulfill = async (w: Winner) => {
    setConfirmBid(null);
    setFulfilling(w.bid_id);
    try {
      const { winner } = await evaluationApi.fulfill(w.bid_id);
      setWinners((list) => list.map((x) => (x.bid_id === w.bid_id ? { ...x, ...winner } : x)));
      showToast("Ажил дууссан гэж тэмдэглэгдлээ ✓");
      setRateBid(w.bid_id);
    } catch (e: any) {
      showToast(e.message, false);
    } finally {
      setFulfilling(null);
    }
  };

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "16px 18px",
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "center",
  };
  const btn = (bg: string, border: string, color: string): React.CSSProperties => ({
    padding: "8px 14px",
    borderRadius: 10,
    background: bg,
    border: `1px solid ${border}`,
    color,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  });

  return (
    <>
      {rateBid && (
        <EvaluationModal
          bidId={rateBid}
          onClose={() => setRateBid(null)}
          onSaved={() => {
            toastRef.current("Үнэлгээ хадгалагдлаа ⭐");
            load();
          }}
        />
      )}
      {detail && (
        <SupplierDetailModal supplierId={detail.id} supplierType={detail.type} onClose={() => setDetail(null)} />
      )}
      {confirmBid && (
        <div
          onClick={() => setConfirmBid(null)}
          style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(2,6,23,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ width: "100%", maxWidth: 440, background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 22, color: "#e2e8f0" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700 }}>
              <PackageCheck size={20} color="#34d399" /> Ажил дууссан уу?
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: "10px 0 18px" }}>
              <strong style={{ color: "#e2e8f0" }}>{confirmBid.supplier_name}</strong> “{confirmBid.announcement_title}” зарлалын
              бараа / ажлыг бүрэн хүлээлгэж өгсөн гэж тэмдэглэнэ. Үүний дараа бүх админ үнэлгээ өгөх боломжтой болно.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmBid(null)} style={{ ...btn("transparent", "rgba(255,255,255,0.12)", "#94a3b8"), flex: 1, justifyContent: "center" }}>
                Болих
              </button>
              <button
                onClick={() => fulfill(confirmBid)}
                style={{ ...btn("rgba(16,185,129,0.15)", "rgba(16,185,129,0.4)", "#34d399"), flex: 1, justifyContent: "center" }}
              >
                <CheckCircle2 size={15} /> Тийм, дууссан
              </button>
            </div>
          </div>
        </div>
      )}

      {reevalTarget && (
        <div
          onClick={() => setReevalTarget(null)}
          style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(2,6,23,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ width: "100%", maxWidth: 460, background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 22, color: "#e2e8f0" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700 }}>
              <RotateCcw size={18} color="#fbbf24" /> Дахин үнэлэх хүсэлт
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: "10px 0 12px" }}>
              <strong style={{ color: "#e2e8f0" }}>{reevalTarget.supplier_name}</strong> “{reevalTarget.announcement_title}” — таны
              өгсөн үнэлгээг дахин өгөх хүсэлт Super admin-д очно. Зөвшөөрөгдвөл нэг удаа дахин үнэлэх боломжтой болно.
            </p>
            <textarea
              autoFocus
              value={reevalReason}
              onChange={(e) => setReevalReason(e.target.value)}
              placeholder="Шалтгаан: жишээ нь оноог буруу сонгосон, шинэ мэдээлэл ирсэн..."
              maxLength={2000}
              style={{ width: "100%", minHeight: 90, boxSizing: "border-box", padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical" }}
            />
            <div style={{ fontSize: 11, color: reevalReason.trim().length < 10 && reevalReason ? "#f87171" : "#64748b", marginTop: 6 }}>
              Дор хаяж 10 тэмдэгт ({reevalReason.trim().length}/10)
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => setReevalTarget(null)} style={{ ...btn("transparent", "rgba(255,255,255,0.12)", "#94a3b8"), flex: 1, justifyContent: "center" }}>
                Болих
              </button>
              <button
                onClick={sendReeval}
                disabled={reevalBusy || reevalReason.trim().length < 10}
                style={{ ...btn("rgba(245,158,11,0.15)", "rgba(245,158,11,0.4)", "#fbbf24"), flex: 1, justifyContent: "center", opacity: reevalReason.trim().length < 10 ? 0.5 : 1 }}
              >
                {reevalBusy ? <Loader2 size={15} style={{ animation: "spin .8s linear infinite" }} /> : <RotateCcw size={15} />}
                Хүсэлт илгээх
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {superAdmin && requests.length > 0 && (
          <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "#fbbf24", marginBottom: 10 }}>
              <RotateCcw size={15} /> Дахин үнэлэх хүсэлтүүд ({requests.length})
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {requests.map((r) => (
                <div key={String(r.id)} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "10px 12px", borderRadius: 12, background: "rgba(0,0,0,0.2)" }}>
                  <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                      {r.requester_name || "Админ"}
                      <span style={{ color: "#64748b", fontWeight: 400 }}>
                        {r.requester_company ? ` · ${r.requester_company}` : ""} · {new Date(r.created_at).toLocaleDateString("mn-MN")}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                      {r.supplier_name} — {r.announcement_title} · одоогийн үнэлгээ{" "}
                      {r.current_score != null ? `${(r.current_score / 20).toFixed(1)} ★` : "—"}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#e2e8f0", marginTop: 4 }}>“{r.reason}”</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={decideBusy === String(r.id)}
                      onClick={() => decide(r, "rejected")}
                      style={btn("rgba(239,68,68,0.08)", "rgba(239,68,68,0.3)", "#f87171")}
                    >
                      <XCircle size={14} /> Татгалзах
                    </button>
                    <button
                      disabled={decideBusy === String(r.id)}
                      onClick={() => decide(r, "approved")}
                      style={btn("rgba(16,185,129,0.12)", "rgba(16,185,129,0.35)", "#34d399")}
                    >
                      {decideBusy === String(r.id) ? <Loader2 size={14} style={{ animation: "spin .8s linear infinite" }} /> : <CheckCircle2 size={14} />}
                      Зөвшөөрөх
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Ялагчаар сонгогдсон нийлүүлэгчид. Үнэлгээ зөвхөн админуудад харагдана.
            </p>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "#64748b" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Нийлүүлэгч, зарлал хайх"
              style={{ padding: "8px 12px 8px 30px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: 13, outline: "none", width: 230 }}
            />
          </div>
          <button onClick={load} style={btn("rgba(255,255,255,0.04)", "rgba(255,255,255,0.1)", "#94a3b8")}>
            <RefreshCw size={14} style={loading ? { animation: "spin .8s linear infinite" } : undefined} /> Шинэчлэх
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: active ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.08)"}`,
                  color: active ? "#c7d2fe" : "#94a3b8",
                }}
              >
                {f.label} <span style={{ opacity: 0.7 }}>({counts[f.id]})</span>
              </button>
            );
          })}
        </div>

        {loadError && !loading && !winners.length ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#f87171", fontSize: 13.5, border: "1px dashed rgba(239,68,68,0.3)", borderRadius: 16 }}>
            {loadError}
            <div style={{ marginTop: 12 }}>
              <button onClick={load} style={btn("rgba(255,255,255,0.04)", "rgba(255,255,255,0.12)", "#cbd5e1")}>
                <RefreshCw size={14} /> Дахин оролдох
              </button>
            </div>
          </div>
        ) : loading && !winners.length ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60, color: "#64748b" }}>
            <Loader2 size={22} style={{ animation: "spin .8s linear infinite" }} />
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#64748b", fontSize: 13.5, border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16 }}>
            {winners.length === 0
              ? "Одоогоор ялагчаар сонгогдсон нийлүүлэгч алга. Зарлалын \"Санал хуудас\"-аас ялагч сонгоход энд автоматаар орно."
              : "Шүүлтүүрт тохирох мөр алга."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map((w) => {
              const badge = STAGE_BADGE[w.stage];
              const groupScore = w.supplier_summary?.[w.category];
              return (
                <div key={w.bid_id} style={card}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: w.supplier_type === "company" ? "rgba(139,92,246,0.15)" : "rgba(99,102,241,0.15)",
                      color: w.supplier_type === "company" ? "#c4b5fd" : "#a5b4fc",
                    }}
                  >
                    {w.supplier_type === "company" ? <Building2 size={20} /> : <User size={20} />}
                  </div>

                  <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Crown size={14} color="#34d399" />
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{w.supplier_name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 999, color: badge.color, background: badge.bg }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {w.announcement_title}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span>{KIND_LABEL[w.category]}</span>
                      {w.buyer_company && <span>🏢 {w.buyer_company}</span>}
                      <span>💰 {money(w.price_offer, w.currency)}</span>
                      <span>🏆 {date(w.awarded_at)}</span>
                      {w.fulfilled_at && <span>✅ Дууссан {date(w.fulfilled_at)}</span>}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 6, minWidth: 170 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 10.5, color: "#64748b" }}>Энэ ажил</span>
                      <RatingStars score={w.bid_score} count={w.evaluation_count || null} size={13} emptyLabel="—" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 10.5, color: "#64748b" }}>Group</span>
                      <RatingStars score={groupScore?.score} count={groupScore?.rated_count ?? null} size={13} emptyLabel="—" />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
                    <button
                      onClick={() => setDetail({ id: w.supplier_id, type: w.supplier_type })}
                      style={btn("rgba(99,102,241,0.10)", "rgba(99,102,241,0.3)", "#a5b4fc")}
                    >
                      <Eye size={14} /> Дэлгэрэнгүй
                    </button>
                    {w.stage === "in_progress" && w.can_mark_fulfilled && (
                      <button
                        onClick={() => setConfirmBid(w)}
                        disabled={fulfilling === w.bid_id}
                        style={btn("rgba(16,185,129,0.12)", "rgba(16,185,129,0.35)", "#34d399")}
                      >
                        {fulfilling === w.bid_id ? <Loader2 size={14} style={{ animation: "spin .8s linear infinite" }} /> : <PackageCheck size={14} />}
                        Ажил дууссан
                      </button>
                    )}
                    {w.stage === "in_progress" && !w.can_mark_fulfilled && (
                      <span style={{ fontSize: 11.5, color: "#64748b", alignSelf: "center" }}>Зарлал нийтэлсэн админ дуусгана</span>
                    )}
                    {w.stage === "to_rate" && (
                      <button onClick={() => setRateBid(w.bid_id)} style={btn("rgba(245,158,11,0.14)", "rgba(245,158,11,0.4)", "#fbbf24")}>
                        <Star size={14} /> Үнэлгээ өгөх
                      </button>
                    )}
                    {w.stage === "rated" && (
                      <button onClick={() => setRateBid(w.bid_id)} style={btn("rgba(255,255,255,0.04)", "rgba(255,255,255,0.12)", "#cbd5e1")}>
                        <Star size={14} color="#fbbf24" /> Миний: {((w.my_score ?? 0) / 20).toFixed(1)} ★
                      </button>
                    )}
                    {w.stage === "rated" && w.my_reeval_status === "approved" && (
                      <button onClick={() => setRateBid(w.bid_id)} style={btn("rgba(245,158,11,0.14)", "rgba(245,158,11,0.4)", "#fbbf24")}>
                        <RotateCcw size={14} /> Дахин үнэлэх
                      </button>
                    )}
                    {w.stage === "rated" && w.my_reeval_status === "pending" && (
                      <span style={{ fontSize: 11.5, color: "#fbbf24", alignSelf: "center", display: "flex", alignItems: "center", gap: 5 }}>
                        <RotateCcw size={12} /> Хүсэлт хүлээгдэж байна
                      </span>
                    )}
                    {w.stage === "rated" && w.my_reeval_status !== "approved" && w.my_reeval_status !== "pending" && (
                      <button
                        onClick={() => {
                          setReevalReason("");
                          setReevalTarget(w);
                        }}
                        title={w.my_reeval_status === "rejected" ? "Өмнөх хүсэлт татгалзагдсан" : undefined}
                        style={btn("transparent", "rgba(255,255,255,0.1)", "#94a3b8")}
                      >
                        <RotateCcw size={14} /> Дахин үнэлэх хүсэлт
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}