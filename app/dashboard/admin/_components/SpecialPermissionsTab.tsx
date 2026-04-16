"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Plus, Pencil, Trash2, Loader2, X, CheckCircle2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";

type PermType = { id: number; label: string; is_active: boolean; created_at?: string };

function PermTypeModal({ mode, item, onClose, onSave, showToast }: {
  mode:"create"|"edit"; item?: PermType|null;
  onClose:()=>void; onSave:()=>void; showToast:(m:string,ok?:boolean)=>void;
}) {
  const [label,  setLabel]  = useState(item?.label ?? "");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleSave = async () => {
    if (!label.trim()) { setError("Нэр шаардлагатай"); return; }
    setSaving(true); setError("");
    try {
      const url = mode === "create"
        ? `${API}/api/special-permission-types`
        : `${API}/api/special-permission-types/${item!.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(mode === "create" ? "Нэмэгдлэа ✓" : "Хадгаллаа ✓");
      onSave();
    } catch(e:any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const inp: React.CSSProperties = {
    width:"100%", height:42, background:"rgba(255,255,255,0.04)",
    border:"1px solid rgba(255,255,255,0.08)", borderRadius:9,
    padding:"0 12px", fontSize:13, color:"rgba(255,255,255,0.85)",
    outline:"none", fontFamily:"inherit",
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",
      justifyContent:"center",background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)" }}
      onClick={onClose}>
      <div style={{ width:"100%",maxWidth:420,background:"#0d1526",
        border:"1px solid rgba(255,255,255,0.08)",borderRadius:22,padding:28,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)" }}
        onClick={e=>e.stopPropagation()}>

        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:22 }}>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)" }}>
              {mode==="create"?"Шинэ төрөл нэмэх":"Төрөл засах"}
            </div>
            <div style={{ fontSize:11,color:"rgba(148,163,184,0.4)",marginTop:2 }}>
              Тусгай зөвшөөрлийн төрөл
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:7,
            cursor:"pointer",color:"rgba(148,163,184,0.5)",display:"flex" }}>
            <X size={15}/>
          </button>
        </div>

        {error && (
          <div style={{ padding:"9px 13px",borderRadius:10,background:"rgba(239,68,68,0.07)",
            border:"1px solid rgba(239,68,68,0.18)",marginBottom:16 }}>
            <span style={{ fontSize:12,color:"rgba(239,68,68,0.9)" }}>{error}</span>
          </div>
        )}

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",
              textTransform:"uppercase" as const,color:"rgba(148,163,184,0.45)",
              display:"block",marginBottom:5 }}>Нэр *</label>
            <input value={label} onChange={e=>setLabel(e.target.value)} style={inp}
              placeholder="Жишээ: Барилгын тусгай зөвшөөрөл"
              onFocus={e=>(e.target as HTMLElement).style.borderColor="rgba(59,130,246,0.4)"}
              onBlur={e=>(e.target as HTMLElement).style.borderColor="rgba(255,255,255,0.08)"}
              onKeyDown={e=>e.key==="Enter"&&handleSave()}/>
          </div>

          <div style={{ display:"flex",gap:10,marginTop:4 }}>
            <button onClick={onClose} style={{ flex:1,height:42,borderRadius:10,
              background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
              color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
              Болих
            </button>
            <button onClick={handleSave} disabled={saving} style={{ flex:2,height:42,borderRadius:10,
              background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",
              color:"white",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
              display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:saving?0.7:1 }}>
              {saving?<Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/>:<CheckCircle2 size={14}/>}
              {saving?"Хадгалж байна...":mode==="create"?"Нэмэх":"Хадгалах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SpecialPermissionsTab({ isSuperAdmin, showToast }: {
  isSuperAdmin: boolean;
  showToast: (msg:string, ok?:boolean) => void;
}) {
  const [items,      setItems]      = useState<PermType[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [modalMode,  setModalMode]  = useState<"create"|"edit"|null>(null);
  const [editTarget, setEditTarget] = useState<PermType|null>(null);
  const [confirmDel, setConfirmDel] = useState<PermType|null>(null);
  const [deleting,   setDeleting]   = useState(false);
  const [toggling,   setToggling]   = useState<number|null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/special-permission-types`);
      const data = await res.json();
      if (data.success) setItems(data.types ?? []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleToggle = async (item: PermType) => {
    setToggling(item.id);
    try {
      const res = await fetch(`${API}/api/special-permission-types/${item.id}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setItems(prev => prev.map(x => x.id===item.id ? {...x, is_active:!x.is_active} : x));
      showToast(`${item.label} → ${!item.is_active?"Идэвхтэй":"Идэвхгүй"}`);
    } catch(e:any) { showToast(e.message, false); }
    finally { setToggling(null); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/special-permission-types/${confirmDel.id}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(`${confirmDel.label} устгагдлаа`);
      setItems(prev => prev.filter(x => x.id !== confirmDel.id));
      setConfirmDel(null);
    } catch(e:any) { showToast(e.message, false); }
    finally { setDeleting(false); }
  };

  const active   = items.filter(d => d.is_active).length;
  const inactive = items.filter(d => !d.is_active).length;

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} tr:hover td{background:rgba(255,255,255,0.015)}`}</style>

      {(modalMode==="create"||modalMode==="edit") && (
        <PermTypeModal mode={modalMode} item={editTarget}
          onClose={()=>{ setModalMode(null); setEditTarget(null); }}
          onSave={()=>{ setModalMode(null); setEditTarget(null); fetchItems(); }}
          showToast={showToast}/>
      )}

      {confirmDel && (
        <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",
          justifyContent:"center",background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)" }}
          onClick={()=>setConfirmDel(null)}>
          <div style={{ width:"100%",maxWidth:380,background:"#0d1526",
            border:"1px solid rgba(239,68,68,0.2)",borderRadius:20,padding:28 }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ width:52,height:52,borderRadius:16,background:"rgba(239,68,68,0.08)",
              display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px" }}>
              <Trash2 size={22} style={{ color:"#ef4444" }}/>
            </div>
            <div style={{ textAlign:"center",marginBottom:22 }}>
              <p style={{ fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)",margin:"0 0 8px" }}>
                Устгах уу?
              </p>
              <p style={{ fontSize:13,color:"rgba(148,163,184,0.6)",margin:0 }}>
                <span style={{ color:"rgba(255,255,255,0.8)",fontWeight:600 }}>{confirmDel.label}</span>
              </p>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1,height:42,borderRadius:10,
                background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
                color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
                Болих
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex:1,height:42,borderRadius:10,
                background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                color:"#ef4444",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:deleting?0.6:1 }}>
                {deleting?<Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }}/>:<Trash2 size={13}/>}
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        {/* Toolbar */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" }}>
            <span style={{ fontSize:12,color:"rgba(148,163,184,0.4)" }}>
              {loading?"...":items.length+" төрөл"}
            </span>
            {!loading && (
              <>
                <span style={{ display:"inline-flex",alignItems:"center",gap:4,
                  padding:"2px 8px",borderRadius:99,fontSize:11,
                  background:"rgba(16,185,129,0.12)",color:"#10b981" }}>
                  <span style={{ width:4,height:4,borderRadius:"50%",background:"#10b981" }}/>
                  {active} идэвхтэй
                </span>
                {inactive > 0 && (
                  <span style={{ display:"inline-flex",alignItems:"center",gap:4,
                    padding:"2px 8px",borderRadius:99,fontSize:11,
                    background:"rgba(148,163,184,0.1)",color:"#94a3b8" }}>
                    {inactive} идэвхгүй
                  </span>
                )}
              </>
            )}
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={fetchItems}
              style={{ padding:"9px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",
                cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontFamily:"inherit" }}>
              <RefreshCw size={13} style={{ animation:loading?"spin 1s linear infinite":undefined }}/>
              Дахин ачаалах
            </button>
            {isSuperAdmin && (
              <button onClick={()=>{ setEditTarget(null); setModalMode("create"); }}
                style={{ padding:"9px 16px",borderRadius:10,
                  background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",
                  color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                  display:"flex",alignItems:"center",gap:6 }}>
                <Plus size={14}/> Шинэ төрөл
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ background:"#0d1526",border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:18,overflow:"hidden" }}>
          {loading ? (
            <div style={{ display:"flex",justifyContent:"center",alignItems:"center",padding:56,gap:12 }}>
              <div style={{ width:22,height:22,border:"2px solid rgba(52,211,153,0.3)",
                borderTopColor:"#34d399",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
              <span style={{ fontSize:13,color:"rgba(148,163,184,0.4)" }}>Ачаалж байна...</span>
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding:"56px 16px",textAlign:"center" }}>
              <p style={{ fontSize:13,color:"rgba(148,163,184,0.3)",margin:0 }}>
                Тусгай зөвшөөрлийн төрөл байхгүй байна
              </p>
              {isSuperAdmin && (
                <button onClick={()=>setModalMode("create")}
                  style={{ marginTop:16,padding:"8px 18px",borderRadius:10,
                    background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",
                    color:"#60a5fa",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
                  + Эхний төрөл нэмэх
                </button>
              )}
            </div>
          ) : (
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["#","Нэр","Статус","Нэмэгдсэн",""].map((h,i) => (
                    <th key={i} style={{ textAlign:"left",padding:"10px 16px",fontSize:10,fontWeight:700,
                      color:"rgba(148,163,184,0.28)",textTransform:"uppercase" as const,
                      letterSpacing:"0.09em",borderBottom:"1px solid rgba(255,255,255,0.05)",
                      whiteSpace:"nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding:"12px 16px",fontSize:11,color:"rgba(148,163,184,0.3)",
                      fontFamily:"monospace",width:48 }}>{i+1}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:32,height:32,borderRadius:9,flexShrink:0,
                          background: item.is_active?"rgba(59,130,246,0.12)":"rgba(148,163,184,0.06)",
                          border: item.is_active?"1px solid rgba(59,130,246,0.2)":"1px solid rgba(148,163,184,0.1)",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:12,fontWeight:700,
                          color: item.is_active?"#60a5fa":"rgba(148,163,184,0.4)" }}>
                          {item.label[0]}
                        </div>
                        <span style={{ fontSize:13,fontWeight:600,
                          color: item.is_active?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.35)" }}>
                          {item.label}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <button onClick={()=>isSuperAdmin&&handleToggle(item)}
                        disabled={toggling===item.id||!isSuperAdmin}
                        style={{ display:"inline-flex",alignItems:"center",gap:5,
                          padding:"3px 10px",borderRadius:99,border:"none",
                          cursor:isSuperAdmin?"pointer":"default",fontFamily:"inherit",
                          fontSize:11,fontWeight:600,
                          background:item.is_active?"rgba(16,185,129,0.12)":"rgba(148,163,184,0.1)",
                          color:item.is_active?"#10b981":"#94a3b8",
                          opacity:toggling===item.id?0.5:1 }}>
                        {toggling===item.id
                          ?<Loader2 size={10} style={{ animation:"spin 0.8s linear infinite" }}/>
                          :<span style={{ width:5,height:5,borderRadius:"50%",
                              background:item.is_active?"#10b981":"#94a3b8" }}/>}
                        {item.is_active?"Идэвхтэй":"Идэвхгүй"}
                      </button>
                    </td>
                    <td style={{ padding:"12px 16px",fontSize:11,color:"rgba(148,163,184,0.4)" }}>
                      {item.created_at?new Date(item.created_at).toLocaleDateString("mn-MN"):"—"}
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      {isSuperAdmin && (
                        <div style={{ display:"flex",gap:5 }}>
                          <button onClick={()=>{ setEditTarget(item); setModalMode("edit"); }}
                            style={{ background:"rgba(59,130,246,0.08)",
                              border:"1px solid rgba(59,130,246,0.18)",
                              borderRadius:8,padding:"6px 10px",cursor:"pointer",
                              display:"flex",alignItems:"center",gap:4,
                              fontSize:11,color:"#60a5fa",fontFamily:"inherit" }}>
                            <Pencil size={11}/> Засах
                          </button>
                          <button onClick={()=>setConfirmDel(item)}
                            style={{ background:"rgba(239,68,68,0.06)",
                              border:"1px solid rgba(239,68,68,0.15)",
                              borderRadius:8,padding:"6px 8px",cursor:"pointer",
                              display:"flex",alignItems:"center",color:"rgba(239,68,68,0.7)" }}>
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}