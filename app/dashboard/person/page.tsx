"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, Bell, ChevronRight, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Loader2, Megaphone, User, Zap,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_CFG: Record<string,{label:string;color:string;bg:string;dot:string;desc:string}> = {
  active:   { label:"Баталгаажсан",  color:"#059669", bg:"#ecfdf5", dot:"#10b981", desc:"Бүртгэл баталгаажсан" },
  approved: { label:"Баталгаажсан",  color:"#059669", bg:"#ecfdf5", dot:"#10b981", desc:"Бүртгэл баталгаажсан" },
  pending:  { label:"Хянагдаж байна",color:"#d97706", bg:"#fffbeb", dot:"#f59e0b", desc:"Бүртгэл хянагдаж байна" },
  returned: { label:"Буцаагдсан",    color:"#dc2626", bg:"#fef2f2", dot:"#ef4444", desc:"Мэдээллээ засах шаардлагатай" },
  rejected: { label:"Татгалзсан",    color:"#7f1d1d", bg:"#fef2f2", dot:"#dc2626", desc:"Бүртгэл татгалзагдсан" },
};

const ANN_TYPE_CFG: Record<string,{color:string;emoji:string;label:string}> = {
  open:     { color:"#3b82f6", emoji:"🌐", label:"Нээлттэй" },
  targeted: { color:"#8b5cf6", emoji:"🔒", label:"Хаалттай" },
  rfq:      { color:"#f59e0b", emoji:"📊", label:"Үнийн санал" },
};

function StatCard({ icon, label, value, color, href }: any) {
  return (
    <Link href={href} style={{ textDecoration:"none", display: "block", height: "100%" }}>
      <div style={{ background:"white",borderRadius:18,padding:"clamp(14px, 4vw, 20px) clamp(16px, 4vw, 22px)",
        border:"1px solid #f1f5f9",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
        transition:"all .15s",cursor:"pointer", height: "100%" }}
        onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow="0 8px 24px rgba(0,0,0,0.08)"; el.style.transform="translateY(-2px)"; }}
        onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; el.style.transform="translateY(0)"; }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <div style={{ width:"clamp(36px, 8vw, 40px)",height:"clamp(36px, 8vw, 40px)",borderRadius:12,
            background:`${color}15`,border:`1px solid ${color}25`,
            display:"flex",alignItems:"center",justifyContent:"center" }}>
            {icon}
          </div>
          <ChevronRight size={14} style={{ color:"#cbd5e1" }}/>
        </div>
        <div style={{ fontSize:"clamp(22px, 6vw, 26px)",fontWeight:800,color:"#0f172a",letterSpacing:"-0.03em",lineHeight:1 }}>
          {value}
        </div>
        <div style={{ fontSize:"clamp(11px, 3vw, 12px)",color:"#94a3b8",marginTop:5,fontWeight:500 }}>{label}</div>
      </div>
    </Link>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 22, c = 2*Math.PI*r;
  const color = pct>=80?"#10b981":pct>=50?"#f59e0b":"#6366f1";
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" style={{ width: "clamp(48px, 10vw, 56px)", height: "auto" }}>
      <circle cx={28} cy={28} r={r} fill="none" stroke="#f1f5f9" strokeWidth={4}/>
      <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${(pct/100)*c} ${c}`}
        transform="rotate(-90 28 28)"
        style={{ transition:"stroke-dasharray .8s ease" }}/>
      <text x={28} y={32} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

export default function PersonDashboard() {
  const router = useRouter();
  const [user,     setUser]     = useState<any>(null);
  const [anns,     setAnns]     = useState<any[]>([]);
  const [apps,     setApps]     = useState<any[]>([]);
  const [notifs,   setNotifs]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u     = localStorage.getItem("user");
    if (!token) { router.push("/login"); return; }
    if (u) { try { setUser(JSON.parse(u)); } catch {} }

    const h = { Authorization:`Bearer ${token}` };

    Promise.all([
      fetch(`${API}/api/persons/me`,                              { headers:h }).then(r=>r.json()),
      fetch(`${API}/api/announcements?status=published&limit=5`, { headers:h }).then(r=>r.json()),
      fetch(`${API}/api/applications/mine?limit=50`,             { headers:h }).then(r=>r.json()),
      fetch(`${API}/api/notifications/mine`,                     { headers:h }).then(r=>r.json()),
    ]).then(([me, annsD, appsD, notifsD]) => {
      if (me.success) {
        const fresh = me.person || me.user;
        const stored = JSON.parse(localStorage.getItem("user")||"{}");
        const updated = { ...stored, ...fresh };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
      }
      if (annsD.success)   setAnns(annsD.announcements ?? []);
      if (appsD.success)   setApps(appsD.applications  ?? []);
      if (notifsD.success) setNotifs(notifsD.notifications ?? []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const sc       = STATUS_CFG[user?.status ?? "pending"] ?? STATUS_CFG.pending;
  const unread   = notifs.filter(n => !n.is_read).length;
  const pending  = apps.filter(a => a.status === "pending").length;
  const approved = apps.filter(a => a.status === "approved").length;
  const isReturned = user?.status === "returned";

  const pct = (() => {
    if (!user) return 0;
    const fields = [user.last_name,user.first_name,user.birth_date,user.gender,
      user.phone,user.aimag_niislel,user.sum_duureg];
    const extras = [
      user.activity_directions?.length > 0,
      !!user.profile_photo_url,
      !!user.id_card_front_url,
    ].filter(Boolean).length;
    return Math.round(((fields.filter(Boolean).length+extras)/(fields.length+3))*100);
  })();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Өглөөний мэнд" : hour < 18 ? "Өдрийн мэнд" : "Оройн мэнд";

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:10 }}>
      <Loader2 size={20} style={{ color:"#6366f1",animation:"spin .8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth:"100%",margin:"0 auto",padding:"clamp(16px, 4vw, 24px) clamp(12px, 4vw, 20px) 48px",
      display:"flex",flexDirection:"column",gap:"clamp(16px, 4vw, 20px)" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        
        /* ✅ Responsive grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        
        @media (min-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }
        
        /* ✅ Main content layout */
        .main-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        @media (min-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr 340px;
            gap: 24px;
          }
        }
        
        /* ✅ Hero section responsive */
        .hero-section {
          background: linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%);
          border-radius: clamp(20px, 5vw, 24px);
          padding: clamp(20px, 5vw, 28px) clamp(20px, 5vw, 32px);
          position: relative;
          overflow: hidden;
          animation: fadeUp .4s ease;
        }
        
        .hero-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        @media (min-width: 768px) {
          .hero-content {
            flex-wrap: nowrap;
          }
        }
        
        .avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }
        
        .avatar {
          width: clamp(56px, 12vw, 64px);
          height: clamp(56px, 12vw, 64px);
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(20px, 5vw, 24px);
          font-weight: 800;
          color: white;
          border: 3px solid rgba(255,255,255,0.15);
        }
        
        .hero-info {
          flex: 1;
          min-width: 0;
        }
        
        .hero-name {
          font-size: clamp(18px, 5vw, 22px);
          font-weight: 800;
          color: white;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
          line-height: 1.2;
          word-break: break-word;
        }
        
        /* ✅ Quick actions responsive */
        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .quick-action-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 10px;
          border-radius: 12px;
          transition: background .12s;
          cursor: pointer;
        }
        
        /* ✅ Announcement list item */
        .announcement-item {
          padding: clamp(12px, 3vw, 14px) clamp(16px, 4vw, 22px);
          display: flex;
          align-items: center;
          gap: 12px;
          transition: background .1s;
          cursor: pointer;
        }
        
        @media (min-width: 640px) {
          .announcement-item {
            gap: 14px;
          }
        }
        
        /* ✅ Warning banners responsive */
        .warning-banner {
          margin-top: 18px;
          padding: 12px 16px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        @media (min-width: 640px) {
          .warning-banner {
            flex-wrap: nowrap;
          }
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="hero-section">
        <div style={{ position:"absolute",top:-40,right:-40,width:200,height:200,
          borderRadius:"50%",background:"rgba(255,255,255,0.03)" }}/>
        <div style={{ position:"absolute",bottom:-60,left:100,width:280,height:280,
          borderRadius:"50%",background:"rgba(255,255,255,0.02)" }}/>

        <div className="hero-content">
          {/* Avatar */}
          <div className="avatar-wrapper">
            <div className="avatar">
              {user?.profile_photo_url
                ? <img src={user.profile_photo_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                : [user?.last_name?.[0],user?.first_name?.[0]].filter(Boolean).join("").toUpperCase()||"?"
              }
            </div>
            <div style={{ position:"absolute",bottom:-2,right:-2,width:16,height:16,
              borderRadius:"50%",background:sc.dot,border:"2px solid #1e1b4b" }}/>
          </div>

          {/* Info */}
          <div className="hero-info">
            <div style={{ fontSize:"clamp(11px, 3vw, 12px)",color:"rgba(255,255,255,0.5)",marginBottom:3,fontWeight:500 }}>
              {greeting} 👋
            </div>
            <h1 className="hero-name">
              {[user?.last_name,user?.first_name].filter(Boolean).join(" ") || "Нэр оруулаагүй"}
            </h1>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
              {user?.supplier_number && (
                <span style={{ fontSize:"clamp(10px, 2.5vw, 11px)",padding:"3px 10px",borderRadius:8,
                  background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",
                  fontFamily:"monospace" }}>
                  {user.supplier_number}
                </span>
              )}
              <span style={{ fontSize:"clamp(10px, 2.5vw, 11px)",padding:"3px 10px",borderRadius:99,
                background:sc.bg,color:sc.color,fontWeight:700,
                display:"inline-flex",alignItems:"center",gap:5 }}>
                <span style={{ width:5,height:5,borderRadius:"50%",background:sc.dot }}/>
                {sc.label}
              </span>
            </div>
          </div>

          {/* Progress ring */}
          <div style={{ flexShrink:0,textAlign:"center" }}>
            <Ring pct={pct}/>
            <div style={{ fontSize:"clamp(9px, 2vw, 10px)",color:"rgba(255,255,255,0.4)",marginTop:4,fontWeight:500 }}>
              Анкет
            </div>
          </div>
        </div>

        {/* Буцаагдсан warning */}
        {isReturned && (
          <div className="warning-banner" style={{ background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle size={16} style={{ color:"#f87171",flexShrink:0 }}/>
            <div style={{ flex:1, minWidth: 0 }}>
              <div style={{ fontSize:"clamp(11px, 3vw, 12px)",fontWeight:700,color:"#fca5a5" }}>
                Бүртгэл буцаагдсан — мэдээллээ засна уу
              </div>
              {user?.return_reason && (
                <div style={{ fontSize:"clamp(10px, 2.5vw, 11px)",color:"rgba(252,165,165,0.7)",marginTop:2 }}>
                  {user.return_reason}
                </div>
              )}
            </div>
            <Link href="/dashboard/person/profile" style={{ textDecoration:"none", flexShrink: 0 }}>
              <span style={{ fontSize:"clamp(10px, 2.5vw, 11px)",fontWeight:700,padding:"6px 14px",borderRadius:99,
                background:"rgba(239,68,68,0.25)",color:"#fca5a5",
                border:"1px solid rgba(239,68,68,0.3)",whiteSpace:"nowrap" }}>
                Засах →
              </span>
            </Link>
          </div>
        )}

        {/* Профайл дутуу */}
        {!isReturned && pct < 80 && (
          <div className="warning-banner" style={{ background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.25)" }}>
            <Zap size={15} style={{ color:"#fbbf24",flexShrink:0 }}/>
            <div style={{ flex:1, minWidth: 0 }}>
              <div style={{ fontSize:"clamp(11px, 3vw, 12px)",fontWeight:700,color:"#fde68a" }}>
                Анкетаа {100-pct}% бөглөх шаардлагатай
              </div>
              <div style={{ fontSize:"clamp(10px, 2.5vw, 11px)",color:"rgba(253,230,138,0.6)",marginTop:1 }}>
                Бүрэн бөглөсөн анкет илүү хурдан батлагдана
              </div>
            </div>
            <Link href="/dashboard/person/profile" style={{ textDecoration:"none", flexShrink: 0 }}>
              <span style={{ fontSize:"clamp(10px, 2.5vw, 11px)",fontWeight:700,padding:"8px 14px",borderRadius:99,
                background:"rgba(245,158,11,0.2)",color:"#fde68a",
                border:"1px solid rgba(245,158,11,0.3)",whiteSpace:"nowrap" }}>
                Бөглөх →
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Stats Grid (responsive) ── */}
      <div className="stats-grid">
        <StatCard icon={<Megaphone size={18} style={{ color:"#3b82f6" }}/>}
          label="Нийт зарлал" value={anns.length} color="#3b82f6"
          href="/dashboard/person/announcements"/>
        <StatCard icon={<FileText size={18} style={{ color:"#6366f1" }}/>}
          label="Нийт хүсэлт" value={apps.length} color="#6366f1"
          href="/dashboard/person/applications"/>
        <StatCard icon={<Clock size={18} style={{ color:"#f59e0b" }}/>}
          label="Хүлээгдэж буй" value={pending} color="#f59e0b"
          href="/dashboard/person/applications"/>
        <StatCard icon={<Bell size={18} style={{ color:"#10b981" }}/>}
          label="Уншаагүй мэдэгдэл" value={unread} color="#10b981"
          href="/dashboard/person/notifications"/>
      </div>

      {/* ── Main content (responsive 1 column on mobile, 2 on desktop) ── */}
      <div className="main-content">

        {/* Сүүлийн зарлалууд */}
        <div style={{ background:"white",borderRadius:20,border:"1px solid #f1f5f9",
          boxShadow:"0 1px 4px rgba(0,0,0,0.04)",overflow:"hidden" }}>
          <div style={{ padding:"clamp(16px, 4vw, 20px) clamp(16px, 4vw, 22px) 16px",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            borderBottom:"1px solid #f8fafc", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:34,height:34,borderRadius:10,
                background:"#eff6ff",border:"1px solid #bfdbfe",
                display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Megaphone size={15} style={{ color:"#3b82f6" }}/>
              </div>
              <div>
                <div style={{ fontSize:"clamp(13px, 4vw, 14px)",fontWeight:700,color:"#0f172a" }}>Сүүлийн зарлалууд</div>
                <div style={{ fontSize:"clamp(10px, 3vw, 11px)",color:"#94a3b8" }}>Нийтлэгдсэн тендерүүд</div>
              </div>
            </div>
            <Link href="/dashboard/person/announcements"
              style={{ fontSize:"clamp(11px, 3vw, 12px)",fontWeight:600,color:"#6366f1",textDecoration:"none",
                padding:"6px 12px",borderRadius:8,background:"#eef2ff",
                border:"1px solid #c7d2fe", whiteSpace: "nowrap" }}>
              Бүгдийг харах
            </Link>
          </div>

          <div style={{ padding:"8px 0" }}>
            {anns.length === 0 ? (
              <div style={{ padding:"32px 22px",textAlign:"center" }}>
                <Megaphone size={28} style={{ color:"#e2e8f0",display:"block",margin:"0 auto 10px" }}/>
                <p style={{ fontSize:13,color:"#cbd5e1",margin:0 }}>Одоогоор зарлал байхгүй</p>
              </div>
            ) : anns.slice(0,5).map((a, i) => {
              const tc = ANN_TYPE_CFG[a.ann_type] ?? ANN_TYPE_CFG.open;
              const exp = a.deadline && new Date(a.deadline) < new Date();
              return (
                <Link key={a.id} href="/dashboard/person/announcements"
                  style={{ textDecoration:"none",display:"block" }}>
                  <div className="announcement-item"
                    style={{ borderBottom: i < Math.min(anns.length,5)-1 ? "1px solid #f8fafc" : "none" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#f8fafc"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}>
                    <div style={{ width:"clamp(36px, 8vw, 40px)",height:"clamp(36px, 8vw, 40px)",borderRadius:12,flexShrink:0,
                      background:`${tc.color}12`,border:`1px solid ${tc.color}22`,
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(16px, 4vw, 18px)" }}>
                      {tc.emoji}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:"clamp(12px, 3.5vw, 13px)",fontWeight:600,color:"#0f172a",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                        marginBottom:4 }}>
                        {a.title}
                      </div>
                      <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                        <span style={{ fontSize:"clamp(9px, 2.5vw, 10px)",fontWeight:600,padding:"2px 7px",borderRadius:99,
                          background:`${tc.color}12`,color:tc.color }}>
                          {tc.label}
                        </span>
                        {a.deadline && (
                          <span style={{ fontSize:"clamp(9px, 2.5vw, 10px)",color:exp?"#ef4444":"#94a3b8",
                            display:"flex",alignItems:"center",gap:3 }}>
                            <Clock size={9}/>
                            {new Date(a.deadline).toLocaleDateString("mn-MN")}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color:"#e2e8f0",flexShrink:0 }}/>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Баруун дэд хэсэг */}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

          {/* Quick actions */}
          <div style={{ background:"white",borderRadius:20,border:"1px solid #f1f5f9",
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)",overflow:"hidden" }}>
            <div style={{ padding:"clamp(14px, 4vw, 16px) clamp(14px, 4vw, 18px) 12px",borderBottom:"1px solid #f8fafc" }}>
              <div style={{ fontSize:"clamp(13px, 4vw, 14px)",fontWeight:700,color:"#0f172a" }}>Хурдан үйлдэл</div>
            </div>
            <div style={{ padding:"10px" }}>
              {[
                { href:"/dashboard/person/profile",       icon:"👤", label:"Профайл засах",      sub:"Мэдээлэл шинэчлэх",  color:"#6366f1" },
                { href:"/dashboard/person/announcements", icon:"📢", label:"Зарлалууд үзэх",     sub:"Тендер хайх",         color:"#3b82f6" },
                { href:"/dashboard/person/applications",  icon:"📋", label:"Хүсэлтүүд",          sub:"Явцыг шалгах",        color:"#f59e0b" },
                { href:"/dashboard/person/notifications", icon:"🔔", label:"Мэдэгдэл",           sub:`${unread} уншаагүй`, color:"#10b981" },
              ].map(({ href, icon, label, sub, color }) => (
                <Link key={href} href={href} style={{ textDecoration:"none",display:"block" }}>
                  <div className="quick-action-item"
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#f8fafc"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}>
                    <div style={{ width:"clamp(32px, 7vw, 36px)",height:"clamp(32px, 7vw, 36px)",borderRadius:10,flexShrink:0,
                      background:`${color}12`,border:`1px solid ${color}22`,
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(14px, 3.5vw, 16px)" }}>
                      {icon}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:"clamp(12px, 3.5vw, 13px)",fontWeight:600,color:"#0f172a" }}>{label}</div>
                      <div style={{ fontSize:"clamp(10px, 2.5vw, 11px)",color:"#94a3b8",marginTop:1 }}>{sub}</div>
                    </div>
                    <ChevronRight size={13} style={{ color:"#e2e8f0",flexShrink:0 }}/>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Хүсэлтийн хураангуй */}
          <div style={{ background:"white",borderRadius:20,border:"1px solid #f1f5f9",
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)",padding:"clamp(14px, 4vw, 18px) clamp(16px, 4vw, 20px)" }}>
            <div style={{ fontSize:"clamp(13px, 4vw, 14px)",fontWeight:700,color:"#0f172a",marginBottom:14,
              display:"flex",alignItems:"center",gap:8 }}>
              <TrendingUp size={15} style={{ color:"#6366f1" }}/> Хүсэлтийн статус
            </div>
            {apps.length === 0 ? (
              <p style={{ fontSize:"clamp(11px, 3vw, 12px)",color:"#cbd5e1",margin:0,textAlign:"center",
                padding:"12px 0" }}>
                Хүсэлт байхгүй байна
              </p>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {[
                  { label:"Хүлээгдэж буй", count:pending,  color:"#f59e0b", bg:"#fffbeb" },
                  { label:"Баталгаажсан",  count:approved, color:"#059669", bg:"#ecfdf5" },
                  { label:"Татгалзсан",    count:apps.filter(a=>a.status==="rejected").length, color:"#dc2626", bg:"#fef2f2" },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} style={{ display:"flex",alignItems:"center",
                    justifyContent:"space-between",padding:"clamp(8px, 2.5vw, 9px) 12px",borderRadius:10,
                    background:bg,border:`1px solid ${color}22` }}>
                    <span style={{ fontSize:"clamp(11px, 3vw, 12px)",color,fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:"clamp(14px, 4vw, 16px)",fontWeight:800,color }}>{count}</span>
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