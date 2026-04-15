"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Trash2, Loader2, Send, Bell } from "lucide-react";
import { API, getToken } from "./constants";
import { recipientLabel, type Notif } from "./types";
import { SendModal } from "./SendModal";
import { NotifDetailModal } from "./NotifDetailModal";

export function NotificationsTab({ showToast, onUnreadChange }: {
  showToast: (msg: string, ok?: boolean) => void;
  onUnreadChange?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [sendModal,     setSendModal]     = useState(false);
  const [detailNotif,   setDetailNotif]   = useState<Notif|null>(null);
  const [confirmDel,    setConfirmDel]    = useState<Notif|null>(null);
  const [deleting,      setDeleting]      = useState(false);
  const [toggling,      setToggling]      = useState<string|null>(null);

  const adminId = (() => {
    try { return JSON.parse(localStorage.getItem("super_admin_user") || localStorage.getItem("user") || "{}")?.id ?? "guest"; }
    catch { return "guest"; }
  })();

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(`notif_read_${adminId}`) || "[]";
      return new Set(JSON.parse(raw));
    } catch { return new Set(); }
  });

  const markAdminRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(`notif_read_${adminId}`, JSON.stringify([...next]));
      return next;
    });
  };

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications?limit=50&_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications ?? []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { onUnreadChange?.(unreadCount); }, [unreadCount, onUnreadChange]);
  useEffect(() => { fetch_(); }, [fetch_]);

  const handleToggle = async (n: Notif) => {
    setToggling(n.id);
    try {
      const res = await fetch(`${API}/api/notifications/${n.id}/toggle`, {
        method:"PATCH", headers:{ Authorization:`Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotifications(prev => prev.map(x => x.id === n.id ? {...x, is_active:data.is_active} : x));
      showToast(data.message);
    } catch (e: any) { showToast(e.message, false); }
    finally { setToggling(null); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/notifications/${confirmDel.id}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      setNotifications(prev => prev.filter(n => n.id !== confirmDel.id));
      showToast("Мэдэгдэл устгагдлаа"); setConfirmDel(null);
    } catch (e: any) { showToast(e.message, false); }
    finally { setDeleting(false); }
  };

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .tr{border-bottom:1px solid rgba(255,255,255,0.04);transition:background .12s;}
        .tr:hover{background:rgba(255,255,255,0.025);}
        .tr:last-child{border-bottom:none;}
      `}</style>

      {sendModal && (
        <SendModal onClose={() => setSendModal(false)}
          onSent={() => { setSendModal(false); fetch_(); }}
          showToast={showToast}/>
      )}
      {detailNotif && (
        <NotifDetailModal notif={detailNotif} onClose={() => setDetailNotif(null)}
          onResend={fetch_} showToast={showToast}/>
      )}
      {confirmDel && (
        <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)" }}
          onClick={() => setConfirmDel(null)}>
          <div style={{ width:"100%",maxWidth:380,background:"#0d1526",border:"1px solid rgba(239,68,68,0.2)",borderRadius:20,padding:28 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:52,height:52,borderRadius:16,background:"rgba(239,68,68,0.08)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px" }}>
              <Trash2 size={22} style={{ color:"#ef4444" }}/>
            </div>
            <div style={{ textAlign:"center",marginBottom:22 }}>
              <p style={{ fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)",margin:"0 0 6px" }}>Устгах уу?</p>
              <p style={{ fontSize:13,color:"rgba(255,255,255,0.8)",margin:0,fontWeight:600 }}>{confirmDel.title}</p>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex:1,height:42,borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>Болих</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex:1,height:42,borderRadius:10,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:deleting?0.6:1 }}>
                {deleting ? <Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Trash2 size={13}/>}
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-in" style={{ display:"flex",flexDirection:"column",gap:16 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontSize:12,color:"rgba(148,163,184,0.4)" }}>
            {loading ? "..." : notifications.length + " мэдэгдэл"}
          </span>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={fetch_}
              style={{ padding:"9px 12px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",cursor:"pointer",display:"flex",alignItems:"center" }}>
              <RefreshCw size={13} style={{ animation:loading?"spin 1s linear infinite":undefined }}/>
            </button>
            <button onClick={() => setSendModal(true)}
              style={{ padding:"9px 16px",borderRadius:10,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6 }}>
              <Send size={14}/> Мэдэгдэл илгээх
            </button>
          </div>
        </div>

        <div style={{ background:"#0d1526",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,overflow:"hidden" }}>
          {loading ? (
            <div style={{ display:"flex",justifyContent:"center",alignItems:"center",padding:56,gap:12 }}>
              <div style={{ width:22,height:22,border:"2px solid rgba(52,211,153,0.3)",borderTopColor:"#34d399",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
              <span style={{ fontSize:13,color:"rgba(148,163,184,0.4)" }}>Ачаалж байна...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding:"56px 16px",textAlign:"center" }}>
              <Bell size={32} style={{ color:"rgba(148,163,184,0.15)",margin:"0 auto 12px",display:"block" }}/>
              <p style={{ fontSize:13,color:"rgba(148,163,184,0.3)",margin:0 }}>Мэдэгдэл байхгүй байна</p>
            </div>
          ) : (
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["Гарчиг","Хүлээн авагч","Илгээсэн","Огноо",""].map((h,i) => (
                    <th key={i} style={{ textAlign:"left",padding:"10px 16px",fontSize:10,fontWeight:700,color:"rgba(148,163,184,0.28)",textTransform:"uppercase" as const,letterSpacing:"0.09em",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => {
                  const rl = recipientLabel(n.recipient_type);
                  return (
                    <tr key={n.id} className="tr" style={{ cursor:"pointer" }}
                      onClick={() => { setDetailNotif(n); markAdminRead(n.id); }}>
                      <td style={{ padding:"12px 16px",maxWidth:260 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          {!readIds.has(n.id) && (
                            <span style={{ width:7,height:7,borderRadius:"50%",background:"#3b82f6",flexShrink:0 }}/>
                          )}
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:13,fontWeight:readIds.has(n.id)?400:700,color:readIds.has(n.id)?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.9)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                              {n.title}
                            </div>
                            {n.message && <div style={{ fontSize:11,color:"rgba(148,163,184,0.4)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{n.message}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:rl.bg,color:rl.color }}>
                          <span style={{ width:4,height:4,borderRadius:"50%",background:rl.color }}/>{rl.l}
                        </span>
                      </td>
                      <td style={{ padding:"12px 16px",fontSize:12,color:"rgba(148,163,184,0.5)" }}>
                        {n.sent_by_name || "—"}
                      </td>
                      <td style={{ padding:"12px 16px",fontSize:11,color:"rgba(148,163,184,0.4)" }}>
                        {new Date(n.created_at).toLocaleDateString("mn-MN")}
                        <div style={{ fontSize:10,color:"rgba(148,163,184,0.3)" }}>
                          {new Date(n.created_at).toLocaleTimeString("mn-MN",{hour:"2-digit",minute:"2-digit"})}
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                          {n.is_mine && (
                            <button onClick={e => { e.stopPropagation(); handleToggle(n); }} disabled={toggling === n.id}
                              style={{ padding:"5px 10px",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,background:n.is_active?"rgba(16,185,129,0.08)":"rgba(148,163,184,0.07)",border:n.is_active?"1px solid rgba(16,185,129,0.25)":"1px solid rgba(148,163,184,0.2)",color:n.is_active?"#10b981":"rgba(148,163,184,0.6)",opacity:toggling===n.id?0.5:1 }}>
                              {toggling === n.id
                                ? <Loader2 size={11} style={{ animation:"spin 0.8s linear infinite" }}/>
                                : <span style={{ width:7,height:7,borderRadius:"50%",background:n.is_active?"#10b981":"rgba(148,163,184,0.5)" }}/>
                              }
                              {n.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                            </button>
                          )}
                          {n.is_mine && (
                            <button onClick={e => { e.stopPropagation(); setConfirmDel(n); }}
                              style={{ background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",borderRadius:8,padding:"6px 8px",cursor:"pointer",display:"flex",alignItems:"center",color:"rgba(239,68,68,0.7)" }}>
                              <Trash2 size={12}/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}