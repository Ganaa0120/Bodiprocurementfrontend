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
    <Link href={href} style={{ textDecoration:"none" }}>
      <div style={{ background:"white",borderRadius:18,padding:"20px 22px",
        border:"1px solid #f1f5f9",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
        transition:"all .15s",cursor:"pointer" }}
        onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow="0 8px 24px rgba(0,0,0,0.08)"; el.style.transform="translateY(-2px)"; }}
        onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; el.style.transform="translateY(0)"; }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <div style={{ width:40,height:40,borderRadius:12,
            background:`${color}15`,border:`1px solid ${color}25`,
            display:"flex",alignItems:"center",justifyContent:"center" }}>
            {icon}
          </div>
          <ChevronRight size={14} style={{ color:"#cbd5e1" }}/>
        </div>
        <div style={{ fontSize:26,fontWeight:800,color:"#0f172a",letterSpacing:"-0.03em",lineHeight:1 }}>
          {value}
        </div>
        <div style={{ fontSize:12,color:"#94a3b8",marginTop:5,fontWeight:500 }}>{label}</div>
      </div>
    </Link>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 22, c = 2*Math.PI*r;
  const color = pct>=80?"#10b981":pct>=50?"#f59e0b":"#6366f1";
  return (
    <svg width={56} height={56} viewBox="0 0 56 56">
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
    <div style={{ maxWidth:"100%",margin:"0 auto",padding:"24px 20px 48px",
      display:"flex",flexDirection:"column",gap:20 }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
      `}</style>

      {/* ── Hero ── */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)",
        borderRadius:24,padding:"28px 32px",position:"relative",overflow:"hidden",
        animation:"fadeUp .4s ease" }}>

        {/* декор цэгүүд */}
        <div style={{ position:"absolute",top:-40,right:-40,width:200,height:200,
          borderRadius:"50%",background:"rgba(255,255,255,0.03)" }}/>
        <div style={{ position:"absolute",bottom:-60,left:100,width:280,height:280,
          borderRadius:"50%",background:"rgba(255,255,255,0.02)" }}/>

        <div style={{ position:"relative",display:"flex",alignItems:"center",
          gap:20,flexWrap:"wrap" as const }}>
          {/* Avatar */}
          <div style={{ position:"relative",flexShrink:0 }}>
            <div style={{ width:64,height:64,borderRadius:20,overflow:"hidden",
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:24,fontWeight:800,color:"white",
              border:"3px solid rgba(255,255,255,0.15)" }}>
              {user?.profile_photo_url
                ? <img src={user.profile_photo_url} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                : [user?.last_name?.[0],user?.first_name?.[0]].filter(Boolean).join("").toUpperCase()||"?"
              }
            </div>
            <div style={{ position:"absolute",bottom:-2,right:-2,width:16,height:16,
              borderRadius:"50%",background:sc.dot,border:"2px solid #1e1b4b" }}/>
          </div>

          {/* Info */}
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:3,fontWeight:500 }}>
              {greeting} 👋
            </div>
            <h1 style={{ fontSize:22,fontWeight:800,color:"white",margin:"0 0 6px",
              letterSpacing:"-0.02em",lineHeight:1.2 }}>
              {[user?.last_name,user?.first_name].filter(Boolean).join(" ") || "Нэр оруулаагүй"}
            </h1>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" as const,alignItems:"center" }}>
              {user?.supplier_number && (
                <span style={{ fontSize:11,padding:"3px 10px",borderRadius:8,
                  background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)",
                  fontFamily:"monospace" }}>
                  {user.supplier_number}
                </span>
              )}
              <span style={{ fontSize:11,padding:"3px 10px",borderRadius:99,
                background:sc.bg,color:sc.color,fontWeight:700,
                display:"inline-flex",alignItems:"center",gap:5 }}>
                <span style={{ width:5,height:5,borderRadius:"50%",background:sc.dot }}/>
                {sc.label}
              </span>
            </div>
          </div>

          {/* Progress ring */}
          <div style={{ flexShrink:0,textAlign:"center" as const }}>
            <Ring pct={pct}/>
            <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:4,fontWeight:500 }}>
              Анкет
            </div>
          </div>
        </div>

        {/* Буцаагдсан warning */}
        {isReturned && (
          <div style={{ marginTop:18,padding:"12px 16px",borderRadius:14,
            background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",
            display:"flex",alignItems:"center",gap:10 }}>
            <AlertCircle size={16} style={{ color:"#f87171",flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12,fontWeight:700,color:"#fca5a5" }}>
                Бүртгэл буцаагдсан — мэдээллээ засна уу
              </div>
              {user?.return_reason && (
                <div style={{ fontSize:11,color:"rgba(252,165,165,0.7)",marginTop:2 }}>
                  {user.return_reason}
                </div>
              )}
            </div>
            <Link href="/dashboard/person/profile" style={{ textDecoration:"none" }}>
              <span style={{ fontSize:11,fontWeight:700,padding:"6px 14px",borderRadius:99,
                background:"rgba(239,68,68,0.25)",color:"#fca5a5",
                border:"1px solid rgba(239,68,68,0.3)",whiteSpace:"nowrap" as const }}>
                Засах →
              </span>
            </Link>
          </div>
        )}

        {/* Профайл дутуу */}
        {!isReturned && pct < 80 && (
          <div style={{ marginTop:18,padding:"12px 16px",borderRadius:14,
            background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.25)",
            display:"flex",alignItems:"center",gap:10 }}>
            <Zap size={15} style={{ color:"#fbbf24",flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12,fontWeight:700,color:"#fde68a" }}>
                Анкетаа {100-pct}% бөглөх шаардлагатай
              </div>
              <div style={{ fontSize:11,color:"rgba(253,230,138,0.6)",marginTop:1 }}>
                Бүрэн бөглөсөн анкет илүү хурдан батлагдана
              </div>
            </div>
            <Link href="/dashboard/person/profile" style={{ textDecoration:"none" }}>
              <span style={{ fontSize:11,fontWeight:700,padding:"8px 14px",borderRadius:99,
                background:"rgba(245,158,11,0.2)",color:"#fde68a",
                border:"1px solid rgba(245,158,11,0.3)",whiteSpace:"nowrap" as const }}>
                Бөглөх →
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,
        animation:"fadeUp .5s ease" }}>
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

      {/* ── Main content ── */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 340px",gap:16,
        animation:"fadeUp .6s ease" }}>

        {/* Сүүлийн зарлалууд */}
        <div style={{ background:"white",borderRadius:20,border:"1px solid #f1f5f9",
          boxShadow:"0 1px 4px rgba(0,0,0,0.04)",overflow:"hidden" }}>
          <div style={{ padding:"20px 22px 16px",display:"flex",
            alignItems:"center",justifyContent:"space-between",
            borderBottom:"1px solid #f8fafc" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:34,height:34,borderRadius:10,
                background:"#eff6ff",border:"1px solid #bfdbfe",
                display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Megaphone size={15} style={{ color:"#3b82f6" }}/>
              </div>
              <div>
                <div style={{ fontSize:14,fontWeight:700,color:"#0f172a" }}>Сүүлийн зарлалууд</div>
                <div style={{ fontSize:11,color:"#94a3b8" }}>Нийтлэгдсэн тендерүүд</div>
              </div>
            </div>
            <Link href="/dashboard/person/announcements"
              style={{ fontSize:12,fontWeight:600,color:"#6366f1",textDecoration:"none",
                padding:"6px 12px",borderRadius:8,background:"#eef2ff",
                border:"1px solid #c7d2fe" }}>
              Бүгдийг харах
            </Link>
          </div>

          <div style={{ padding:"8px 0" }}>
            {anns.length === 0 ? (
              <div style={{ padding:"32px 22px",textAlign:"center" as const }}>
                <Megaphone size={28} style={{ color:"#e2e8f0",display:"block",margin:"0 auto 10px" }}/>
                <p style={{ fontSize:13,color:"#cbd5e1",margin:0 }}>Одоогоор зарлал байхгүй</p>
              </div>
            ) : anns.slice(0,5).map((a, i) => {
              const tc = ANN_TYPE_CFG[a.ann_type] ?? ANN_TYPE_CFG.open;
              const exp = a.deadline && new Date(a.deadline) < new Date();
              return (
                <Link key={a.id} href="/dashboard/person/announcements"
                  style={{ textDecoration:"none",display:"block" }}>
                  <div style={{ padding:"14px 22px",display:"flex",alignItems:"center",gap:14,
                    borderBottom: i < Math.min(anns.length,5)-1 ? "1px solid #f8fafc" : "none",
                    transition:"background .1s",cursor:"pointer" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#f8fafc"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}>
                    <div style={{ width:40,height:40,borderRadius:12,flexShrink:0,
                      background:`${tc.color}12`,border:`1px solid ${tc.color}22`,
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>
                      {tc.emoji}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const,
                        marginBottom:4 }}>
                        {a.title}
                      </div>
                      <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                        <span style={{ fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99,
                          background:`${tc.color}12`,color:tc.color }}>
                          {tc.label}
                        </span>
                        {a.deadline && (
                          <span style={{ fontSize:10,color:exp?"#ef4444":"#94a3b8",
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
        <div style={{ display:"flex",flexDirection:"column" as const,gap:14 }}>

          {/* Quick actions */}
          <div style={{ background:"white",borderRadius:20,border:"1px solid #f1f5f9",
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)",overflow:"hidden" }}>
            <div style={{ padding:"16px 18px 12px",borderBottom:"1px solid #f8fafc" }}>
              <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>Хурдан үйлдэл</div>
            </div>
            <div style={{ padding:"10px" }}>
              {[
                { href:"/dashboard/person/profile",       icon:"👤", label:"Профайл засах",      sub:"Мэдээлэл шинэчлэх",  color:"#6366f1" },
                { href:"/dashboard/person/announcements", icon:"📢", label:"Зарлалууд үзэх",     sub:"Тендер хайх",         color:"#3b82f6" },
                { href:"/dashboard/person/applications",  icon:"📋", label:"Хүсэлтүүд",          sub:"Явцыг шалгах",        color:"#f59e0b" },
                { href:"/dashboard/person/notifications", icon:"🔔", label:"Мэдэгдэл",           sub:`${unread} уншаагүй`, color:"#10b981" },
              ].map(({ href, icon, label, sub, color }) => (
                <Link key={href} href={href} style={{ textDecoration:"none",display:"block" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 10px",
                    borderRadius:12,transition:"background .12s",cursor:"pointer" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#f8fafc"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}>
                    <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,
                      background:`${color}12`,border:`1px solid ${color}22`,
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>
                      {icon}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:"#0f172a" }}>{label}</div>
                      <div style={{ fontSize:11,color:"#94a3b8",marginTop:1 }}>{sub}</div>
                    </div>
                    <ChevronRight size={13} style={{ color:"#e2e8f0",flexShrink:0 }}/>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Хүсэлтийн хураангуй */}
          <div style={{ background:"white",borderRadius:20,border:"1px solid #f1f5f9",
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)",padding:"18px 20px" }}>
            <div style={{ fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:14,
              display:"flex",alignItems:"center",gap:8 }}>
              <TrendingUp size={15} style={{ color:"#6366f1" }}/> Хүсэлтийн статус
            </div>
            {apps.length === 0 ? (
              <p style={{ fontSize:12,color:"#cbd5e1",margin:0,textAlign:"center" as const,
                padding:"12px 0" }}>
                Хүсэлт байхгүй байна
              </p>
            ) : (
              <div style={{ display:"flex",flexDirection:"column" as const,gap:8 }}>
                {[
                  { label:"Хүлээгдэж буй", count:pending,  color:"#f59e0b", bg:"#fffbeb" },
                  { label:"Баталгаажсан",  count:approved, color:"#059669", bg:"#ecfdf5" },
                  { label:"Татгалзсан",    count:apps.filter(a=>a.status==="rejected").length, color:"#dc2626", bg:"#fef2f2" },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} style={{ display:"flex",alignItems:"center",
                    justifyContent:"space-between",padding:"9px 12px",borderRadius:10,
                    background:bg,border:`1px solid ${color}22` }}>
                    <span style={{ fontSize:12,color,fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:16,fontWeight:800,color }}>{count}</span>
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