"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, Bell, ChevronRight, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Loader2, Megaphone, User, Zap,
  LayoutDashboard, ArrowRight, Send,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string; desc: string }> = {
  active: { label: "Баталгаажсан", color: "#34d399", bg: "rgba(16,185,129,0.12)", dot: "#34d399", desc: "Бүртгэл баталгаажсан" },
  approved: { label: "Баталгаажсан", color: "#34d399", bg: "rgba(16,185,129,0.12)", dot: "#34d399", desc: "Бүртгэл баталгаажсан" },
  pending: { label: "Хянагдаж байна", color: "#fbbf24", bg: "rgba(245,158,11,0.12)", dot: "#fbbf24", desc: "Бүртгэл хянагдаж байна" },
  returned: { label: "Буцаагдсан", color: "#f87171", bg: "rgba(239,68,68,0.12)", dot: "#f87171", desc: "Мэдээллээ засах шаардлагатай" },
  rejected: { label: "Татгалзсан", color: "#fca5a5", bg: "rgba(239,68,68,0.12)", dot: "#f87171", desc: "Бүртгэл татгалзагдсан" },
};

const ANN_TYPE_CFG: Record<string, { color: string; emoji: string; label: string }> = {
  open: { color: "#60a5fa", emoji: "🌐", label: "Нээлттэй" },
  targeted: { color: "#a78bfa", emoji: "🔒", label: "Хаалттай" },
  rfq: { color: "#fbbf24", emoji: "📊", label: "Үнийн санал" },
};

function StatCard({ icon: Icon, label, value, color, href }: any) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
          borderRadius: 20, padding: "20px 22px",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer", height: "100%",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${color}15`;
          el.style.transform = "translateY(-2px)";
          el.style.borderColor = `${color}40`;
          el.style.background = "rgba(255,255,255,0.05)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
          el.style.transform = "translateY(0)";
          el.style.borderColor = "rgba(255,255,255,0.06)";
          el.style.background = "rgba(255,255,255,0.03)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div
            style={{
              width: 42, height: 42, borderRadius: 12,
              background: `${color}15`, border: `1px solid ${color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon size={20} style={{ color }} />
          </div>
          <ChevronRight size={14} style={{ color: "rgba(148,163,184,0.3)" }} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", marginTop: 6, fontWeight: 500 }}>{label}</div>
      </div>
    </Link>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 22, c = 2 * Math.PI * r;
  const color = pct >= 80 ? "#34d399" : pct >= 50 ? "#fbbf24" : "#818cf8";
  const glow = pct >= 80 ? "rgba(52,211,153,0.3)" : pct >= 50 ? "rgba(251,191,36,0.3)" : "rgba(129,140,248,0.3)";
  return (
    <svg width={60} height={60} viewBox="0 0 60 60">
      <circle cx={30} cy={30} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle cx={30} cy={30} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform="rotate(-90 30 30)"
        style={{ transition: "stroke-dasharray .8s ease", filter: `drop-shadow(0 0 4px ${glow})` }} />
      <text x={30} y={34} textAnchor="middle" fontSize={12} fontWeight={700} fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>
        {pct}%
      </text>
    </svg>
  );
}

export default function PersonDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [anns, setAnns] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!token) { router.push("/login"); return; }
    if (u) { try { setUser(JSON.parse(u)); } catch {} }

    const h = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/api/persons/me`, { headers: h }).then(r => r.json()),
      fetch(`${API}/api/announcements?status=published&limit=5`, { headers: h }).then(r => r.json()),
      fetch(`${API}/api/applications/mine?limit=50`, { headers: h }).then(r => r.json()),
      fetch(`${API}/api/notifications/mine`, { headers: h }).then(r => r.json()),
    ]).then(([me, annsD, appsD, notifsD]) => {
      if (me.success) {
        const fresh = me.person || me.user;
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const updated = { ...stored, ...fresh };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
      }
      if (annsD.success) setAnns(annsD.announcements ?? []);
      if (appsD.success) setApps(appsD.applications ?? []);
      if (notifsD.success) setNotifs(notifsD.notifications ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sc = STATUS_CFG[user?.status ?? "pending"] ?? STATUS_CFG.pending;
  const unread = notifs.filter(n => !n.is_read).length;
  const pending = apps.filter(a => a.status === "pending").length;
  const approved = apps.filter(a => a.status === "approved").length;
  const isReturned = user?.status === "returned";

  const pct = (() => {
    if (!user) return 0;
    const fields = [user.last_name, user.first_name, user.birth_date, user.gender,
      user.phone, user.aimag_niislel, user.sum_duureg];
    const extras = [
      user.activity_directions?.length > 0,
      !!user.profile_photo_url,
      !!user.id_card_front_url,
    ].filter(Boolean).length;
    return Math.round(((fields.filter(Boolean).length + extras) / (fields.length + 3)) * 100);
  })();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Өглөөний мэнд" : hour < 18 ? "Өдрийн мэнд" : "Оройн мэнд";

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
      <Loader2 size={24} style={{ color: "#a5b4fc", animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.1); } 50% { box-shadow: 0 0 40px rgba(99,102,241,0.2); } }
        * { box-sizing: border-box; }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
        }
        
        .main-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 1024px) {
          .main-content { grid-template-columns: 1fr 340px; gap: 24px; }
        }
      `}</style>

      {/* ── Hero ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
          borderRadius: 24, padding: "28px 32px",
          position: "relative", overflow: "hidden",
          animation: "fadeUp .4s ease",
          boxShadow: "0 8px 32px rgba(99,102,241,0.2)",
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -60, left: 100, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 68, height: 68, borderRadius: 20, overflow: "hidden",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, fontWeight: 800, color: "white",
                border: "3px solid rgba(255,255,255,0.15)",
                boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
              }}
            >
              {user?.profile_photo_url
                ? <img src={user.profile_photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : [user?.last_name?.[0], user?.first_name?.[0]].filter(Boolean).join("").toUpperCase() || "?"
              }
            </div>
            <div style={{
              position: "absolute", bottom: -2, right: -2, width: 18, height: 18,
              borderRadius: "50%", background: sc.dot, border: "3px solid #1e1b4b",
              boxShadow: `0 0 8px ${sc.dot}80`,
            }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4, fontWeight: 500 }}>
              {greeting} 👋
            </div>
            <h1 style={{
              fontSize: 24, fontWeight: 800, color: "white", margin: "0 0 8px",
              letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              {[user?.last_name, user?.first_name].filter(Boolean).join(" ") || "Нэр оруулаагүй"}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {user?.supplier_number && (
                <span style={{
                  fontSize: 11, padding: "4px 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  #{user.supplier_number}
                </span>
              )}
              <span style={{
                fontSize: 11, padding: "4px 14px", borderRadius: 99,
                background: sc.bg, color: sc.color, fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 6,
                border: `1px solid ${sc.color}30`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, boxShadow: `0 0 6px ${sc.dot}` }} />
                {sc.label}
              </span>
            </div>
          </div>

          {/* Progress ring */}
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <Ring pct={pct} />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: 500 }}>Анкет</div>
          </div>
        </div>

        {/* Returned warning */}
        {isReturned && (
          <div style={{
            marginTop: 20, padding: "14px 18px", borderRadius: 14,
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <AlertCircle size={18} style={{ color: "#f87171", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fca5a5" }}>Бүртгэл буцаагдсан — мэдээллээ засна уу</div>
              {user?.return_reason && (
                <div style={{ fontSize: 11, color: "rgba(252,165,165,0.7)", marginTop: 2 }}>{user.return_reason}</div>
              )}
            </div>
            <Link href="/dashboard/person/profile" style={{ textDecoration: "none", flexShrink: 0 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "8px 16px", borderRadius: 10,
                background: "rgba(239,68,68,0.2)", color: "#fca5a5",
                border: "1px solid rgba(239,68,68,0.3)", whiteSpace: "nowrap",
                cursor: "pointer",
              }}>
                Засах →
              </span>
            </Link>
          </div>
        )}

        {/* Incomplete profile warning */}
        {!isReturned && pct < 80 && (
          <div style={{
            marginTop: 20, padding: "14px 18px", borderRadius: 14,
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <Zap size={16} style={{ color: "#fbbf24", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fde68a" }}>Анкетаа {100 - pct}% бөглөх шаардлагатай</div>
              <div style={{ fontSize: 11, color: "rgba(253,230,138,0.6)", marginTop: 2 }}>Бүрэн бөглөсөн анкет илүү хурдан батлагдана</div>
            </div>
            <Link href="/dashboard/person/profile" style={{ textDecoration: "none", flexShrink: 0 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "8px 16px", borderRadius: 10,
                background: "rgba(245,158,11,0.2)", color: "#fde68a",
                border: "1px solid rgba(245,158,11,0.3)", whiteSpace: "nowrap",
                cursor: "pointer",
              }}>
                Бөглөх →
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Stats Grid ── */}
      <div className="stats-grid">
        <StatCard icon={Megaphone} label="Нийт зарлал" value={anns.length} color="#60a5fa" href="/dashboard/person/announcements" />
        <StatCard icon={FileText} label="Нийт хүсэлт" value={apps.length} color="#a78bfa" href="/dashboard/person/applications" />
        <StatCard icon={Clock} label="Хүлээгдэж буй" value={pending} color="#fbbf24" href="/dashboard/person/applications" />
        <StatCard icon={Bell} label="Уншаагүй мэдэгдэл" value={unread} color="#34d399" href="/dashboard/person/notifications" />
      </div>

      {/* ── Main Content ── */}
      <div className="main-content">
        {/* Recent Announcements */}
        <div style={{
          background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
          borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)", overflow: "hidden",
        }}>
          <div style={{
            padding: "22px 24px 18px", display: "flex", alignItems: "center",
            justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)",
            flexWrap: "wrap", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Megaphone size={16} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Сүүлийн зарлалууд</div>
                <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)" }}>Нийтлэгдсэн тендерүүд</div>
              </div>
            </div>
            <Link href="/dashboard/person/announcements"
              style={{
                fontSize: 12, fontWeight: 600, color: "#a5b4fc", textDecoration: "none",
                padding: "8px 14px", borderRadius: 10, background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)", whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              Бүгдийг харах <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ padding: "4px 0" }}>
            {anns.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <Megaphone size={32} style={{ color: "rgba(148,163,184,0.15)", display: "block", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, color: "rgba(148,163,184,0.4)", margin: 0 }}>Одоогоор зарлал байхгүй</p>
              </div>
            ) : anns.slice(0, 5).map((a, i) => {
              const tc = ANN_TYPE_CFG[a.ann_type] ?? ANN_TYPE_CFG.open;
              const exp = a.deadline && new Date(a.deadline) < new Date();
              return (
                <Link key={a.id} href="/dashboard/person/announcements" style={{ textDecoration: "none", display: "block" }}>
                  <div
                    style={{
                      padding: "14px 24px", display: "flex", alignItems: "center", gap: 14,
                      borderBottom: i < Math.min(anns.length, 5) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      transition: "background 0.15s", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: `${tc.color}15`, border: `1px solid ${tc.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                    }}>
                      {tc.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6,
                      }}>
                        {a.title}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                          background: `${tc.color}15`, color: tc.color,
                        }}>
                          {tc.label}
                        </span>
                        {a.deadline && (
                          <span style={{
                            fontSize: 10, color: exp ? "#f87171" : "rgba(148,163,184,0.5)",
                            display: "flex", alignItems: "center", gap: 4,
                          }}>
                            <Clock size={10} />
                            {new Date(a.deadline).toLocaleDateString("mn-MN")}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={15} style={{ color: "rgba(148,163,184,0.2)", flexShrink: 0 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick Actions */}
          <div style={{
            background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
            borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)", overflow: "hidden",
          }}>
            <div style={{
              padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Хурдан үйлдэл</div>
            </div>
            <div style={{ padding: "8px 10px" }}>
              {[
                { href: "/dashboard/person/profile", icon: "👤", label: "Профайл засах", sub: "Мэдээлэл шинэчлэх", color: "#a78bfa" },
                { href: "/dashboard/person/announcements", icon: "📢", label: "Зарлалууд үзэх", sub: "Тендер хайх", color: "#60a5fa" },
                { href: "/dashboard/person/applications", icon: "📋", label: "Хүсэлтүүд", sub: "Явцыг шалгах", color: "#fbbf24" },
                { href: "/dashboard/person/notifications", icon: "🔔", label: "Мэдэгдэл", sub: `${unread} уншаагүй`, color: "#34d399" },
              ].map(({ href, icon, label, sub, color }) => (
                <Link key={href} href={href} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                      borderRadius: 12, transition: "background 0.15s", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                      background: `${color}15`, border: `1px solid ${color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{label}</div>
                      <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 2 }}>{sub}</div>
                    </div>
                    <ChevronRight size={14} style={{ color: "rgba(148,163,184,0.2)", flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Application Status Summary */}
          <div style={{
            background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)",
            borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)", padding: "20px",
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <TrendingUp size={16} style={{ color: "#a5b4fc" }} /> Хүсэлтийн статус
            </div>
            {apps.length === 0 ? (
              <p style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", margin: 0, textAlign: "center", padding: "16px 0" }}>
                Хүсэлт байхгүй байна
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Хүлээгдэж буй", count: pending, color: "#fbbf24", bg: "rgba(245,158,11,0.08)" },
                  { label: "Баталгаажсан", count: approved, color: "#34d399", bg: "rgba(16,185,129,0.08)" },
                  { label: "Татгалзсан", count: apps.filter(a => a.status === "rejected").length, color: "#f87171", bg: "rgba(239,68,68,0.08)" },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 12,
                    background: bg, border: `1px solid ${color}20`,
                  }}>
                    <span style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}