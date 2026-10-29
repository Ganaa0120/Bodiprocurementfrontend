"use client";
// ════════════════════════════════════════════════════════════════
//  Компани / хувь хүний дэлгэрэнгүйн "Үнэлгээ" хэсэг (зөвхөн админд).
//
//  Бүтэц (олон админ үнэлсэн ч цэвэрхэн харагдахаар):
//    1. Нэгдсэн од: Нийт / Бараа / Үйлчилгээ
//    2. Ажил бүр = нэг карт:
//         • Толгой: зарлал, төрөл, компани, үнэ, төлөв, ДУНДАЖ од
//         • Шалгуур бүрийн ДУНДАЖ оноо (bar) — бүх админы дундаж
//         • Бага оноо, тайлбарууд товч chip хэлбэрээр
//         • "N админ үнэлсэн" — дарахад админ тус бүрийн үнэлгээ нээгдэнэ
//
//  Оноо тооцох дүрэм (backend-тэй ижил):
//    Ажлын оноо      = тухайн ажлыг үнэлсэн бүх админы онооны дундаж
//    Компанийн оноо  = ажлуудын онооны дундаж (ажил бүр тэнцүү жинтэй)
// ════════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  MessageSquareQuote,
  Package,
  Users,
  Wrench,
} from "lucide-react";
import {
  KIND_LABEL,
  evaluationApi,
  type EvalCategory,
  type HistoryRow,
  type SupplierJob,
  type SupplierSummary,
} from "./evaluationApi";
import { RatingStars } from "./RatingStars";

const LOW = 2; // энэ ба түүнээс доош = анхаарах

const money = (v: unknown, cur?: string | null) => {
  const n = Number(v);
  return n > 0 ? `${n.toLocaleString("mn-MN")} ${cur || "MNT"}` : "—";
};
const date = (v?: string | null) => (v ? new Date(v).toLocaleDateString("mn-MN") : "—");
const col5 = (n: number) => (n >= 4 ? "#34d399" : n >= 3 ? "#fbbf24" : "#f87171");

const card: React.CSSProperties = {
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
};

/* ───────────────────────── Нэгдсэн од ───────────────────────── */
function SummaryCard({
  label,
  part,
  icon,
}: {
  label: string;
  part?: { score: number; rated_count: number } | null;
  icon: React.ReactNode;
}) {
  return (
    <div style={{ ...card, flex: "1 1 160px", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#94a3b8", marginBottom: 8 }}>
        {icon} {label}
      </div>
      <RatingStars score={part?.score} count={part?.rated_count ?? null} size={15} emptyLabel="Үнэлгээгүй" />
      {part && (
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
          {part.score} / 100 · {part.rated_count} ажлын дундаж
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Шалгуурын дундаж ───────────────────────── */
type CriterionAvg = { id: string; name: string; avg: number; lows: { comment: string | null; who: string }[] };

function criterionAverages(evals: HistoryRow[]): CriterionAvg[] {
  const map = new Map<string, { name: string; sum: number; n: number; lows: CriterionAvg["lows"] }>();
  for (const e of evals) {
    for (const s of e.scores) {
      const key = String(s.criterion_id);
      const cur = map.get(key) ?? { name: s.criterion_name, sum: 0, n: 0, lows: [] };
      cur.sum += s.score;
      cur.n += 1;
      if (s.score <= LOW || s.comment) {
        if (s.score <= LOW) cur.lows.push({ comment: s.comment, who: e.evaluator_name || "Админ" });
      }
      map.set(key, cur);
    }
  }
  return [...map.entries()].map(([id, v]) => ({
    id,
    name: v.name,
    avg: Math.round((v.sum / v.n) * 10) / 10,
    lows: v.lows,
  }));
}

function CriterionBar({ c }: { c: CriterionAvg }) {
  const pct = Math.max(0, Math.min(100, (c.avg / 5) * 100));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 1fr) 2fr 34px", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 12, color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.name}>
        {c.name}
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: col5(c.avg) }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: col5(c.avg), textAlign: "right" }}>{c.avg.toFixed(1)}</div>
    </div>
  );
}

/* ───────────────────────── Админ тус бүрийн үнэлгээ (нээгддэг) ───────────────────────── */
function EvaluatorRow({ e }: { e: HistoryRow }) {
  const notes = e.scores.filter((s) => s.comment);
  return (
    <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(0,0,0,0.18)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            background: "rgba(99,102,241,0.18)",
            color: "#c7d2fe",
          }}
        >
          {(e.evaluator_name || "А").trim()[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0" }}>{e.evaluator_name || "Админ"}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {e.evaluator_company || e.buyer_company || "Group"} · {date(e.created_at)}
          </div>
        </div>
        <RatingStars score={e.total_pct} size={12} />
      </div>

      {/* Шалгуур бүрийн оноо: нэг мөрөнд товч */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {e.scores.map((s) => (
          <span
            key={String(s.criterion_id)}
            style={{
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 99,
              background: s.score <= LOW ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)",
              color: s.score <= LOW ? "#fca5a5" : "#94a3b8",
            }}
          >
            {s.criterion_name} <strong style={{ color: col5(s.score) }}>{s.score}</strong>
          </span>
        ))}
      </div>

      {(notes.length > 0 || e.general_comment) && (
        <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
          {notes.map((s) => (
            <div key={String(s.criterion_id)} style={{ fontSize: 12, color: s.score <= LOW ? "#fecaca" : "#cbd5e1", lineHeight: 1.5 }}>
              <span style={{ color: "#64748b" }}>{s.criterion_name}:</span> {s.comment}
            </div>
          ))}
          {e.general_comment && (
            <div style={{ display: "flex", gap: 6, fontSize: 12, color: "#e2e8f0", fontStyle: "italic", lineHeight: 1.5 }}>
              <MessageSquareQuote size={13} style={{ flexShrink: 0, marginTop: 2, color: "#64748b" }} />
              {e.general_comment}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Ажлын карт ───────────────────────── */
function JobCard({ job }: { job: SupplierJob }) {
  const [open, setOpen] = useState(false);
  const crit = useMemo(() => criterionAverages(job.evaluations), [job.evaluations]);
  const lowNotes = crit.flatMap((c) => c.lows.map((l) => ({ ...l, criterion: c.name })));
  const n = job.evaluations.length;

  return (
    <div style={{ ...card, overflow: "hidden" }}>
      {/* Толгой */}
      <div style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: job.category === "goods" ? "rgba(56,189,248,0.12)" : "rgba(167,139,250,0.14)",
            color: job.category === "goods" ? "#38bdf8" : "#c4b5fd",
          }}
        >
          {job.category === "goods" ? <Package size={18} /> : <Wrench size={18} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: 1.35 }}>
            {job.announcement_title}
          </div>
          <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 5, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span>{KIND_LABEL[job.category]}</span>
            {job.buyer_company && <span>{job.buyer_company}</span>}
            <span>{money(job.price_offer, job.currency)}</span>
            <span>Шалгарсан {date(job.awarded_at)}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {n > 0 ? (
            <>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24", lineHeight: 1 }}>
                {((job.bid_score ?? 0) / 20).toFixed(1)}
              </div>
              <div style={{ marginTop: 4 }}>
                <RatingStars score={job.bid_score} size={11} showValue={false} />
              </div>
            </>
          ) : (
            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>Үнэлгээгүй</div>
          )}
          <div style={{ marginTop: 6 }}>
            {job.fulfilled_at ? (
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 99, color: "#34d399", background: "rgba(16,185,129,0.12)" }}>
                Дууссан
              </span>
            ) : (
              <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 99, color: "#93c5fd", background: "rgba(59,130,246,0.12)" }}>
                <Clock size={10} style={{ verticalAlign: -1 }} /> Явагдаж байна
              </span>
            )}
          </div>
        </div>
      </div>

      {n > 0 && (
        <>
          {/* Шалгуурын дундаж */}
          <div style={{ padding: "0 16px 14px", display: "grid", gap: 8 }}>
            {crit.map((c) => (
              <CriterionBar key={c.id} c={c} />
            ))}
          </div>

          {/* Бага оноо: товч */}
          {lowNotes.length > 0 && (
            <div style={{ margin: "0 16px 14px", padding: "10px 12px", borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>
                <AlertTriangle size={13} /> Анхаарах ({lowNotes.length})
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                {lowNotes.map((l, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#fecaca", lineHeight: 1.5 }}>
                    <span style={{ color: "#fca5a5", fontWeight: 600 }}>{l.criterion}</span>
                    {l.comment ? ` — ${l.comment}` : " — тайлбаргүй"}
                    <span style={{ color: "#64748b" }}> · {l.who}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Админуудын үнэлгээ — нээгддэг */}
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              width: "100%",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0,0,0,0.15)",
              border: "none",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              color: "#94a3b8",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Users size={13} />
            {n} админ үнэлсэн
            <span style={{ flex: 1 }} />
            {open ? "Хураах" : "Дэлгэрэнгүй"}
            <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>
          {open && (
            <div style={{ padding: "10px 12px 12px", display: "grid", gap: 8, background: "rgba(0,0,0,0.1)" }}>
              {job.evaluations.map((e) => (
                <EvaluatorRow key={e.id} e={e} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ───────────────────────── Үндсэн panel ───────────────────────── */
export function SupplierEvaluationPanel({ type, id }: { type: "company" | "individual"; id: string }) {
  const [data, setData] = useState<{ summary: SupplierSummary; jobs: SupplierJob[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | EvalCategory>("all");

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(null);
    evaluationApi
      .jobs(type, id)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message || "Ачаалж чадсангүй"));
    return () => {
      alive = false;
    };
  }, [type, id]);

  const jobs = useMemo(
    () => (data?.jobs ?? []).filter((j) => filter === "all" || j.category === filter),
    [data, filter],
  );

  if (error) return <div style={{ color: "#f87171", fontSize: 13, padding: "20px 0" }}>{error}</div>;
  if (!data)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "#64748b" }}>
        <Loader2 size={20} style={{ animation: "spin .8s linear infinite" }} />
      </div>
    );

  const counts = {
    all: data.jobs.length,
    goods: data.jobs.filter((j) => j.category === "goods").length,
    service: data.jobs.filter((j) => j.category === "service").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <SummaryCard label="Нийт" part={data.summary.overall} icon={<CheckCircle2 size={13} />} />
        <SummaryCard label={KIND_LABEL.goods} part={data.summary.goods} icon={<Package size={13} />} />
        <SummaryCard label={KIND_LABEL.service} part={data.summary.service} icon={<Wrench size={13} />} />
      </div>

      <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.6 }}>
        Ажлын оноо = тухайн ажлыг үнэлсэн бүх админы дундаж. Нийт оноо = ажлуудын дундаж. Group дотор нууц, нийлүүлэгчид
        харагдахгүй.
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(["all", "goods", "service"] as const).map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                background: active ? "rgba(0,114,188,0.2)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? "rgba(56,189,248,0.45)" : "rgba(255,255,255,0.08)"}`,
                color: active ? "#38bdf8" : "#94a3b8",
              }}
            >
              {f === "all" ? "Бүх ажил" : KIND_LABEL[f]} ({counts[f]})
            </button>
          );
        })}
      </div>

      {jobs.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(148,163,184,0.5)", padding: "24px 0", textAlign: "center" }}>
          {data.jobs.length === 0 ? "Энэ нийлүүлэгч одоогоор ялагчаар сонгогдож байгаагүй." : "Энэ ангилалд ажил алга."}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {jobs.map((j) => (
            <JobCard key={j.bid_id} job={j} />
          ))}
        </div>
      )}
    </div>
  );
}