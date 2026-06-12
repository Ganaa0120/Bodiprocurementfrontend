"use client";
import { useState, useEffect } from "react";
import {
  Users, Clock, CheckCircle2, Building2, FileText,
  TrendingUp, Send, Target, Sparkles, Calendar,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";
import { API, authH } from "../_lib/constants";

const COLOR = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  pink: "#ec4899",
  muted: "#64748b",
};

const AVATAR_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

const card: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(18,22,45,0.95), rgba(12,16,35,0.98))",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 24,
  overflow: "hidden",
};

export function DashboardOverview({
  persons,
  companies,
  pendingCount,
  isSubAdmin = false,
  me,
}: {
  persons: any[];
  companies: any[];
  pendingCount: number;
  isSubAdmin?: boolean;
  me?: any;
}) {
  const [anns, setAnns] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/api/announcements?limit=200`, { headers: authH() })
      .then((r) => r.json())
      .then((d) => { if (d.success) setAnns(d.announcements ?? []); })
      .catch(() => {});
  }, []);

  // ─── STATS COMPUTATION ───
  const activeAnns = anns.filter((a) => a.status === "published").length;
  const draftAnns = anns.filter((a) => a.status === "draft").length;
  const closedAnns = anns.filter((a) => a.status === "closed").length;
  const urgentAnns = anns.filter((a) => a.is_urgent && a.status === "published").length;
  const openAnns = anns.filter((a) => a.ann_type === "open").length;
  const targetedAnns = anns.filter((a) => a.ann_type === "targeted").length;
  const rfqAnns = anns.filter((a) => a.ann_type === "rfq").length;

  const totalSuppliers = persons.length + companies.length;
  const activeSuppliers =
    persons.filter((p) => p.status === "active").length +
    companies.filter((c) => c.status === "active" || c.status === "approved").length;

  // Сар бүрийн өсөлт
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

  const thisMonthAnns = anns.filter((a) => new Date(a.created_at) >= monthStart).length;
  const lastMonthAnns = anns.filter((a) => {
    const d = new Date(a.created_at);
    return d >= lastMonthStart && d < monthStart;
  }).length;
  const monthChange =
    lastMonthAnns === 0 ? (thisMonthAnns > 0 ? 100 : 0) : Math.round(((thisMonthAnns - lastMonthAnns) / lastMonthAnns) * 100);

  // Pie chart data
  const statusPie = [
    { name: "Нийтлэгдсэн", value: activeAnns, color: COLOR.success },
    { name: "Ноорог", value: draftAnns, color: COLOR.warning },
    { name: "Хаагдсан", value: closedAnns, color: COLOR.muted },
  ].filter((s) => s.value > 0);

  // Сүүлийн 14 хоногийн идэвхжил
  const days14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return {
      label: `${d.getDate()}.${d.getMonth() + 1}`,
      anns: anns.filter((a) => {
        const ad = new Date(a.created_at);
        return ad >= d && ad < next;
      }).length,
    };
  });

  // Тендер төрөл breakdown
  const totalAnns = anns.length || 1;
  const typeBreakdown = [
    { key: "open", label: "Нээлттэй тендер", count: openAnns, pct: Math.round((openAnns / totalAnns) * 100), color: COLOR.success, icon: Target },
    { key: "targeted", label: "Хаалттай тендер", count: targetedAnns, pct: Math.round((targetedAnns / totalAnns) * 100), color: COLOR.primary, icon: Send },
    { key: "rfq", label: "Үнийн санал", count: rfqAnns, pct: Math.round((rfqAnns / totalAnns) * 100), color: COLOR.info, icon: TrendingUp },
  ];

  // Сүүлийн 5 зар
  const recentAnns = [...anns]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Hero stats
  const stats = [
    { label: "Идэвхтэй зар", value: activeAnns, icon: FileText, color: COLOR.success, sub: urgentAnns > 0 ? `⚡ ${urgentAnns} яаралтай` : "Бүгд хэвийн" },
    { label: "Энэ сард", value: thisMonthAnns, icon: Calendar, color: COLOR.primary, sub: monthChange >= 0 ? `↑ ${monthChange}% өсөлт` : `↓ ${Math.abs(monthChange)}% бууралт`, trend: monthChange >= 0 },
    { label: "Нийт нийлүүлэгч", value: totalSuppliers, icon: Users, color: COLOR.secondary, sub: `${activeSuppliers} идэвхтэй` },
    { label: "Компани", value: companies.length, icon: Building2, color: COLOR.info, sub: `${companies.filter((c) => c.status === "approved").length} зөвшөөрсөн` },
    { label: "Хүлээгдэж буй", value: pendingCount, icon: Clock, color: COLOR.warning, sub: pendingCount > 0 ? "Хянах шаардлагатай" : "✓ Бүгд шийдэгдсэн", highlight: pendingCount > 0 },
    { label: "Хувь хүн", value: persons.length, icon: CheckCircle2, color: COLOR.pink, sub: `${persons.filter((p) => p.status === "active").length} идэвхтэй` },
  ];

  return (
    <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ─── WELCOME BANNER ─── */}
      <div
        style={{
          ...card,
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))",
          borderColor: "rgba(99,102,241,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 56, height: 56, borderRadius: 18,
            background: "linear-gradient(145deg, #4f46e5, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
            flexShrink: 0,
          }}
        >
          <Sparkles size={24} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 4 }}>
            Сайн уу, {me?.first_name || "Админ"}! 👋
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            {isSubAdmin ? "Танд олгосон эрхийн хүрээнд ажиллана" : "Худалдан авалтын ерөнхий тойм"}
            {urgentAnns > 0 && (
              <> · <span style={{ color: COLOR.danger, fontWeight: 600 }}>⚡ {urgentAnns} яаралтай зар идэвхтэй</span></>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Calendar size={14} style={{ color: COLOR.primary }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
            {new Date().toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </span>
        </div>
      </div>

      {/* ─── STATS GRID (6 cards) ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {stats.map(({ label, value, icon: Icon, color, sub, highlight, trend }, i) => (
          <div
            key={i}
            style={{
              ...card, padding: "20px 22px",
              transition: "all 0.3s",
              borderColor: highlight ? `${color}40` : "rgba(255,255,255,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = `${color}40`;
              e.currentTarget.style.boxShadow = `0 12px 28px ${color}15`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = highlight ? `${color}40` : "rgba(255,255,255,0.06)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: `${color}15`, border: `1px solid ${color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon size={20} style={{ color }} />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "white", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6, fontWeight: 500 }}>
              {label}
            </div>
            {sub && (
              <div
                style={{
                  fontSize: 10,
                  color: trend === false ? COLOR.danger : color,
                  marginTop: 8, fontWeight: 600,
                }}
              >
                {sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── CHARTS ROW ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: 20,
        }}
      >
        {/* Donut Chart */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>
              Зарлалуудын төлөв
            </h3>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Нийт {anns.length} зар
            </p>
          </div>

          {statusPie.length === 0 ? (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
              Зар байхгүй
            </div>
          ) : (
            <>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {statusPie.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8, color: "white", fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {statusPie.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                      <span style={{ color: "rgba(255,255,255,0.75)" }}>{s.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: "white" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Activity Area */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>
                14 хоногийн идэвхжил
              </h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                Шинэ зар үүсгэлт
              </p>
            </div>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 30,
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <ActivityIcon size={11} style={{ color: COLOR.primary }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: COLOR.primary }}>
                {days14.reduce((a, d) => a + d.anns, 0)} нийт
              </span>
            </div>
          </div>

          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={days14} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="annsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR.primary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLOR.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, color: "white", fontSize: 12,
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                />
                <Area type="monotone" dataKey="anns" stroke={COLOR.primary} strokeWidth={2.5} fill="url(#annsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── TENDER TYPE BREAKDOWN ─── */}
      <div style={{ ...card, padding: "20px 24px" }}>
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>
            Тендерийн төрлүүд
          </h3>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Нийт {anns.length} зарын тархалт
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {typeBreakdown.map(({ key, label, count, pct, color, icon: Icon }) => (
            <div
              key={key}
              style={{
                padding: "16px 18px", borderRadius: 16,
                background: `${color}08`, border: `1px solid ${color}25`,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color}50`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${color}25`)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: `${color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: "-0.02em" }}>
                  {pct}%
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                {count} зар
              </div>
              <div
                style={{
                  height: 4, background: "rgba(255,255,255,0.06)",
                  borderRadius: 30, overflow: "hidden", marginTop: 12,
                }}
              >
                <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RECENT + PENDING ROW ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Announcements */}
        <div style={{ ...card }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>
              Сүүлийн зарлалууд
            </h3>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Шинээр үүсгэсэн 5 зар
            </p>
          </div>
          <div style={{ padding: "8px 0", maxHeight: 320, overflowY: "auto" }}>
            {recentAnns.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                Зар байхгүй байна
              </div>
            ) : (
              recentAnns.map((a, i) => {
                const c = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const statusColor: Record<string, string> = {
                  published: COLOR.success,
                  draft: COLOR.warning,
                  closed: COLOR.muted,
                };
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 20px", transition: "background 0.2s", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: `${c}15`, border: `1px solid ${c}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={14} style={{ color: c }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12, fontWeight: 600,
                          color: "rgba(255,255,255,0.85)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                      >
                        {a.title}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {new Date(a.created_at).toLocaleDateString("mn-MN")}
                        {a.is_urgent && (
                          <span style={{ marginLeft: 8, color: COLOR.danger, fontWeight: 600 }}>
                            ⚡ Яаралтай
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: statusColor[a.status] || COLOR.muted,
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Review */}
        <div style={{ ...card }}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>
                Хүлээгдэж буй
              </h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                Шинэ хувь хүний бүртгэл
              </p>
            </div>
            {pendingCount > 0 && (
              <span
                style={{
                  fontSize: 11, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 30,
                  background: `${COLOR.warning}15`, color: COLOR.warning,
                  border: `1px solid ${COLOR.warning}30`,
                }}
              >
                {pendingCount}
              </span>
            )}
          </div>
          <div style={{ padding: "8px 0", maxHeight: 320, overflowY: "auto" }}>
            {persons.filter((p) => p.status === "pending").slice(0, 5).length === 0 ? (
              <div style={{ padding: 30, textAlign: "center" }}>
                <CheckCircle2 size={32} style={{ color: COLOR.success, opacity: 0.5, margin: "0 auto 8px" }} />
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  Бүгд хянагдсан байна
                </div>
              </div>
            ) : (
              persons.filter((p) => p.status === "pending").slice(0, 5).map((p, i) => {
                const c = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const nm = [p.last_name, p.first_name].filter(Boolean).join(" ") || p.email;
                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 20px", transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: `${c}15`, border: `1px solid ${c}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: c,
                        flexShrink: 0,
                      }}
                    >
                      {(p.first_name?.[0] ?? p.email[0]).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                        {nm}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {p.email}
                      </div>
                    </div>
                    <Clock size={12} style={{ color: COLOR.warning, flexShrink: 0 }} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}