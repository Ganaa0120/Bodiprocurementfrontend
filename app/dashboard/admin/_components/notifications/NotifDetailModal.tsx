"use client";
import { useState, useRef } from "react";
import { X, Loader2, Send, Pencil, Image as ImageIcon } from "lucide-react";
import { API, getToken } from "./constants";
import { recipientLabel, type Notif } from "./types";

export function NotifDetailModal({ notif, onClose, onResend, showToast }: {
  notif: Notif; onClose: () => void;
  onResend: () => void; showToast: (m: string, ok?: boolean) => void;
}) {
  const canEdit = notif.is_mine === true;
  const [editing,      setEditing]      = useState(false);
  const [resending,    setResending]    = useState(false);
  const [title,        setTitle]        = useState(notif.title);
  const [message,      setMessage]      = useState(notif.message ?? "");
  const [imageFile,    setImageFile]    = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState(notif.image_url ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const rl = recipientLabel(notif.recipient_type);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setImageFile(f);
    const r = new FileReader();
    r.onload = () => setImagePreview(r.result as string);
    r.readAsDataURL(f);
  };

  const handleResend = async () => {
    if (!title.trim()) { showToast("Гарчиг шаардлагатай", false); return; }
    setResending(true);
    try {
      let image_url: string | undefined = notif.image_url;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const up = await fetch(`${API}/api/upload`, {
          method:"POST", headers:{ Authorization:`Bearer ${getToken()}` }, body:fd,
        });
        const ud = await up.json();
        if (ud.url) image_url = ud.url;
      }
      const res = await fetch(`${API}/api/notifications/send`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({
          title, message: message || null,
          recipient_type: notif.recipient_type,
          recipient_ids: [],
          image_url: image_url || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      showToast("Дахин илгээгдлэа ✓");
      onResend(); onClose();
    } catch (e: any) { showToast(e.message, false); }
    finally { setResending(false); }
  };

  const inp: React.CSSProperties = {
    width:"100%", background:"rgba(255,255,255,0.05)",
    border:"1px solid rgba(59,130,246,0.3)", borderRadius:9,
    padding:"9px 12px", fontSize:13, color:"rgba(255,255,255,0.85)",
    outline:"none", fontFamily:"inherit",
  };
  const lbl: React.CSSProperties = {
    fontSize:10, fontWeight:700, letterSpacing:"0.1em",
    textTransform:"uppercase" as const, color:"rgba(148,163,184,0.4)",
    display:"block" as const, marginBottom:5,
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:250,display:"flex",alignItems:"flex-start",
      justifyContent:"center",background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)",
      padding:"20px 16px",overflowY:"auto" }} onClick={onClose}>
      <div style={{ width:"100%",maxWidth:520,background:"#0d1526",
        border:"1px solid rgba(255,255,255,0.08)",borderRadius:22,padding:28,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)",marginBottom:24 }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)" }}>
              {editing ? "Мэдэгдэл засах & Дахин илгээх" : "Мэдэгдлийн дэлгэрэнгүй"}
            </div>
            <div style={{ fontSize:11,color:"rgba(148,163,184,0.4)",marginTop:2 }}>
              {new Date(notif.created_at).toLocaleString("mn-MN")}
            </div>
          </div>
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            {!editing && (
              <button onClick={() => setEditing(true)}
                style={{ background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:9,padding:"6px 12px",cursor:"pointer",color:"#60a5fa",fontSize:12,fontFamily:"inherit",display:"flex",alignItems:"center",gap:5 }}>
                <Pencil size={12}/> Засах
              </button>
            )}
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:7,cursor:"pointer",color:"rgba(148,163,184,0.5)",display:"flex" }}>
              <X size={15}/>
            </button>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display:"flex",gap:8,marginBottom:18,flexWrap:"wrap" }}>
          <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,background:rl.bg,fontSize:11,fontWeight:600,color:rl.color }}>
            <span style={{ width:5,height:5,borderRadius:"50%",background:rl.color }}/>{rl.l}
          </span>
          <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:notif.is_active?"rgba(16,185,129,0.1)":"rgba(148,163,184,0.08)",color:notif.is_active?"#10b981":"rgba(148,163,184,0.5)" }}>
            <span style={{ width:5,height:5,borderRadius:"50%",background:notif.is_active?"#10b981":"rgba(148,163,184,0.4)" }}/>
            {notif.is_active ? "Идэвхтэй" : "Идэвхгүй"}
          </span>
          {notif.sent_by_name && (
            <span style={{ fontSize:11,color:"rgba(148,163,184,0.4)",padding:"3px 10px",borderRadius:99,background:"rgba(255,255,255,0.03)" }}>
              👤 {notif.sent_by_name}
            </span>
          )}
        </div>

        {/* View mode */}
        {!editing && (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {(notif.sent_by_name || notif.sent_by_company) && (
              <div style={{ padding:"12px 16px",borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:10 }}>Илгээсэн</div>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:38,height:38,borderRadius:11,flexShrink:0,background:notif.sent_by_role==="super_admin"?"linear-gradient(135deg,#7c3aed,#a855f7)":"linear-gradient(135deg,#0f766e,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white" }}>
                    {(notif.sent_by_name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.88)" }}>{notif.sent_by_name}</div>
                    {notif.sent_by_company && <div style={{ fontSize:11,color:"rgba(148,163,184,0.55)",marginTop:2 }}>🏢 {notif.sent_by_company}</div>}
                    {notif.sent_by_email   && <div style={{ fontSize:11,color:"rgba(148,163,184,0.4)",marginTop:1 }}>✉️ {notif.sent_by_email}</div>}
                  </div>
                  <span style={{ fontSize:10,padding:"3px 10px",borderRadius:99,fontWeight:600,flexShrink:0,background:notif.sent_by_role==="super_admin"?"rgba(239,68,68,0.1)":"rgba(59,130,246,0.1)",color:notif.sent_by_role==="super_admin"?"#f87171":"#60a5fa" }}>
                    {notif.sent_by_role === "super_admin" ? "Super Admin" : "Мини Админ"}
                  </span>
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:6 }}>Гарчиг</div>
              <div style={{ fontSize:16,fontWeight:700,color:"rgba(255,255,255,0.9)",lineHeight:1.4,padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)" }}>
                {notif.title}
              </div>
            </div>

            {notif.message && (
              <div>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:6 }}>Агуулга</div>
                <div style={{ fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.7,padding:"12px 16px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",whiteSpace:"pre-wrap" as const }}>
                  {notif.message}
                </div>
              </div>
            )}

            {notif.image_url && (
              <div>
                <div style={{ fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",marginBottom:6 }}>Зураг</div>
                <img src={notif.image_url} alt="notification" style={{ width:"100%",maxHeight:220,objectFit:"cover",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",display:"block" }}/>
              </div>
            )}

            {notif.announcement_title && (
              <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.15)" }}>
                <div style={{ fontSize:10,color:"rgba(96,165,250,0.6)",marginBottom:3 }}>Холбоотой зарлал</div>
                <div style={{ fontSize:12,color:"rgba(148,163,184,0.7)" }}>{notif.announcement_title}</div>
              </div>
            )}

            <div style={{ display:"flex",gap:10,marginTop:4 }}>
              <button onClick={onClose} style={{ flex:1,height:42,borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>Хаах</button>
              {canEdit && (
                <button onClick={() => setEditing(true)}
                  style={{ flex:2,height:42,borderRadius:10,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                  <Send size={13}/> Дахин илгээх
                </button>
              )}
            </div>
          </div>
        )}

        {/* Edit & Resend mode */}
        {editing && canEdit && (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div>
              <label style={lbl}>Гарчиг *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={inp}
                onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.6)"}
                onBlur={e  => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.3)"}/>
            </div>
            <div>
              <label style={lbl}>Агуулга</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                rows={4} style={{ ...inp,resize:"vertical" }}
                onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.6)"}
                onBlur={e  => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.3)"}/>
            </div>
            <div>
              <label style={lbl}>Зураг</label>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleImage}/>
              {imagePreview ? (
                <div style={{ position:"relative",display:"inline-block",width:"100%" }}>
                  <img src={imagePreview} alt="preview" style={{ maxHeight:160,width:"100%",objectFit:"cover",borderRadius:10,border:"1px solid rgba(59,130,246,0.3)",display:"block" }}/>
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }}
                    style={{ position:"absolute",top:6,right:6,width:24,height:24,borderRadius:"50%",background:"rgba(239,68,68,0.85)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"white" }}>
                    <X size={11}/>
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ width:"100%",height:72,borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:"rgba(148,163,184,0.4)",fontFamily:"inherit",fontSize:12 }}>
                  <ImageIcon size={18} style={{ opacity:0.5 }}/> Зураг сонгох / солих
                </button>
              )}
            </div>
            <div style={{ padding:"10px 14px",borderRadius:10,background:"rgba(59,130,246,0.05)",border:"1px solid rgba(59,130,246,0.12)" }}>
              <div style={{ fontSize:11,color:"rgba(96,165,250,0.7)" }}>
                📤 {notif.recipient_type==="all" ? "Бүх нийлүүлэгчдэд дахин илгээгдэнэ" : notif.recipient_type==="individual" ? "Хувь хүн нийлүүлэгчдэд дахин илгээгдэнэ" : "Байгааллага нийлүүлэгчдэд дахин илгээгдэнэ"}
              </div>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={() => setEditing(false)} style={{ flex:1,height:44,borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>Болих</button>
              <button onClick={handleResend} disabled={resending}
                style={{ flex:2,height:44,borderRadius:10,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:resending?0.7:1 }}>
                {resending ? <><Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }}/> Илгээж байна...</> : <><Send size={13}/> Илгээх</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}