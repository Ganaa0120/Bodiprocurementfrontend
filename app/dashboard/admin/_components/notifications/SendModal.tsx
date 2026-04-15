"use client";
import { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle2, Send, ChevronDown, Globe, Users, Building2, Image as ImageIcon } from "lucide-react";
import { API, getToken, inp, lbl } from "./constants";

export function SendModal({ onClose, onSent, showToast }: {
  onClose: () => void; onSent: () => void; showToast: (m: string, ok?: boolean) => void;
}) {
  const [step,         setStep]         = useState(1);
  const [recipType,    setRecipType]    = useState<"all"|"individual"|"company">("all");
  const [form,         setForm]         = useState({ title:"", message:"" });
  const [persons,      setPersons]      = useState<any[]>([]);
  const [companies,    setCompanies]    = useState<any[]>([]);
  const [directions,   setDirections]   = useState<any[]>([]);
  const [selected,     setSelected]     = useState<string[]>([]);
  const [dirFilter,    setDirFilter]    = useState("");
  const [search,       setSearch]       = useState("");
  const [imageFile,    setImageFile]    = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(false);
  const [error,        setError]        = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
      .then(r => r.json())
      .then(d => setDirections((d.directions ?? []).filter((x: any) => x.is_active)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (recipType === "all") return;
    setFetching(true); setSelected([]); setSearch(""); setDirFilter("");
    if (recipType === "individual") {
      fetch(`${API}/api/persons?limit=500`, { headers:{ Authorization:`Bearer ${getToken()}` } })
        .then(r => r.json()).then(d => setPersons(d.persons ?? d.data ?? []))
        .finally(() => setFetching(false));
    } else {
      fetch(`${API}/api/organizations?limit=500`, { headers:{ Authorization:`Bearer ${getToken()}` } })
        .then(r => r.json()).then(d => setCompanies(d.organizations ?? d.data ?? []))
        .finally(() => setFetching(false));
    }
  }, [recipType]);

  const listItems = recipType === "individual" ? persons : companies;
  const getName   = (item: any) => recipType === "individual"
    ? `${item.last_name ?? ""} ${item.first_name ?? ""}`.trim() || item.email
    : item.company_name || item.email;

  const filtered = listItems.filter((item: any) => {
    const q  = search.toLowerCase();
    const nm = getName(item).toLowerCase();
    const em = (item.email || "").toLowerCase();
    return (!q || nm.includes(q) || em.includes(q))
      && (!dirFilter || (Array.isArray(item.activity_directions) && item.activity_directions.includes(dirFilter)));
  });

  const toggleSelect = (id: string) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const selectAll = () => {
    const ids = filtered.map(x => x.id);
    setSelected(prev => ids.every(id => prev.includes(id))
      ? prev.filter(id => !ids.includes(id))
      : [...new Set([...prev, ...ids])]);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setImageFile(f);
    const r = new FileReader();
    r.onload = () => setImagePreview(r.result as string);
    r.readAsDataURL(f);
  };

  const handleSend = async () => {
    if (!form.title.trim()) { setError("Гарчиг шаардлагатай"); return; }
    if (recipType !== "all" && selected.length === 0) { setError("Хүлээн авагч сонгоно уу"); return; }
    setLoading(true); setError("");
    try {
      let image_url: string | undefined;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        try {
          const up = await fetch(`${API}/api/upload`, {
            method:"POST", headers:{ Authorization:`Bearer ${getToken()}` }, body:fd,
          });
          const ud = await up.json();
          if (ud.url) image_url = ud.url;
        } catch {}
      }
      const res = await fetch(`${API}/api/notifications/send`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({
          title: form.title, message: form.message || null,
          recipient_type: recipType,
          recipient_ids: recipType === "all" ? [] : selected,
          image_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(`${data.sent_count ?? "?"} мэдэгдэл илгээгдлэа ✓`);
      onSent();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-start",
      justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",
      padding:"20px 16px",overflowY:"auto" }} onClick={onClose}>
      <div style={{ width:"100%",maxWidth:560,background:"#0d1526",
        border:"1px solid rgba(255,255,255,0.08)",borderRadius:22,padding:28,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)",marginBottom:24 }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:22 }}>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)" }}>Мэдэгдэл илгээх</div>
            <div style={{ fontSize:11,color:"rgba(148,163,184,0.4)",marginTop:2 }}>
              {step === 1 ? "Хүлээн авагчийн төрөл сонгох" : "Мэдэгдлийн мэдээлэл бөглөх"}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:7,cursor:"pointer",color:"rgba(148,163,184,0.5)",display:"flex" }}>
            <X size={15}/>
          </button>
        </div>

        {error && (
          <div style={{ padding:"9px 13px",borderRadius:10,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.18)",marginBottom:16 }}>
            <span style={{ fontSize:12,color:"rgba(239,68,68,0.9)" }}>{error}</span>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {[
              { v:"all",       l:"Бүгдэд илгээх",     d:"Бүх бүртгэлтэй нийлүүлэгчид",           icon:Globe,     color:"#10b981", bg:"rgba(16,185,129,0.12)" },
              { v:"individual",l:"Хувь хүн сонгох",    d:"Тодорхой хувь хүмүүсийг сонгон илгээх", icon:Users,     color:"#3b82f6", bg:"rgba(59,130,246,0.12)" },
              { v:"company",   l:"Байгааллага сонгох", d:"Тодорхой байгааллагуудыг сонгон илгээх", icon:Building2, color:"#a78bfa", bg:"rgba(167,139,250,0.12)" },
            ].map(({v,l,d,icon:Icon,color,bg}) => (
              <button key={v} type="button" onClick={() => { setRecipType(v as any); setStep(2); }}
                style={{ display:"flex",alignItems:"center",gap:16,padding:"18px 20px",borderRadius:14,cursor:"pointer",fontFamily:"inherit",textAlign:"left",background:"rgba(255,255,255,0.03)",border:`1px solid ${color}25`,transition:"all .15s",width:"100%" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = bg; (e.currentTarget as HTMLElement).style.borderColor = color + "60"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.borderColor = color + "25"; }}>
                <div style={{ width:48,height:48,borderRadius:12,flexShrink:0,background:bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Icon size={22} style={{ color }}/>
                </div>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.9)",marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:12,color:"rgba(148,163,184,0.5)" }}>{d}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
              <button onClick={() => { setStep(1); setSelected([]); setDirFilter(""); setSearch(""); }}
                style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"5px 10px",cursor:"pointer",color:"rgba(148,163,184,0.6)",fontSize:12,fontFamily:"inherit" }}>
                ← Буцах
              </button>
              <span style={{ fontSize:12,padding:"4px 12px",borderRadius:99,fontWeight:600,
                background: recipType==="all"?"rgba(16,185,129,0.12)":recipType==="individual"?"rgba(59,130,246,0.12)":"rgba(167,139,250,0.12)",
                color: recipType==="all"?"#10b981":recipType==="individual"?"#60a5fa":"#a78bfa" }}>
                {recipType==="all"?"🌐 Бүгдэд":recipType==="individual"?"👤 Хувь хүн":"🏢 Байгааллага"}
              </span>
            </div>

            {recipType !== "all" && (
              <div>
                <label style={lbl}>Нийлүүлэгч сонгох</label>
                <div style={{ position:"relative",marginBottom:8 }}>
                  <select value={dirFilter} onChange={e => setDirFilter(e.target.value)}
                    style={{ ...inp,height:38,cursor:"pointer",paddingRight:30,appearance:"none" as const,padding:"0 30px 0 12px" }}>
                    <option value="">— Бүх үйл ажиллагааны чиглэл —</option>
                    {directions.map(d => <option key={d.id} value={d.label}>{d.label}</option>)}
                  </select>
                  <ChevronDown size={13} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:"rgba(148,163,184,0.4)",pointerEvents:"none" }}/>
                </div>
                <div style={{ position:"relative",marginBottom:6 }}>
                  <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"rgba(148,163,184,0.3)",pointerEvents:"none" }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Нэр, и-мэйлээр хайх..."
                    style={{ ...inp,height:38,paddingLeft:34 }}
                    onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)"}
                    onBlur={e  => (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}/>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                  <span style={{ fontSize:11,color:"rgba(148,163,184,0.4)" }}>
                    {fetching ? "Ачаалж байна..." : `${filtered.length} / ${listItems.length}`}
                    {selected.length > 0 && <> · <span style={{ color:"#60a5fa",fontWeight:600 }}>{selected.length} сонгогдсон</span></>}
                  </span>
                  {filtered.length > 0 && (
                    <button type="button" onClick={selectAll}
                      style={{ fontSize:11,background:"none",border:"none",color:"rgba(96,165,250,0.7)",cursor:"pointer",fontFamily:"inherit" }}>
                      {filtered.every(x => selected.includes(x.id)) ? "Бүгдийг арилгах" : "Бүгдийг сонгох"}
                    </button>
                  )}
                </div>
                <div style={{ maxHeight:200,overflowY:"auto",background:"rgba(255,255,255,0.02)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",marginBottom:4 }}>
                  {fetching ? (
                    <div style={{ display:"flex",justifyContent:"center",padding:20 }}>
                      <Loader2 size={14} style={{ color:"#60a5fa",animation:"spin 0.8s linear infinite" }}/>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div style={{ padding:"16px",textAlign:"center",fontSize:12,color:"rgba(148,163,184,0.3)" }}>Тохирох бүртгэл олдсонгүй</div>
                  ) : filtered.map(item => {
                    const checked = selected.includes(item.id);
                    const dirs = Array.isArray(item.activity_directions) ? item.activity_directions : [];
                    return (
                      <div key={item.id} onClick={() => toggleSelect(item.id)}
                        style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 14px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.04)",background:checked?"rgba(59,130,246,0.06)":"transparent",transition:"background .1s" }}>
                        <div style={{ width:18,height:18,borderRadius:5,flexShrink:0,background:checked?"#3b82f6":"rgba(255,255,255,0.04)",border:checked?"1px solid #3b82f6":"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          {checked && <CheckCircle2 size={11} color="white"/>}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.85)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{getName(item)}</div>
                          <div style={{ fontSize:10,color:"rgba(148,163,184,0.35)",display:"flex",gap:5,flexWrap:"wrap",marginTop:1 }}>
                            <span>{item.email}</span>
                            {dirs.slice(0,2).map((d: string) => (
                              <span key={d} style={{ padding:"0 5px",borderRadius:99,background:"rgba(59,130,246,0.1)",color:"#60a5fa",fontSize:9 }}>{d}</span>
                            ))}
                            {dirs.length > 2 && <span style={{ fontSize:9,color:"rgba(148,163,184,0.4)" }}>+{dirs.length-2}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label style={lbl}>Гарчиг *</label>
              <input value={form.title} onChange={e => setForm(p => ({...p,title:e.target.value}))}
                style={{ ...inp,height:42 }} placeholder="Мэдэгдлийн гарчиг"
                onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)"}
                onBlur={e  => (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}/>
            </div>

            <div>
              <label style={lbl}>Агуулга (сонголттой)</label>
              <textarea value={form.message} onChange={e => setForm(p => ({...p,message:e.target.value}))}
                rows={3} placeholder="Дэлгэрэнгүй мэдэгдэл..." style={{ ...inp,resize:"vertical" }}
                onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)"}
                onBlur={e  => (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}/>
            </div>

            <div>
              <label style={lbl}>Зураг (сонголттой)</label>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleImage}/>
              {imagePreview ? (
                <div style={{ position:"relative",display:"inline-block" }}>
                  <img src={imagePreview} alt="preview" style={{ maxHeight:140,maxWidth:"100%",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",display:"block" }}/>
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }}
                    style={{ position:"absolute",top:6,right:6,width:24,height:24,borderRadius:"50%",background:"rgba(239,68,68,0.85)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"white" }}>
                    <X size={12}/>
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ width:"100%",height:80,borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(255,255,255,0.12)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,color:"rgba(148,163,184,0.4)",fontFamily:"inherit" }}>
                  <ImageIcon size={20} style={{ opacity:0.5 }}/>
                  <span style={{ fontSize:12 }}>Зураг сонгох</span>
                </button>
              )}
            </div>

            <div style={{ display:"flex",gap:10,marginTop:4 }}>
              <button onClick={onClose} style={{ flex:1,height:44,borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>Болих</button>
              <button onClick={handleSend} disabled={loading}
                style={{ flex:2,height:44,borderRadius:10,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:loading?0.7:1 }}>
                {loading ? <Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/> : <Send size={14}/>}
                {loading ? "Илгээж байна..." : "Илгээх"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}