"use client";
import { useEffect, useState } from "react";
import { FileText, CheckCircle, Clock, XCircle, ChevronRight, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS: Record<string,{label:string;color:string;bg:string}> = {
  pending:  { label:"Хүлээгдэж буй", color:"#d97706", bg:"#fffbeb" },
  reviewed: { label:"Хянагдсан",      color:"#2563eb", bg:"#eff6ff" },
  approved: { label:"Баталгаажсан",   color:"#059669", bg:"#ecfdf5" },
  rejected: { label:"Татгалзсан",     color:"#dc2626", bg:"#fef2f2" },
};

function Badge({ status }: { status: string }) {
  const c = STATUS[status] ?? STATUS.pending;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",
      borderRadius:99,fontSize:11,fontWeight:600,background:c.bg,color:c.color }}>
      <span style={{ width:4,height:4,borderRadius:"50%",background:c.color }}/>
      {c.label}
    </span>
  );
}

export default function CompanyDashboard() {
  const [user,    setUser]    = useState<any>(null);
  const [apps,    setApps]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats,   setStats]   = useState({ total:0, pending:0, approved:0, rejected:0 });

  const refreshStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res  = await fetch(`${API}/api/organizations/me`, { headers: { Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success && (data.organization || data.user)) {
        const fresh   = data.organization || data.user;
        const stored  = JSON.parse(localStorage.getItem("user") || "{}");
        const updated = { ...stored, status: fresh.status, return_reason: fresh.return_reason };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser({ ...updated });
      }
    } catch {}
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    fetchApps();
    refreshStatus();
    const interval = setInterval(refreshStatus, 30_000);
    window.addEventListener("focus", refreshStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshStatus);
    };
  }, []);

  const fetchApps = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      const res  = await fetch(`${API}/api/applications/mine?limit=10`, {
        headers: { Authorization:`Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const list = data.applications || [];
        setApps(list);
        setStats({
          total:    data.pagination?.total || list.length,
          pending:  list.filter((a:any)=>a.status==="pending").length,
          approved: list.filter((a:any)=>a.status==="approved").length,
          rejected: list.filter((a:any)=>a.status==="rejected").length,
        });
      }
    } catch {}
    finally { setLoading(false); }
  };

  // ✅ status variables нэг газарт тодорхойлно
  const s          = user?.status;
  const isNew      = s === "new";
  const isActive   = s === "active" || s === "approved";
  const isReturned = s === "returned";

  const STAT_CARDS = [
    { label:"Нийт хүсэлт",   value:stats.total,    icon:FileText,   color:"#6366f1", bg:"#eef2ff" },
    { label:"Хүлээгдэж буй", value:stats.pending,  icon:Clock,      color:"#d97706", bg:"#fffbeb" },
    { label:"Баталгаажсан",  value:stats.approved, icon:CheckCircle,color:"#059669", bg:"#ecfdf5" },
    { label:"Татгалзсан",    value:stats.rejected, icon:XCircle,    color:"#dc2626", bg:"#fef2f2" },
  ];

  const QUICK = [
    { href:"/dashboard/company/applications",  icon:"📋", label:"Хүсэлтүүд",  desc:"Бүх хүсэлтийг харах"  },
    { href:"/dashboard/company/notifications", icon:"🔔", label:"Мэдэгдэл",   desc:"Шинэ мэдэгдлүүд"     },
    { href:"/dashboard/company/profile",       icon:"🏢", label:"Профайл",    desc:"Мэдээллээ шинэчлэх"  },
  ];

  return (
    <div style={{ maxWidth:960,margin:"0 auto",display:"flex",flexDirection:"column",gap:20 }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",
        flexWrap:"wrap",gap:12 }}>
        <div>
          <p style={{ fontSize:11,color:"#94a3b8",margin:"0 0 4px",fontWeight:500,
            letterSpacing:"0.1em",textTransform:"uppercase" }}>
            Байгууллагын хянах самбар
          </p>
          <h1 style={{ fontSize:22,fontWeight:700,color:"#0f172a",margin:0 }}>
            {user?.company_name || "Байгааллага"} 👋
          </h1>
          {user?.supplier_number && (
            <p style={{ fontSize:11,color:"#94a3b8",margin:"3px 0 0",fontFamily:"monospace" }}>
              {user.supplier_number}
            </p>
          )}
        </div>

        {/* ✅ Status badge */}
        <span style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",
          borderRadius:99,fontSize:12,fontWeight:500,
          background: isActive ? "#ecfdf5" : isReturned ? "#fef2f2" : isNew ? "#f0f9ff" : "#fffbeb",
          color:      isActive ? "#059669" : isReturned ? "#dc2626" : isNew ? "#0369a1" : "#d97706",
          border:`1px solid ${isActive?"#a7f3d0":isReturned?"#fecaca":isNew?"#bae6fd":"#fde68a"}` }}>
          <span style={{ width:6,height:6,borderRadius:"50%",
            background: isActive?"#10b981":isReturned?"#ef4444":isNew?"#0ea5e9":"#f59e0b",
            animation: isNew || s==="pending" ? "pulse 1.5s infinite" : "none" }}/>
          {isActive?"Баталгаажсан":isReturned?"Буцаагдсан":isNew?"Бүртгэл үүсгэх":"Хянагдаж байна"}
        </span>
      </div>

      {/* ── Returned banner ── */}
      {isReturned && (
        <Link href="/dashboard/company/profile" style={{ textDecoration:"none" }}>
          <div style={{ background:"white",border:"1px solid #fecaca",borderRadius:14,
            padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#fef2f2"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="white"}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:"#fef2f2",
                border:"1px solid #fecaca",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>⚠️</div>
              <div>
                <p style={{ fontSize:13,fontWeight:600,color:"#dc2626",margin:0 }}>Бүртгэл буцаагдсан байна</p>
                {user?.return_reason && (
                  <p style={{ fontSize:12,color:"#ef4444",margin:"1px 0 0" }}>{user.return_reason}</p>
                )}
              </div>
            </div>
            <ArrowRight size={16} style={{ color:"#dc2626",flexShrink:0 }}/>
          </div>
        </Link>
      )}

      {/* ── New user banner ── */}
      {isNew && (
        <Link href="/dashboard/company/profile" style={{ textDecoration:"none" }}>
          <div style={{ background:"white",border:"1px solid #bae6fd",borderRadius:14,
            padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#f0f9ff"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="white"}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:"#f0f9ff",
                border:"1px solid #bae6fd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>📝</div>
              <div>
                <p style={{ fontSize:13,fontWeight:600,color:"#0369a1",margin:0 }}>Байгааллагын мэдээлэл бөглөнө үү</p>
                <p style={{ fontSize:12,color:"#0ea5e9",margin:"1px 0 0" }}>Бүртгэлээ дуусгаж баталгаажуулалт авна уу</p>
              </div>
            </div>
            <ArrowRight size={16} style={{ color:"#0369a1",flexShrink:0 }}/>
          </div>
        </Link>
      )}

      {/* ── Pending banner ── */}
      {s === "pending" && (
        <Link href="/dashboard/company/profile" style={{ textDecoration:"none" }}>
          <div style={{ background:"white",border:"1px solid #fde68a",borderRadius:14,
            padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer" }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#fffbeb"}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="white"}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <div style={{ width:38,height:38,borderRadius:10,background:"#fffbeb",
                border:"1px solid #fde68a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>📋</div>
              <div>
                <p style={{ fontSize:13,fontWeight:600,color:"#92400e",margin:0 }}>Бүртгэлээ дуусгана уу</p>
                <p style={{ fontSize:12,color:"#d97706",margin:"1px 0 0" }}>Байгааллагын мэдээллийг бүрэн бөглөж баталгаажуулна уу</p>
              </div>
            </div>
            <ArrowRight size={16} style={{ color:"#d97706",flexShrink:0 }}/>
          </div>
        </Link>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
        {STAT_CARDS.map(({ label, value, icon:Icon, color, bg }) => (
          <div key={label} style={{ background:"white",border:"1px solid #f1f5f9",
            borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:bg,
                display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Icon size={17} style={{ color }}/>
              </div>
              <TrendingUp size={12} style={{ color:"#e2e8f0" }}/>
            </div>
            <p style={{ fontSize:26,fontWeight:700,color:"#0f172a",margin:0,lineHeight:1 }}>
              {loading ? "—" : value}
            </p>
            <p style={{ fontSize:11,color:"#94a3b8",margin:"4px 0 0" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Content grid ── */}
      <div style={{ display:"grid",gridTemplateColumns:"200px 1fr",gap:14 }}>
        {/* Progress */}
        <div style={{ background:"white",border:"1px solid #f1f5f9",borderRadius:14,
          padding:18,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize:13,fontWeight:600,color:"#0f172a",margin:"0 0 16px" }}>Дүн</p>
          {[
            { label:"Нийт",       value:stats.total,    color:"#6366f1" },
            { label:"Хүлээгдэж",  value:stats.pending,  color:"#f59e0b" },
            { label:"Батлагдсан", value:stats.approved, color:"#10b981" },
            { label:"Татгалзсан", value:stats.rejected, color:"#ef4444" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontSize:11,color:"#94a3b8",display:"flex",alignItems:"center",gap:5 }}>
                  <span style={{ width:5,height:5,borderRadius:"50%",background:color,flexShrink:0 }}/>
                  {label}
                </span>
                <span style={{ fontSize:11,fontWeight:600,color:"#475569" }}>{value}</span>
              </div>
              <div style={{ height:4,borderRadius:99,background:"#f1f5f9",overflow:"hidden" }}>
                <div style={{ height:"100%",borderRadius:99,background:color,
                  width:`${(value/Math.max(stats.total,1))*100}%`,transition:"width .8s ease" }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Recent apps */}
        <div style={{ background:"white",border:"1px solid #f1f5f9",borderRadius:14,
          overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ padding:"16px 20px",borderBottom:"1px solid #f8fafc",
            display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div>
              <p style={{ fontSize:13,fontWeight:600,color:"#0f172a",margin:0 }}>Сүүлийн хүсэлтүүд</p>
              <p style={{ fontSize:11,color:"#94a3b8",margin:"1px 0 0" }}>Байгааллагын хүсэлтүүд</p>
            </div>
            <Link href="/dashboard/company/applications"
              style={{ display:"flex",alignItems:"center",gap:4,fontSize:12,color:"#6366f1",
                fontWeight:500,textDecoration:"none",padding:"5px 10px",borderRadius:8,
                background:"#eef2ff",border:"1px solid #c7d2fe" }}>
              Бүгд <ChevronRight size={13}/>
            </Link>
          </div>
          {loading ? (
            <div style={{ display:"flex",justifyContent:"center",padding:40 }}>
              <div style={{ width:20,height:20,border:"2px solid #e2e8f0",
                borderTopColor:"#6366f1",borderRadius:"50%",animation:"spin .8s linear infinite" }}/>
            </div>
          ) : apps.length === 0 ? (
            <div style={{ padding:"36px 20px",textAlign:"center" }}>
              <FileText size={28} style={{ color:"#e2e8f0",margin:"0 auto 8px",display:"block" }}/>
              <p style={{ fontSize:13,color:"#94a3b8",margin:0 }}>Хүсэлт байхгүй байна</p>
            </div>
          ) : apps.slice(0,6).map((app, i) => (
            <div key={app.id}
              style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 20px",
                borderBottom: i < Math.min(apps.length,6)-1 ? "1px solid #f8fafc" : "none",
                transition:"background .12s",cursor:"pointer" }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#fafafa"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
              <div style={{ width:32,height:32,borderRadius:9,flexShrink:0,
                background:`hsl(${i*67%360},60%,92%)`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:700,color:`hsl(${i*67%360},50%,40%)` }}>
                {app.announcement_title?.[0] ?? "?"}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:13,fontWeight:500,color:"#0f172a",margin:0,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                  {app.announcement_title || "Тендер"}
                </p>
                <p style={{ fontSize:11,color:"#94a3b8",margin:"1px 0 0" }}>
                  {new Date(app.created_at).toLocaleDateString("mn-MN")}
                  {app.price_offer && ` · ${Number(app.price_offer).toLocaleString()}₮`}
                </p>
              </div>
              <Badge status={app.status}/>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick links ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
        {QUICK.map(({ href, icon, label, desc }) => (
          <Link key={href} href={href} style={{ textDecoration:"none" }}>
            <div style={{ background:"white",border:"1px solid #f1f5f9",borderRadius:14,
              padding:"16px 18px",display:"flex",alignItems:"center",gap:12,
              transition:"all .15s",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",cursor:"pointer" }}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="#c7d2fe";el.style.boxShadow="0 4px 16px rgba(99,102,241,0.1)";}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="#f1f5f9";el.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)";}}>
              <span style={{ fontSize:20,flexShrink:0 }}>{icon}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13,fontWeight:600,color:"#0f172a",margin:0 }}>{label}</p>
                <p style={{ fontSize:11,color:"#94a3b8",margin:"1px 0 0" }}>{desc}</p>
              </div>
              <ChevronRight size={14} style={{ color:"#cbd5e1",flexShrink:0 }}/>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}