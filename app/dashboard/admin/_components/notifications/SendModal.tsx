"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  X, Loader2, CheckCircle2, Send, ChevronDown, ChevronRight,
  Globe, Users, Building2, Image as ImageIcon, Filter,
  CheckSquare, Square,
} from "lucide-react";
import { API, getToken, inp, lbl } from "./constants";

type DirGroup = { main_id: number; sub_ids: number[] };

const labelOf = (n: any, fallback: string | number = "") =>
  n?.label_mn ?? n?.label ?? n?.name_mn ?? n?.name ?? n?.main_label ?? n?.sub_label ?? String(fallback);

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

  // ⭐ ШИНЭ: hierarchical multi-select filter
  const [dirFilter,    setDirFilter]    = useState<DirGroup[]>([]);
  const [showDirPicker,setShowDirPicker]= useState(false);
  const [expanded,     setExpanded]     = useState<Set<number>>(new Set());

  const [search,       setSearch]       = useState("");
  const [imageFile,    setImageFile]    = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [fetching,     setFetching]     = useState(false);
  const [error,        setError]        = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  /* ─── Load directions ─── */
  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
      .then(r => r.json())
      .then(d => setDirections((d.directions ?? []).filter((x: any) => x.is_active !== false)))
      .catch(() => {});
  }, []);

  /* ─── Load users when recipient type changes ─── */
  useEffect(() => {
    if (recipType === "all") return;
    setFetching(true); setSelected([]); setSearch("");
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

  /* ─── Direction filter helpers ─── */
  const isMainSelected = (id: number) => dirFilter.some(g => g.main_id === id);
  const getDirGroup    = (id: number) => dirFilter.find(g => g.main_id === id);

  const toggleMainDir = (id: number) => {
    setDirFilter(prev => {
      const exists = prev.some(g => g.main_id === id);
      return exists ? prev.filter(g => g.main_id !== id)
                    : [...prev, { main_id: id, sub_ids: [] }];
    });
    setExpanded(prev => { const n = new Set(prev); n.add(id); return n; });
  };

  const toggleSubDir = (mainId: number, subId: number) => {
    setDirFilter(prev => {
      const idx = prev.findIndex(g => g.main_id === mainId);
      if (idx < 0) return [...prev, { main_id: mainId, sub_ids: [subId] }];
      const grp = prev[idx];
      const has = grp.sub_ids.includes(subId);
      const newGrp = { ...grp, sub_ids: has ? grp.sub_ids.filter(s => s !== subId) : [...grp.sub_ids, subId] };
      return prev.map((g, i) => i === idx ? newGrp : g);
    });
  };

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const dirFilterCount = useMemo(
    () => dirFilter.reduce((acc, g) => acc + (g.sub_ids.length || 1), 0),
    [dirFilter],
  );

  /* ─── Match user against direction filter (хуучин & шинэ format-ыг хоёуланг нь дэмжинэ) ─── */
  const userMatchesDirFilter = (item: any) => {
    if (dirFilter.length === 0) return true;
    const userDirs = item.activity_directions;
    if (!Array.isArray(userDirs) || userDirs.length === 0) return false;

    const isNewFormat = typeof userDirs[0] === "object" && userDirs[0]?.main_id !== undefined;

    return dirFilter.some(f => {
      if (isNewFormat) {
        const userGroup = userDirs.find((u: any) => u.main_id === f.main_id);
        if (!userGroup) return false;
        if (f.sub_ids.length === 0) return true;
        return userGroup.sub_ids?.some((s: number) => f.sub_ids.includes(s));
      } else {
        // Хуучин string[] format — main label-аар хайна
        const mainLabel = directions.find(d => d.id === f.main_id)?.label;
        return mainLabel && userDirs.includes(mainLabel);
      }
    });
  };

  /* ─── List & filter ─── */
  const listItems = recipType === "individual" ? persons : companies;
  const getName   = (item: any) => recipType === "individual"
    ? `${item.last_name ?? ""} ${item.first_name ?? ""}`.trim() || item.email
    : item.company_name || item.email;

  const filtered = listItems.filter((item: any) => {
    const q  = search.toLowerCase();
    const nm = getName(item).toLowerCase();
    const em = (item.email || "").toLowerCase();
    return (!q || nm.includes(q) || em.includes(q)) && userMatchesDirFilter(item);
  });

  const toggleSelect = (id: string) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const selectAll = () => {
    const ids = filtered.map(x => x.id);
    setSelected(prev => ids.every(id => prev.includes(id))
      ? prev.filter(id => !ids.includes(id))
      : [...new Set([...prev, ...ids])]);
  };

  /* ─── Image handler ─── */
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setImageFile(f);
    const r = new FileReader();
    r.onload = () => setImagePreview(r.result as string);
    r.readAsDataURL(f);
  };

  /* ─── Send ─── */
  const handleSend = async () => {
    if (!form.title.trim()) { setError("Гарчиг шаардлагатай"); return; }

    // Дор хаяж нэг target байх ёстой
    const hasTarget = recipType === "all" || selected.length > 0 || dirFilter.length > 0;
    if (!hasTarget) {
      setError("Хүлээн авагч сонгоно уу, эсвэл чиглэлээр шүүж бөөнөөр илгээнэ үү");
      return;
    }

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
          title: form.title,
          message: form.message || null,
          recipient_type: recipType,
          recipient_ids: selected,                                  // хоосон → бөөнөөр илгээх
          direction_filter: dirFilter.length > 0 ? dirFilter : null, // ⭐ ШИНЭ
          image_url: image_url || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(`${data.sent_count ?? "?"} мэдэгдэл илгээгдлэа ✓`);
      onSent();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  /* ─── Send mode тайлбар ─── */
  const sendModeHint = useMemo(() => {
    if (selected.length > 0) return `Сонгосон ${selected.length} ${recipType==="company"?"байгууллага":"хүн"}-д илгээнэ`;
    if (dirFilter.length > 0) return `Шүүлтүүртэй тохирох бүх ${recipType==="all"?"нийлүүлэгч":recipType==="company"?"байгууллага":"хувь хүн"}-д илгээнэ`;
    if (recipType === "all") return "Бүх нийлүүлэгчид илгээнэ";
    return null;
  }, [selected.length, dirFilter.length, recipType]);

  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-start",
      justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",
      padding:"20px 16px",overflowY:"auto" }} onClick={onClose}>
      <div style={{ width:"100%",maxWidth:600,background:"#0d1526",
        border:"1px solid rgba(255,255,255,0.08)",borderRadius:22,padding:28,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)",marginBottom:24 }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:22 }}>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)" }}>Мэдэгдэл илгээх</div>
            <div style={{ fontSize:11,color:"rgba(148,163,184,0.4)",marginTop:2 }}>
              {step === 1 ? "Хүлээн авагчийн төрөл сонгох" : "Шүүлтүүр болон агуулга бөглөх"}
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

        {/* ─────────── Step 1 ─────────── */}
        {step === 1 && (
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {[
              { v:"all",       l:"Бүгдэд илгээх",     d:"Бүх бүртгэлтэй нийлүүлэгчид",           icon:Globe,     color:"#10b981", bg:"rgba(16,185,129,0.12)" },
              { v:"individual",l:"Хувь хүнд",          d:"Зөвхөн хувь хүн нийлүүлэгчид",           icon:Users,     color:"#3b82f6", bg:"rgba(59,130,246,0.12)" },
              { v:"company",   l:"Байгууллагад",       d:"Зөвхөн байгууллага нийлүүлэгчид",         icon:Building2, color:"#a78bfa", bg:"rgba(167,139,250,0.12)" },
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

        {/* ─────────── Step 2 ─────────── */}
        {step === 2 && (
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {/* Header chip */}
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
              <button onClick={() => { setStep(1); setSelected([]); setDirFilter([]); setSearch(""); }}
                style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"5px 10px",cursor:"pointer",color:"rgba(148,163,184,0.6)",fontSize:12,fontFamily:"inherit" }}>
                ← Буцах
              </button>
              <span style={{ fontSize:12,padding:"4px 12px",borderRadius:99,fontWeight:600,
                background: recipType==="all"?"rgba(16,185,129,0.12)":recipType==="individual"?"rgba(59,130,246,0.12)":"rgba(167,139,250,0.12)",
                color: recipType==="all"?"#10b981":recipType==="individual"?"#60a5fa":"#a78bfa" }}>
                {recipType==="all"?"🌐 Бүгдэд":recipType==="individual"?"👤 Хувь хүн":"🏢 Байгууллага"}
              </span>
            </div>

            {/* ⭐ Hierarchical direction filter — бүх төрөлд хэрэглэх боломжтой */}
            <div>
              <label style={lbl}>Үйл ажиллагааны чиглэлээр шүүх</label>
              <div style={{ borderRadius:10,
                background: dirFilter.length>0 ? "rgba(59,130,246,0.05)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${dirFilter.length>0 ? "rgba(59,130,246,0.22)" : "rgba(255,255,255,0.07)"}`,
                overflow:"hidden",transition:"all .15s" }}>

                <button type="button" onClick={() => setShowDirPicker(v => !v)}
                  style={{ width:"100%",padding:"10px 13px",cursor:"pointer",background:"transparent",
                    border:"none",fontFamily:"inherit",
                    display:"flex",alignItems:"center",gap:9,textAlign:"left" as const }}>
                  <Filter size={13} style={{ color: dirFilter.length>0 ? "#60a5fa" : "rgba(148,163,184,0.5)" }}/>
                  <span style={{ flex:1,fontSize:12,
                    color: dirFilter.length>0 ? "#bfdbfe" : "rgba(255,255,255,0.7)" }}>
                    {dirFilter.length === 0
                      ? "Шүүлтгүй (бүх чиглэл)"
                      : `${dirFilterCount} зүйл сонгосон`}
                  </span>
                  {dirFilter.length > 0 && (
                    <button type="button" onClick={e => { e.stopPropagation(); setDirFilter([]); }}
                      style={{ fontSize:10,color:"rgba(239,68,68,0.7)",background:"none",
                        border:"none",cursor:"pointer",padding:"2px 6px",fontFamily:"inherit" }}>
                      ✕ Арилгах
                    </button>
                  )}
                  {showDirPicker
                    ? <ChevronDown size={13} style={{ color:"rgba(148,163,184,0.5)" }}/>
                    : <ChevronRight size={13} style={{ color:"rgba(148,163,184,0.5)" }}/>}
                </button>

                {showDirPicker && (
                  <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",
                    padding:"4px 6px 8px",maxHeight:240,overflowY:"auto" }}>
                    {directions.length === 0 ? (
                      <div style={{ padding:"14px",fontSize:11,color:"rgba(148,163,184,0.5)",textAlign:"center" as const }}>
                        Чиглэлүүд олдсонгүй
                      </div>
                    ) : directions.map((dir: any) => {
                      const id = dir.id;
                      const subs = (dir.subs ?? dir.children ?? []) as any[];
                      const checked = isMainSelected(id);
                      const grp = getDirGroup(id);
                      const isExp = expanded.has(id);
                      const allSubs = checked && (!grp || grp.sub_ids.length === 0);

                      return (
                        <div key={id} style={{ marginBottom:2 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:7,
                            padding:"6px 9px",borderRadius:7,
                            background: checked ? "rgba(59,130,246,0.06)" : "transparent" }}>
                            <button type="button" onClick={() => toggleMainDir(id)}
                              style={{ display:"flex",alignItems:"center",gap:7,flex:1,
                                background:"none",border:"none",cursor:"pointer",
                                fontFamily:"inherit",textAlign:"left" as const,padding:0 }}>
                              {checked
                                ? <CheckSquare size={13} style={{ color:"#60a5fa" }}/>
                                : <Square size={13} style={{ color:"rgba(148,163,184,0.4)" }}/>}
                              <span style={{ fontSize:12,fontWeight:checked?600:500,
                                color: checked ? "#bfdbfe" : "rgba(255,255,255,0.78)" }}>
                                {labelOf(dir, id)}
                              </span>
                              {allSubs && (
                                <span style={{ fontSize:9,padding:"2px 6px",borderRadius:99,
                                  background:"rgba(59,130,246,0.12)",color:"#60a5fa",fontWeight:700 }}>
                                  Бүх дэд
                                </span>
                              )}
                            </button>
                            {checked && subs.length > 0 && (
                              <button type="button" onClick={() => toggleExpand(id)}
                                style={{ background:"none",border:"none",cursor:"pointer",
                                  color:"rgba(148,163,184,0.5)",display:"flex",padding:2 }}>
                                {isExp ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                              </button>
                            )}
                          </div>

                          {checked && isExp && subs.length > 0 && (
                            <div style={{ paddingLeft:26,marginTop:1,marginBottom:4 }}>
                              {subs.map((sub: any) => {
                                const sid = sub.id;
                                const subChecked = grp?.sub_ids.includes(sid) ?? false;
                                return (
                                  <button key={sid} type="button"
                                    onClick={() => toggleSubDir(id, sid)}
                                    style={{ display:"flex",alignItems:"center",gap:7,
                                      padding:"4px 9px",borderRadius:5,width:"100%",
                                      background: subChecked ? "rgba(59,130,246,0.05)" : "transparent",
                                      border:"none",cursor:"pointer",fontFamily:"inherit",
                                      textAlign:"left" as const }}>
                                    {subChecked
                                      ? <CheckSquare size={11} style={{ color:"#60a5fa" }}/>
                                      : <Square size={11} style={{ color:"rgba(148,163,184,0.35)" }}/>}
                                    <span style={{ fontSize:11,
                                      color: subChecked ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)" }}>
                                      {labelOf(sub, sid)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* User selection — recipType !== "all" үед optional */}
            {recipType !== "all" && (
              <div>
                <label style={lbl}>
                  Тодорхой нийлүүлэгч сонгох <span style={{ color:"rgba(148,163,184,0.4)",fontWeight:400,textTransform:"none" as const,letterSpacing:0 }}>(заавал биш)</span>
                </label>

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
                <div style={{ maxHeight:180,overflowY:"auto",background:"rgba(255,255,255,0.02)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",marginBottom:4 }}>
                  {fetching ? (
                    <div style={{ display:"flex",justifyContent:"center",padding:20 }}>
                      <Loader2 size={14} style={{ color:"#60a5fa",animation:"spin 0.8s linear infinite" }}/>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div style={{ padding:"16px",textAlign:"center",fontSize:12,color:"rgba(148,163,184,0.3)" }}>Тохирох бүртгэл олдсонгүй</div>
                  ) : filtered.map(item => {
                    const checked = selected.includes(item.id);
                    return (
                      <div key={item.id} onClick={() => toggleSelect(item.id)}
                        style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 13px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.04)",background:checked?"rgba(59,130,246,0.06)":"transparent",transition:"background .1s" }}>
                        <div style={{ width:17,height:17,borderRadius:5,flexShrink:0,background:checked?"#3b82f6":"rgba(255,255,255,0.04)",border:checked?"1px solid #3b82f6":"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                          {checked && <CheckCircle2 size={11} color="white"/>}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.85)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{getName(item)}</div>
                          <div style={{ fontSize:10,color:"rgba(148,163,184,0.35)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                            {item.email}
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
              <label style={lbl}>Агуулга (заавал биш)</label>
              <textarea value={form.message} onChange={e => setForm(p => ({...p,message:e.target.value}))}
                rows={3} placeholder="Дэлгэрэнгүй мэдэгдэл..." style={{ ...inp,resize:"vertical" }}
                onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)"}
                onBlur={e  => (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}/>
            </div>

            <div>
              <label style={lbl}>Зураг (заавал биш)</label>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleImage}/>
              {imagePreview ? (
                <div style={{ position:"relative",display:"inline-block",width:"100%" }}>
                  <img src={imagePreview} alt="preview" style={{ maxHeight:140,width:"100%",objectFit:"cover",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",display:"block" }}/>
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }}
                    style={{ position:"absolute",top:6,right:6,width:24,height:24,borderRadius:"50%",background:"rgba(239,68,68,0.85)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"white" }}>
                    <X size={12}/>
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ width:"100%",height:72,borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(255,255,255,0.12)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,color:"rgba(148,163,184,0.4)",fontFamily:"inherit" }}>
                  <ImageIcon size={18} style={{ opacity:0.5 }}/>
                  <span style={{ fontSize:12 }}>Зураг сонгох</span>
                </button>
              )}
            </div>

            {/* Send mode hint */}
            {sendModeHint && (
              <div style={{ padding:"10px 14px",borderRadius:10,
                background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.18)" }}>
                <div style={{ fontSize:11,color:"rgba(192,132,252,0.85)",fontWeight:600,
                  display:"flex",alignItems:"center",gap:6 }}>
                  📤 {sendModeHint}
                </div>
                {dirFilter.length > 0 && (
                  <div style={{ fontSize:10,color:"rgba(148,163,184,0.55)",marginTop:4,lineHeight:1.5 }}>
                    "Бүх чиглэлээр" сонгосон хэрэглэгчид үргэлж хүлээн авна.
                    "Сонгосон чиглэлээр"-ийнхэн зөвхөн давхцалтай үед хүлээн авна.
                  </div>
                )}
              </div>
            )}

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