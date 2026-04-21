"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_CFG: Record<string,{label:string;color:string;bg:string;border:string}> = {
  pending:  { label:"Хүлээгдэж буй", color:"#f59e0b", bg:"#fffbeb", border:"#fde68a" },
  reviewed: { label:"Хянагдсан",      color:"#3b82f6", bg:"#eff6ff", border:"#bfdbfe" },
  approved: { label:"Баталгаажсан",   color:"#10b981", bg:"#ecfdf5", border:"#a7f3d0" },
  rejected: { label:"Татгалзсан",     color:"#ef4444", bg:"#fef2f2", border:"#fecaca" },
};

export default function CompanyApplicationsPage() {
  const [apps,    setApps]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/api/applications/mine?limit=50`, {
      headers: { Authorization:`Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { if (d.success) setApps(d.applications ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? apps : apps.filter(a => a.status === filter);

  return (
    <div style={{ maxWidth:"100%", margin:"0 auto", padding:"24px 16px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20,fontWeight:700,color:"#0f172a",margin:"0 0 4px" }}>
          Миний хүсэлтүүд
        </h1>
        <p style={{ fontSize:13,color:"#94a3b8",margin:0 }}>
          Нийт {apps.length} хүсэлт гаргасан байна
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex",gap:6,marginBottom:16,flexWrap:"wrap" as const }}>
        {[
          { key:"all",      label:`Бүгд (${apps.length})` },
          { key:"pending",  label:`Хүлээгдэж (${apps.filter(a=>a.status==="pending").length})` },
          { key:"approved", label:`Баталгаажсан (${apps.filter(a=>a.status==="approved").length})` },
          { key:"rejected", label:`Татгалзсан (${apps.filter(a=>a.status==="rejected").length})` },
        ].map(({ key, label }) => {
          const sc     = key === "all" ? null : STATUS_CFG[key];
          const active = filter === key;
          return (
            <button key={key} onClick={() => setFilter(key)}
              style={{ padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:500,
                cursor:"pointer",fontFamily:"inherit",
                border: active ? `1.5px solid ${sc?.color ?? "#6366f1"}40` : "1.5px solid #e2e8f0",
                background: active ? `${sc?.color ?? "#6366f1"}08` : "white",
                color: active ? (sc?.color ?? "#6366f1") : "#64748b" }}>
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display:"flex",justifyContent:"center",padding:56,gap:10 }}>
          <Loader2 size={20} style={{ color:"#6366f1",animation:"spin .8s linear infinite" }}/>
          <span style={{ fontSize:13,color:"#94a3b8" }}>Ачаалж байна...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center" as const,padding:"56px 0",
          background:"white",borderRadius:18,border:"1px solid #f1f5f9" }}>
          <FileText size={32} style={{ color:"#e2e8f0",display:"block",margin:"0 auto 12px" }}/>
          <p style={{ fontSize:13,color:"#cbd5e1",margin:0 }}>Хүсэлт байхгүй байна</p>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column" as const,gap:10 }}>
          {filtered.map(app => {
            const sc = STATUS_CFG[app.status] ?? STATUS_CFG.pending;
            return (
              <div key={app.id} style={{ background:"white",borderRadius:16,
                padding:"18px 20px",border:"1px solid #f1f5f9",
                boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
                borderLeft:`3px solid ${sc.color}` }}>
                <div style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",
                      gap:8,marginBottom:6,flexWrap:"wrap" as const }}>
                      <span style={{ fontSize:14,fontWeight:700,color:"#0f172a" }}>
                        {app.announcement_title || "Тендер"}
                      </span>
                      <span style={{ fontSize:11,fontWeight:600,padding:"2px 9px",
                        borderRadius:99,background:sc.bg,color:sc.color,
                        border:`1px solid ${sc.border}` }}>
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ display:"flex",gap:14,flexWrap:"wrap" as const }}>
                      <span style={{ fontSize:11,color:"#94a3b8",
                        display:"flex",alignItems:"center",gap:4 }}>
                        <Clock size={11}/> {new Date(app.created_at).toLocaleDateString("mn-MN")}
                      </span>
                      {app.price_offer && (
                        <span style={{ fontSize:11,color:"#94a3b8" }}>
                          💰 {Number(app.price_offer).toLocaleString()}₮
                        </span>
                      )}
                    </div>
                    {app.note && (
                      <p style={{ fontSize:12,color:"#64748b",margin:"8px 0 0",lineHeight:1.5 }}>
                        {app.note}
                      </p>
                    )}
                    {app.return_reason && (
                      <div style={{ marginTop:8,padding:"8px 12px",borderRadius:8,
                        background:"#fef2f2",border:"1px solid #fecaca",
                        fontSize:12,color:"#dc2626" }}>
                        <strong>Буцаасан шалтгаан:</strong> {app.return_reason}
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink:0 }}>
                    {app.status === "approved" && <CheckCircle2 size={20} style={{ color:"#10b981" }}/>}
                    {app.status === "rejected" && <XCircle     size={20} style={{ color:"#ef4444" }}/>}
                    {app.status === "pending"  && <Clock       size={20} style={{ color:"#f59e0b" }}/>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}