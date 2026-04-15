"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3, Bell, Building2, Users, LogOut,
  RefreshCw, Eye, Search, FileText, CheckCircle2,
  Clock, AlertCircle, ShieldCheck, X, Loader2,
  Trash2, Pencil, Plus, ChevronRight, ChevronDown,
  Lock, EyeOff, Activity,
} from "lucide-react";
import { NotificationsTab } from "../admin/_components/NotificationsTab";
import { CompaniesTab }     from "../admin/_components/CompaniesTab";
import { AnnouncementsTab } from "../admin/_components/Announcementstab";
import { CategoriesTab } from "../admin/_components/Categoriestab";
import { DirectionsTab } from "../admin/_components/Directionstab";
import { IndividualsTab } from "../admin/_components/individuals/IndividualsTab";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const tok = () => localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";
const authH = () => ({ Authorization:`Bearer ${tok()}` });
const jsonH = () => ({ "Content-Type":"application/json", ...authH() });

type NavId = "dashboard"|"individuals"|"companies"|"notifications"|"announcements"|"sub-admins"|"categories"|"directions";

// ── Permission definitions (super admin-тай ижил) ─────────────
const NAV_PERMS = [
  { id:"dashboard",     label:"Хянах самбар",            icon:"📊" },
  { id:"notifications", label:"Мэдэгдэл",                icon:"🔔" },
  { id:"companies",     label:"Компаниуд",                icon:"🏢" },
  { id:"individuals",   label:"Хувь хүн",                 icon:"👤" },
  { id:"announcements", label:"Зарлалууд",                icon:"📢" },
  { id:"sub-admins",    label:"Миний Админууд",           icon:"🛡️" },
];

const SUB_PERMS: Record<string,{id:string;label:string;desc:string}[]> = {
  notifications: [
    {id:"notifications.view",label:"Харах",desc:"Мэдэгдлийн жагсаалт"},
    {id:"notifications.send",label:"Илгээх",desc:"Мэдэгдэл илгээх"},
  ],
  companies: [
    {id:"companies.view",label:"Харах",desc:"Компанийн жагсаалт"},
    {id:"companies.edit_status",label:"Статус солих",desc:"Компанийн статус"},
    {id:"companies.edit",label:"Засах",desc:"Мэдээлэл засах"},
    {id:"companies.delete",label:"Устгах",desc:"Компани устгах"},
  ],
  individuals: [
    {id:"individuals.view",label:"Харах",desc:"Хувь хүний жагсаалт"},
    {id:"individuals.edit_status",label:"Статус солих",desc:"Статус өөрчлөх"},
    {id:"individuals.edit",label:"Засах",desc:"Мэдээлэл засах"},
    {id:"individuals.delete",label:"Устгах",desc:"Хувь хүн устгах"},
  ],
  announcements: [
    {id:"announcements.view",label:"Харах",desc:"Зарлалууд харах"},
    {id:"announcements.create",label:"Үүсгэх",desc:"Шинэ зарлал"},
    {id:"announcements.edit",label:"Засах",desc:"Зарлал засах"},
    {id:"announcements.publish",label:"Нийтлэх",desc:"Статус солих"},
    {id:"announcements.delete",label:"Устгах",desc:"Зарлал устгах"},
  ],
};

const ALL_PERMS_FLAT = Object.values(SUB_PERMS).flat().map(p=>p.id);

const STATUS_CFG: Record<string,{label:string;color:string;bg:string}> = {
  approved: {label:"Зөвшөөрсөн",color:"#10b981",bg:"rgba(16,185,129,0.12)"},
  pending:  {label:"Хүлээгдэж", color:"#f59e0b",bg:"rgba(245,158,11,0.12)"},
  active:   {label:"Идэвхтэй",  color:"#10b981",bg:"rgba(16,185,129,0.12)"},
  inactive: {label:"Идэвхгүй",  color:"#94a3b8",bg:"rgba(148,163,184,0.1)"},
  returned: {label:"Буцаагдсан",color:"#f59e0b",bg:"rgba(245,158,11,0.12)"},
};

function Badge({ s }:{ s:string }) {
  const c = STATUS_CFG[s] ?? STATUS_CFG.pending;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",
    borderRadius:99,background:c.bg,fontSize:11,fontWeight:600,color:c.color}}>
    <span style={{width:5,height:5,borderRadius:"50%",background:c.color}}/>{c.label}</span>;
}
function Th({ h }:{ h:string }) {
  return <th style={{textAlign:"left",padding:"10px 16px",fontSize:10,fontWeight:700,
    color:"rgba(148,163,184,0.3)",textTransform:"uppercase" as const,
    letterSpacing:"0.1em",borderBottom:"1px solid rgba(255,255,255,0.04)",
    whiteSpace:"nowrap" as const}}>{h}</th>;
}

const OLD_FORMAT_MAP: Record<string,string[]> = {
  dashboard:     ["dashboard.view"],
  notifications: ["notifications.view","notifications.send"],
  companies:     ["companies.view","companies.edit_status","companies.edit","companies.delete"],
  individuals:   ["individuals.view","individuals.edit_status","individuals.edit","individuals.delete"],
  categories:    ["categories.view","categories.manage"],
  directions:    ["directions.view","directions.manage"],
  announcements: ["announcements.view","announcements.create","announcements.edit","announcements.publish","announcements.delete"],
  admins:        ["admins.view","admins.manage"],
};

function parsePerms(raw: any): string[] {
  if (!raw) return ["dashboard","dashboard.view"];
  let arr: string[] = [];
  if (Array.isArray(raw)) arr = raw;
  else { try { arr = JSON.parse(raw); } catch { arr = ["dashboard","dashboard.view"]; } }
  if (arr.length === 0) return ["dashboard","dashboard.view"];

  const isOldFormat = arr.every((p: string) => !p.includes("."));
  if (isOldFormat) {
    return [...new Set(arr.flatMap((id: string) => OLD_FORMAT_MAP[id] ?? [id]))];
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────
// Sub-Admin Modal (mini admin creates admins under them)
// ─────────────────────────────────────────────────────────────
function SubAdminModal({ mode, admin, parentPerms, onClose, onSave }: {
  mode:"create"|"edit"; admin?:any; parentPerms:string[];
  onClose:()=>void; onSave:()=>void;
}) {
  const [form, setForm] = useState({
    first_name:   admin?.first_name   ?? "",
    last_name:    admin?.last_name    ?? "",
    company_name: admin?.company_name ?? "",
    email:        admin?.email        ?? "",
    phone:        admin?.phone        ?? "",
    password:     "",
  });
  const [perms,    setPerms]    = useState<string[]>(parsePerms(admin?.permissions));
  const [showPw,   setShowPw]   = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["individuals"]));
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Mini admin-ын permissions-аас хэтрүүлж болохгүй
  const availableNavs = NAV_PERMS.filter(n =>
    n.id==="dashboard" ||
    parentPerms.includes(`${n.id}.view`) ||
    parentPerms.some(p=>p.startsWith(`${n.id}.`))
  ).filter(n=>n.id!=="sub-admins"); // sub-admins-г дамжуулахгүй

  const navVisible = (id:string) => perms.includes(`${id}.view`) || id==="dashboard" && perms.includes("dashboard.view");

  const toggleNav = (id:string) => {
    if (id==="dashboard") return;
    const viewId = `${id}.view`;
    if (navVisible(id)) setPerms(p=>p.filter(x=>!x.startsWith(`${id}.`)));
    else setPerms(p=>[...new Set([...p,viewId])]);
  };

  const toggleSub = (subId:string) => {
    setPerms(p=>p.includes(subId)?p.filter(x=>x!==subId):[...p,subId]);
  };

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const finalPerms = perms.filter(p=>parentPerms.includes(p)||p==="dashboard"||p==="dashboard.view");
      if (mode==="create") {
        if (!form.first_name||!form.last_name||!form.email||!form.password) {
          setError("Бүх заавал талбарыг бөглөнө үү"); setLoading(false); return;
        }
        const res = await fetch(`${API}/api/super-admins/create`, {
          method:"POST", headers:jsonH(),
          body:JSON.stringify({...form, role:"admin", permissions:finalPerms}),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      } else {
        const res = await fetch(`${API}/api/super-admins/${admin.id}`, {
          method:"PUT", headers:jsonH(),
          body:JSON.stringify({
            first_name:form.first_name, last_name:form.last_name,
            company_name:form.company_name, phone:form.phone,
            permissions:finalPerms,
          }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      }
      onSave();
    } catch(e:any){ setError(e.message); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = {
    width:"100%",height:40,background:"rgba(255,255,255,0.04)",
    border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,padding:"0 12px",
    fontSize:13,color:"rgba(255,255,255,0.82)",outline:"none",fontFamily:"inherit",
  };
  const lbl: React.CSSProperties = {
    fontSize:10,fontWeight:700,letterSpacing:"0.09em",
    textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",
    display:"block" as const,marginBottom:5,
  };
  const fo = (e:any) => (e.target as HTMLElement).style.borderColor="rgba(59,130,246,0.4)";
  const bl = (e:any) => (e.target as HTMLElement).style.borderColor="rgba(255,255,255,0.08)";

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-start",
      justifyContent:"center",background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)",
      overflowY:"auto",padding:"20px 16px"}}
      onClick={onClose}>
      <div style={{width:"100%",maxWidth:560,background:"#0d1526",
        border:"1px solid rgba(255,255,255,0.08)",borderRadius:22,padding:28,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)",marginBottom:24}}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)"}}>
              {mode==="create"?"Шинэ Дэд Админ":"Дэд Админ засах"}
            </div>
            <div style={{fontSize:11,color:"rgba(148,163,184,0.4)",marginTop:2}}>
              Зөвхөн өөрт байгаа эрхийг л олгоно
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:7,
            cursor:"pointer",color:"rgba(148,163,184,0.5)",display:"flex"}}><X size={15}/></button>
        </div>

        {error && (
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,
            background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.18)",marginBottom:14}}>
            <AlertCircle size={13} style={{color:"#ef4444",flexShrink:0}}/>
            <span style={{fontSize:12,color:"rgba(239,68,68,0.9)"}}>{error}</span>
          </div>
        )}

        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={lbl}>Овог *</label>
              <input value={form.last_name} onChange={e=>setForm(p=>({...p,last_name:e.target.value}))}
                placeholder="Овог" required style={inp} onFocus={fo} onBlur={bl}/></div>
            <div><label style={lbl}>Нэр *</label>
              <input value={form.first_name} onChange={e=>setForm(p=>({...p,first_name:e.target.value}))}
                placeholder="Нэр" required style={inp} onFocus={fo} onBlur={bl}/></div>
          </div>
          <div><label style={lbl}>Компани</label>
            <input value={form.company_name} onChange={e=>setForm(p=>({...p,company_name:e.target.value}))}
              placeholder="Компанийн нэр" style={inp} onFocus={fo} onBlur={bl}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={lbl}>И-мэйл *</label>
              <input type="email" value={form.email}
                onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                placeholder="mail@example.mn" required disabled={mode==="edit"}
                style={{...inp,opacity:mode==="edit"?0.5:1}} onFocus={fo} onBlur={bl}/></div>
            <div><label style={lbl}>Утас</label>
              <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}
                placeholder="99001122" style={inp} onFocus={fo} onBlur={bl}/></div>
          </div>
          {mode==="create" && (
            <div><label style={lbl}>Нууц үг *</label>
              <div style={{position:"relative"}}>
                <input type={showPw?"text":"password"} value={form.password}
                  onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                  placeholder="••••••••" required style={{...inp,paddingRight:40}}
                  onFocus={fo} onBlur={bl}/>
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                    background:"none",border:"none",cursor:"pointer",
                    color:"rgba(255,255,255,0.3)",display:"flex"}}>
                  {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>
          )}

          {/* Permissions */}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.75)",
                  display:"flex",alignItems:"center",gap:6}}>
                  <Lock size={13} style={{color:"#60a5fa"}}/>
                  Цэсний эрх
                </div>
                <div style={{fontSize:11,color:"rgba(148,163,184,0.4)",marginTop:2}}>
                  Зөвхөн өөрт байгаа эрхийн хүрээнд олгоно
                </div>
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {/* Dashboard — always */}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
                borderRadius:10,background:"rgba(59,130,246,0.06)",
                border:"1px solid rgba(59,130,246,0.2)"}}>
                <div style={{width:20,height:20,borderRadius:6,flexShrink:0,
                  background:"#3b82f6",border:"1px solid #3b82f6",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <CheckCircle2 size={12} color="white"/>
                </div>
                <span style={{fontSize:16}}>📊</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>
                    Хянах самбар
                  </div>
                </div>
                <span style={{fontSize:10,padding:"2px 7px",borderRadius:99,
                  background:"rgba(148,163,184,0.1)",color:"rgba(148,163,184,0.5)"}}>заавал</span>
              </div>

              {availableNavs.filter(n=>n.id!=="dashboard").map(nav=>{
                const vis = navVisible(nav.id);
                const subs = SUB_PERMS[nav.id] || [];
                const isExpanded = expanded.has(nav.id);
                const activeCount = subs.filter(s=>perms.includes(s.id)).length;

                // Parent-аас хэтрүүлж болохгүй
                const availableSubs = subs.filter(s=>parentPerms.includes(s.id));

                return (
                  <div key={nav.id} style={{borderRadius:11,overflow:"hidden",
                    border:vis?"1px solid rgba(59,130,246,0.2)":"1px solid rgba(255,255,255,0.06)",
                    background:vis?"rgba(59,130,246,0.04)":"rgba(255,255,255,0.02)"}}>
                    {/* Nav row */}
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px"}}>
                      <button type="button" onClick={()=>toggleNav(nav.id)}
                        style={{width:20,height:20,borderRadius:6,flexShrink:0,cursor:"pointer",
                          background:vis?"#3b82f6":"rgba(255,255,255,0.05)",
                          border:vis?"1px solid #3b82f6":"1px solid rgba(255,255,255,0.12)",
                          display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {vis&&<CheckCircle2 size={12} color="white"/>}
                      </button>
                      <span style={{fontSize:15,flexShrink:0}}>{nav.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,
                          color:vis?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.4)"}}>
                          {nav.label}
                        </div>
                        {vis&&availableSubs.length>0&&(
                          <div style={{fontSize:10,color:"rgba(148,163,184,0.4)",marginTop:1}}>
                            {activeCount}/{availableSubs.length} эрх
                          </div>
                        )}
                      </div>
                      {vis&&availableSubs.length>1&&(
                        <button type="button"
                          onClick={()=>setExpanded(prev=>{const n=new Set(prev);n.has(nav.id)?n.delete(nav.id):n.add(nav.id);return n;})}
                          style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
                            borderRadius:7,padding:"3px 8px",cursor:"pointer",
                            display:"flex",alignItems:"center",gap:3,
                            fontSize:10,color:"rgba(148,163,184,0.5)",fontFamily:"inherit"}}>
                          {isExpanded?"Хаах":"Дэлгэрэнгүй"}
                          {isExpanded?<ChevronDown size={10}/>:<ChevronRight size={10}/>}
                        </button>
                      )}
                    </div>

                    {/* Sub perms */}
                    {vis&&isExpanded&&availableSubs.length>1&&(
                      <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",
                        padding:"8px 14px 10px"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                          {availableSubs.map(sub=>{
                            const checked = perms.includes(sub.id);
                            const isView = sub.id===`${nav.id}.view`;
                            return (
                              <div key={sub.id} onClick={()=>!isView&&toggleSub(sub.id)}
                                style={{display:"flex",alignItems:"flex-start",gap:8,
                                  padding:"7px 9px",borderRadius:8,cursor:isView?"default":"pointer",
                                  background:checked?"rgba(59,130,246,0.08)":"rgba(255,255,255,0.02)",
                                  border:checked?"1px solid rgba(59,130,246,0.18)":"1px solid rgba(255,255,255,0.05)",
                                  opacity:isView?0.7:1}}>
                                <div style={{width:15,height:15,borderRadius:4,flexShrink:0,marginTop:1,
                                  background:checked?"#3b82f6":"rgba(255,255,255,0.05)",
                                  border:checked?"1px solid #3b82f6":"1px solid rgba(255,255,255,0.15)",
                                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  {checked&&<CheckCircle2 size={9} color="white"/>}
                                </div>
                                <div>
                                  <div style={{fontSize:11,fontWeight:600,
                                    color:checked?"rgba(255,255,255,0.85)":"rgba(255,255,255,0.4)"}}>
                                    {sub.label}
                                  </div>
                                  <div style={{fontSize:10,color:"rgba(148,163,184,0.35)",marginTop:1}}>
                                    {sub.desc}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div style={{display:"flex",gap:10,marginTop:4}}>
            <button type="button" onClick={onClose}
              style={{flex:1,height:44,borderRadius:10,background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",
                fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Болих</button>
            <button type="submit" disabled={loading}
              style={{flex:2,height:44,borderRadius:10,
                background:"linear-gradient(135deg,#0f766e,#0d9488)",border:"none",
                color:"white",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:loading?0.7:1}}>
              {loading?<Loader2 size={13} style={{animation:"spin 0.8s linear infinite"}}/>:<CheckCircle2 size={13}/>}
              {loading?"Хадгалж байна...":mode==="create"?"Үүсгэх":"Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-Admins Tab
// ─────────────────────────────────────────────────────────────
function SubAdminsTab({ myPerms, showToast }: { myPerms:string[]; showToast:(m:string,ok?:boolean)=>void }) {
  const [admins,  setAdmins]  = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal,   setModal]   = useState<"create"|"edit"|null>(null);
  const [target,  setTarget]  = useState<any>(null);
  const [delId,   setDelId]   = useState<string|null>(null);
  const [delLoad, setDelLoad] = useState(false);
  const [search,  setSearch]  = useState("");

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/super-admins?role=sub_admin`, {headers:authH()});
      const d   = await res.json();
      if (d.success) setAdmins(d.admins??[]);
    } catch{} finally{ setLoading(false); }
  },[]);

  useEffect(()=>{ load(); },[load]);

  const handleDelete = async()=>{
    if (!delId) return;
    setDelLoad(true);
    try {
      const res = await fetch(`${API}/api/super-admins/${delId}`,{method:"DELETE",headers:authH()});
      const d   = await res.json();
      if (!res.ok) throw new Error(d.message);
      setAdmins(p=>p.filter(a=>a.id!==delId));
      showToast("Устгагдлаа");
      setDelId(null);
    } catch(e:any){ showToast(e.message,false); }
    finally{ setDelLoad(false); }
  };

  const filtered = admins.filter(a=>{
    const q=search.toLowerCase();
    return !q||`${a.last_name??""} ${a.first_name??""} ${a.email}`.toLowerCase().includes(q);
  });

  return (
    <>
      {(modal==="create"||modal==="edit")&&(
        <SubAdminModal mode={modal} admin={target} parentPerms={myPerms}
          onClose={()=>{setModal(null);setTarget(null);}}
          onSave={()=>{setModal(null);setTarget(null);load();showToast(modal==="create"?"Үүсгэлээ":"Хадгаллаа");}}/>
      )}

      {delId&&(
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",
          justifyContent:"center",background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)"}}
          onClick={()=>setDelId(null)}>
          <div style={{width:"100%",maxWidth:360,background:"#0d1526",
            border:"1px solid rgba(239,68,68,0.2)",borderRadius:20,padding:26}}
            onClick={e=>e.stopPropagation()}>
            <div style={{width:48,height:48,borderRadius:14,background:"rgba(239,68,68,0.1)",
              display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <Trash2 size={20} style={{color:"#ef4444"}}/>
            </div>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)"}}>Устгах уу?</div>
              <div style={{fontSize:12,color:"rgba(148,163,184,0.5)",marginTop:6}}>
                Энэ дэд админыг бүрмөсөн устгана
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDelId(null)} style={{flex:1,height:40,borderRadius:10,
                background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
                color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Болих</button>
              <button onClick={handleDelete} disabled={delLoad} style={{flex:1,height:40,borderRadius:10,
                background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                color:"#ef4444",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                {delLoad?<Loader2 size={12} style={{animation:"spin 0.8s linear infinite"}}/>:<Trash2 size={12}/>}Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-in" style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Toolbar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
          <div style={{position:"relative"}}>
            <Search size={13} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",
              color:"rgba(148,163,184,0.4)",pointerEvents:"none"}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Нэр, и-мэйл хайх..." className="gi" style={{width:220}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={load} style={{padding:"9px 12px",borderRadius:10,
              background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
              color:"rgba(148,163,184,0.6)",cursor:"pointer",display:"flex",alignItems:"center"}}>
              <RefreshCw size={13} style={{animation:loading?"spin 1s linear infinite":undefined}}/>
            </button>
            <button onClick={()=>{setTarget(null);setModal("create");}}
              style={{padding:"9px 16px",borderRadius:10,
                background:"linear-gradient(135deg,#0f766e,#0d9488)",border:"none",
                color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                display:"flex",alignItems:"center",gap:6}}>
              <Plus size={14}/> Дэд Админ нэмэх
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div style={{padding:"12px 16px",borderRadius:12,background:"rgba(14,116,144,0.06)",
          border:"1px solid rgba(14,165,233,0.15)",display:"flex",alignItems:"center",gap:10}}>
          <Lock size={14} style={{color:"#38bdf8",flexShrink:0}}/>
          <span style={{fontSize:12,color:"rgba(148,212,229,0.7)"}}>
            Дэд админ зөвхөн таны хуваарилсан эрхийн хүрээнд ажиллана.
            Өөрт байгаагаас илүү эрх олгох боломжгүй.
          </span>
        </div>

        {/* Table */}
        <div style={{background:"#0d1526",border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:16,overflow:"hidden"}}>
          {loading?(
            <div style={{display:"flex",justifyContent:"center",padding:48,gap:10}}>
              <div style={{width:20,height:20,border:"2px solid rgba(14,165,233,0.3)",
                borderTopColor:"#0ea5e9",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
              <span style={{fontSize:13,color:"rgba(148,163,184,0.4)"}}>Ачаалж байна...</span>
            </div>
          ):(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr><Th h="Нэр"/><Th h="И-мэйл"/><Th h="Эрхүүд"/><Th h="Статус"/><Th h=""/></tr>
              </thead>
              <tbody>
                {filtered.length===0?(
                  <tr><td colSpan={5} style={{padding:"48px 16px",textAlign:"center",
                    fontSize:13,color:"rgba(148,163,184,0.3)"}}>
                    {admins.length===0
                      ? <div>
                          <ShieldCheck size={28} style={{color:"rgba(148,163,184,0.15)",margin:"0 auto 10px",display:"block"}}/>
                          <p style={{margin:0}}>Дэд админ байхгүй байна</p>
                          <p style={{margin:"6px 0 0",fontSize:11,color:"rgba(148,163,184,0.25)"}}>
                            Шинэ дэд админ нэмж эрх хуваарилна уу
                          </p>
                        </div>
                      : "Хайлтад тохирох үр дүн олдсонгүй"}
                  </td></tr>
                ):filtered.map((a,i)=>{
                  const aPerms = parsePerms(a.permissions);
                  const navCount = NAV_PERMS.filter(n=>
                    aPerms.includes(`${n.id}.view`) ||
                    (n.id==="dashboard" && (aPerms.includes("dashboard.view")||aPerms.includes("dashboard")))
                  ).length;
                  return (
                    <tr key={a.id} className="tr">
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:32,height:32,borderRadius:9,flexShrink:0,
                            background:"rgba(14,165,233,0.12)",border:"1px solid rgba(14,165,233,0.2)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:13,fontWeight:700,color:"#38bdf8"}}>
                            {a.first_name?.[0]??a.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>
                              {a.last_name} {a.first_name}
                            </div>
                            {a.company_name&&<div style={{fontSize:10,color:"rgba(148,163,184,0.35)",marginTop:1}}>{a.company_name}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"12px 16px",fontSize:12,color:"rgba(148,163,184,0.5)"}}>{a.email}</td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{fontSize:13,fontWeight:700,color:"#38bdf8"}}>{navCount}</span>
                          <span style={{fontSize:11,color:"rgba(148,163,184,0.4)"}}>
                            / {NAV_PERMS.filter(n=>n.id!=="sub-admins").length} цэс
                          </span>
                        </div>
                      </td>
                      <td style={{padding:"12px 16px"}}><Badge s={a.status}/></td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>{setTarget(a);setModal("edit");}}
                            style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.18)",
                              borderRadius:8,padding:"6px 8px",cursor:"pointer",display:"flex",
                              alignItems:"center",color:"#60a5fa"}}>
                            <Pencil size={12}/>
                          </button>
                          <button onClick={()=>setDelId(a.id)}
                            style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",
                              borderRadius:8,padding:"6px 8px",cursor:"pointer",display:"flex",
                              alignItems:"center",color:"rgba(239,68,68,0.7)"}}>
                            <Trash2 size={12}/>
                          </button>
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

// ─────────────────────────────────────────────────────────────
// Mini Admin Dashboard
// ─────────────────────────────────────────────────────────────
export default function MiniAdminDashboard() {
  const router = useRouter();
  const [me,       setMe]       = useState<any>(null);
  const [myPerms,  setMyPerms]  = useState<string[]>([]);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [nav,      setNav]      = useState<NavId>("dashboard");
  const [persons,  setPersons]  = useState<any[]>([]);
  const [companies,setCompanies]= useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [pSearch,  setPSearch]  = useState("");
  const [pStatus,  setPStatus]  = useState("");
  const [toast,    setToast]    = useState<{msg:string;ok:boolean}|null>(null);
  const [unread,   setUnread]   = useState(0);

  const showToast = (msg:string,ok=true)=>{ setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  useEffect(()=>{
    const raw = localStorage.getItem("super_admin_user")||localStorage.getItem("user");
    if (!tok()||!raw) { router.replace("/login"); return; }
    try {
      const cached = JSON.parse(raw);
      if (cached.role === "super_admin") { router.replace("/dashboard/admin"); return; }
      // Cached data-г түр хэрэглэнэ
      setIsSubAdmin(!!cached.parent_id);
      setMe(cached);
      setMyPerms([...new Set([...parsePerms(cached.permissions), "dashboard.view"])]);
    } catch { router.replace("/login"); return; }

    // Mount-д notification unread count татна
    const t2 = localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";
    const aId2 = (() => { try { return JSON.parse(localStorage.getItem("super_admin_user") || localStorage.getItem("user") || "{}")?.id ?? "guest"; } catch { return "guest"; } })();
    const readSet2 = new Set((() => { try { return JSON.parse(localStorage.getItem(`notif_read_${aId2}`) || "[]"); } catch { return []; } })());
    fetch(`${API}/api/notifications?limit=100&_t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${t2}` },
    }).then(r => r.json()).then(d => {
      if (d.success) {
        const count = (d.notifications ?? []).filter((n: any) => !readSet2.has(n.id)).length;
        setUnread(count);
      }
    }).catch(() => {});

    // Server-аас шинэчлэгдсэн permissions татна
    fetch(`${API}/api/super-admins/me`, { headers: authH() })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.admin) {
          // localStorage шинэчлэнэ
          const key = localStorage.getItem("super_admin_user") ? "super_admin_user" : "user";
          localStorage.setItem(key, JSON.stringify(d.admin));
          if (d.admin.role === "super_admin") { router.replace("/dashboard/admin"); return; }
          setIsSubAdmin(!!d.admin.parent_id);
          setMe(d.admin);
          setMyPerms([...new Set([...parsePerms(d.admin.permissions), "dashboard.view"])]);
        }
      })
      .catch(() => {}); // network алдаа бол cached data ашиглана
  },[router]);

  // Хуудас focus авах үед permissions-г дахин татна (super admin өөрчилсөн байж болно)
  useEffect(() => {
    const onFocus = () => {
      if (!tok()) return;
      fetch(`${API}/api/super-admins/me`, { headers: authH() })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.admin) {
            const key = localStorage.getItem("super_admin_user") ? "super_admin_user" : "user";
            localStorage.setItem(key, JSON.stringify(d.admin));
            setIsSubAdmin(!!d.admin.parent_id);
            setMe(d.admin);
            setMyPerms([...new Set([...parsePerms(d.admin.permissions), "dashboard.view"])]);
          }
        })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const canNav = (id:NavId) => {
    if (!me) return false;
    if (id==="dashboard") return true;
    if (id==="sub-admins") return true;
    // Шинэ формат: individuals.view  /  Хуучин формат: individuals
    return myPerms.some(p=>p.startsWith(`${id}.`)) || myPerms.includes(id as string);
  };
  const can = (p:string) => myPerms.includes(p);

  const fetchPersons = useCallback(async()=>{
    setLoading(true);
    try {
      const p=new URLSearchParams({limit:"50",...(pStatus?{status:pStatus}:{})});
      const res=await fetch(`${API}/api/persons?${p}`,{headers:authH()});
      const d=await res.json();
      if (d.success) setPersons(d.persons??[]);
    } catch{} finally{ setLoading(false); }
  },[pStatus]);

  const fetchCompanies = useCallback(async()=>{
    try {
      const res=await fetch(`${API}/api/organizations?limit=50`,{headers:authH()});
      const d=await res.json();
      if (d.success) setCompanies(d.organizations??[]);
    } catch{}
  },[]);

  useEffect(()=>{
    if (!me) return;
    if (nav==="dashboard"||nav==="individuals") fetchPersons();
    if (nav==="dashboard"||nav==="companies")   fetchCompanies();
  },[nav,me]);
  useEffect(()=>{ if(nav==="individuals") fetchPersons(); },[pStatus]);

  if (!me) return null;

  const ini = (me.email?.[0]??"A").toUpperCase();
  const nm  = [me.first_name,me.last_name].filter(Boolean).join(" ")||me.email;

  // Зөвхөн permissions-д байгаа nav-уудыг харуулна
  const NAV_ITEMS = [
    { id:"dashboard"    as NavId, icon:BarChart3,   label:"Хянах самбар",              perm:"dashboard"     },
    { id:"notifications"as NavId, icon:Bell,        label:"Мэдэгдэл",                  perm:"notifications", badge:unread },
    { id:"companies"    as NavId, icon:Building2,   label:"Компаниуд",                 perm:"companies"     },
    { id:"individuals"  as NavId, icon:Users,       label:"Хувь хүн",                  perm:"individuals"   },
    { id:"categories"   as NavId, icon:ChevronDown, label:"Ангилалууд",                perm:"categories"    },
    { id:"directions"   as NavId, icon:Activity,    label:"Үйл ажиллагааны чиглэл",   perm:"directions"    },
    { id:"announcements"as NavId, icon:FileText,    label:"Зарлалууд",                 perm:"announcements" },
    { id:"sub-admins"   as NavId, icon:ShieldCheck, label:"Миний Админууд",            perm:"sub-admins"    },
  ].filter(n => {
    if (n.id === "dashboard") return true;
    // Дэд admin (parent_id байгаа) нь "Миний Админууд" tab харж болохгүй
    if (n.id === "sub-admins") return !isSubAdmin;
    return myPerms.some(p => p.startsWith(`${n.perm}.`));
  });

  const filteredPersons   = persons.filter(p=>{ const q=pSearch.toLowerCase(); return !q||`${p.last_name??""} ${p.first_name??""} ${p.email}`.toLowerCase().includes(q); });
  const pendingCount      = persons.filter(p=>p.status==="pending").length;
  const colors            = ["#3b82f6","#10b981","#a78bfa","#f59e0b","#fb923c"];

  const logout = ()=>{
    ["super_admin_token","super_admin_user","token","user"].forEach(k=>localStorage.removeItem(k));
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;font-family:'Plus Jakarta Sans',sans-serif;}
        body{margin:0;background:#080c18;}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px}
        .ni{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;margin:1px 8px;cursor:pointer;border:none;font-size:13px;font-weight:500;color:rgba(255,255,255,0.38);background:transparent;transition:all .18s;text-align:left;width:calc(100% - 16px);}
        .ni:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.72);}
        .ni.on{background:rgba(14,148,163,0.12);color:#0ea5e9;border-left:2px solid #0ea5e9;font-weight:600;}
        .tr{border-bottom:1px solid rgba(255,255,255,0.04);transition:background .15s;}
        .tr:hover{background:rgba(255,255,255,0.025);}
        .tr:last-child{border:none;}
        .gi{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:8px 14px 8px 36px;font-size:13px;color:rgba(255,255,255,0.72);outline:none;transition:all .2s;font-family:inherit;}
        .gi::placeholder{color:rgba(255,255,255,0.18);}
        .gi:focus{border-color:rgba(14,165,233,0.4);background:rgba(14,165,233,0.04);}
        .page-in{animation:pi .3s ease both;}
        @keyframes pi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .icon-btn{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:7px;padding:6px 7px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
        .icon-btn:hover{background:rgba(255,255,255,0.08);}
        .bdg{min-width:17px;height:17px;border-radius:99px;background:#ef4444;color:white;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;}
        select option{background:#1a2035;color:rgba(255,255,255,0.82);}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>

      {toast&&(
        <div style={{position:"fixed",bottom:24,right:24,zIndex:300,padding:"10px 16px",borderRadius:11,
          fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:8,
          boxShadow:"0 8px 24px rgba(0,0,0,0.3)",
          background:toast.ok?"rgba(16,185,129,0.95)":"rgba(239,68,68,0.95)",color:"white"}}>
          {toast.ok?<CheckCircle2 size={14}/>:<AlertCircle size={14}/>}{toast.msg}
        </div>
      )}

      <div style={{display:"flex",minHeight:"100vh",background:"#080c18"}}>
        {/* Sidebar */}
        <aside style={{position:"fixed",top:0,left:0,bottom:0,width:232,
          background:"#0b1022",borderRight:"1px solid rgba(255,255,255,0.05)",
          display:"flex",flexDirection:"column",zIndex:50}}>
          <div style={{padding:"20px 18px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <a href="/"><img src="/images/Bodi-Group-logo-PNG-ENG-blue.png" alt="Logo" style={{height:24,objectFit:"contain"}}/></a>
            <div style={{marginTop:14,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,
                background:"linear-gradient(135deg,#0f766e,#0d9488)",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"white",fontSize:13,fontWeight:800,flexShrink:0}}>{ini}</div>
              <div style={{overflow:"hidden"}}>
                <p style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.85)",margin:0,
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nm}</p>
                <p style={{fontSize:10,color:"rgba(20,184,166,0.7)",margin:"2px 0 0",fontWeight:600}}>Мини Админ</p>
              </div>
            </div>
          </div>
          <nav style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
            <p style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",
              color:"rgba(255,255,255,0.18)",padding:"10px 14px 4px"}}>Үндсэн</p>
            {NAV_ITEMS.map(item=>(
              <button key={item.id} className={`ni ${nav===item.id?"on":""}`}
                onClick={()=>{setNav(item.id);if(item.id==="notifications")setUnread(0);}}>
                <item.icon size={15} style={{flexShrink:0}}/>
                <span style={{flex:1}}>{item.label}</span>
                {(item.badge??0)>0&&<span className="bdg">{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div style={{padding:"10px 8px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
            <button className="ni" onClick={logout} style={{color:"rgba(239,68,68,0.55)"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="#ef4444";(e.currentTarget as HTMLElement).style.background="rgba(239,68,68,0.08)"}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="rgba(239,68,68,0.55)";(e.currentTarget as HTMLElement).style.background="transparent"}}>
              <LogOut size={15}/>Системээс гарах
            </button>
          </div>
        </aside>

        {/* Main */}
        <div style={{flex:1,marginLeft:232,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          {/* Topbar */}
          <div style={{position:"sticky",top:0,zIndex:30,height:54,
            background:"rgba(8,12,24,0.92)",backdropFilter:"blur(20px)",
            borderBottom:"1px solid rgba(255,255,255,0.05)",
            padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <p style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.85)",margin:0}}>
              {NAV_ITEMS.find(n=>n.id===nav)?.label}
            </p>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {pendingCount>0&&(
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:99,
                  background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:"#f59e0b"}}/>
                  <span style={{fontSize:11,fontWeight:600,color:"#f59e0b"}}>{pendingCount} хүлээгдэж буй</span>
                </div>
              )}
              <div style={{width:30,height:30,borderRadius:9,
                background:"linear-gradient(135deg,#0f766e,#0d9488)",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"white",fontSize:12,fontWeight:700}}>{ini}</div>
            </div>
          </div>

          <main style={{flex:1,padding:"22px 26px",overflowY:"auto"}}>

            {/* ── Dashboard ── */}
            {nav==="dashboard"&&(
              <div className="page-in" style={{display:"flex",flexDirection:"column",gap:18}}>
                <div>
                  <h1 style={{fontSize:20,fontWeight:700,color:"rgba(255,255,255,0.88)",margin:"0 0 4px"}}>
                    Сайн байна уу, {me.first_name||me.email} 👋
                  </h1>
                  <p style={{fontSize:12,color:"rgba(148,163,184,0.5)",margin:0}}>
                    {new Date().toLocaleDateString("mn-MN",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}
                  </p>
                </div>

                {/* Stat cards */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                  {[
                    {label:"Нийт хувь хүн",   value:persons.length,                                      icon:Users,        color:"#3b82f6"},
                    {label:"Хүлээгдэж буй",   value:persons.filter(p=>p.status==="pending").length,      icon:Clock,        color:"#f59e0b"},
                    {label:"Идэвхтэй",         value:persons.filter(p=>p.status==="active").length,       icon:CheckCircle2, color:"#10b981"},
                    {label:"Байгууллага",      value:companies.length,                                    icon:Building2,    color:"#a78bfa"},
                  ].map(({label,value,icon:Icon,color})=>(
                    <div key={label} style={{background:"#0d1526",border:"1px solid rgba(255,255,255,0.06)",
                      borderRadius:16,padding:18,position:"relative",overflow:"hidden",transition:"all .2s"}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${color}33`;(e.currentTarget as HTMLElement).style.transform="translateY(-2px)";}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.06)";(e.currentTarget as HTMLElement).style.transform="translateY(0)";}}>
                      <div style={{position:"absolute",top:-16,right:-16,width:64,height:64,borderRadius:"50%",background:color,opacity:0.08,filter:"blur(10px)"}}/>
                      <div style={{width:36,height:36,borderRadius:11,background:`${color}18`,
                        border:`1px solid ${color}22`,display:"flex",alignItems:"center",
                        justifyContent:"center",marginBottom:12}}>
                        <Icon size={17} style={{color}}/>
                      </div>
                      <p style={{fontSize:24,fontWeight:800,color:"rgba(255,255,255,0.9)",margin:"0 0 4px",lineHeight:1}}>{value}</p>
                      <p style={{fontSize:11,color:"rgba(148,163,184,0.5)",margin:0}}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Pending хүсэлтүүд */}
                {pendingCount>0&&(
                  <div style={{background:"#0d1526",border:"1px solid rgba(245,158,11,0.15)",borderRadius:16,overflow:"hidden"}}>
                    <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.04)",
                      display:"flex",justifyContent:"space-between",alignItems:"center",
                      background:"rgba(245,158,11,0.03)"}}>
                      <div>
                        <p style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.85)",margin:0}}>Хянах шаардлагатай</p>
                        <p style={{fontSize:11,color:"rgba(245,158,11,0.6)",margin:"2px 0 0"}}>Хүлээгдэж буй хүсэлтүүд</p>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:99,
                        background:"rgba(245,158,11,0.1)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.2)"}}>
                        {pendingCount} хүсэлт
                      </span>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr><Th h="Нэр"/><Th h="Регистр"/><Th h="И-мэйл"/><Th h="Огноо"/></tr></thead>
                      <tbody>
                        {persons.filter(p=>p.status==="pending").slice(0,5).map((p,i)=>{
                          const nm=[p.last_name,p.first_name].filter(Boolean).join(" ")||p.email;
                          const c=colors[i%colors.length];
                          return (
                            <tr key={p.id} className="tr">
                              <td style={{padding:"10px 16px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:9}}>
                                  <div style={{width:28,height:28,borderRadius:8,flexShrink:0,
                                    background:`${c}15`,border:`1px solid ${c}20`,
                                    display:"flex",alignItems:"center",justifyContent:"center",
                                    fontSize:11,fontWeight:700,color:c}}>
                                    {(p.first_name?.[0]??p.email[0]).toUpperCase()}
                                  </div>
                                  <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.82)"}}>{nm}</span>
                                </div>
                              </td>
                              <td style={{padding:"10px 16px",fontSize:11,fontFamily:"monospace",color:"rgba(148,163,184,0.45)"}}>{p.register_number||"—"}</td>
                              <td style={{padding:"10px 16px",fontSize:12,color:"rgba(148,163,184,0.5)"}}>{p.email}</td>
                              <td style={{padding:"10px 16px",fontSize:11,color:"rgba(148,163,184,0.4)"}}>{p.created_at?new Date(p.created_at).toLocaleDateString("mn-MN"):"—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab-ууд ── */}
            {nav==="notifications"&&canNav("notifications")&&(
              <NotificationsTab showToast={showToast} onUnreadChange={c=>setUnread(c)}/>
            )}

            {nav==="announcements"&&canNav("announcements")&&(
              <AnnouncementsTab showToast={showToast}/>
            )}

            {nav==="individuals"&&canNav("individuals")&&(
              <IndividualsTab
                data={{persons,setPersons,personsLoading:loading,personsError:"",fetchPersons,showToast,
                  canEdit:can("individuals.edit"),
                  canEditStatus:can("individuals.edit_status"),
                  canDelete:can("individuals.delete")}}
                search={pSearch} setSearch={setPSearch}
                status={pStatus} setStatus={setPStatus}
                onDetail={()=>{}}/>
            )}

            {nav==="companies"&&canNav("companies")&&(
              <CompaniesTab data={{companies,setCompanies,companiesLoading:false,fetchCompanies,showToast,
                canEdit:can("companies.edit"),
                canEditStatus:can("companies.edit_status"),
                canDelete:can("companies.delete")}}/>
            )}

            {nav==="categories"&&canNav("categories")&&(
              <CategoriesTab isSuperAdmin={false} showToast={showToast}/>
            )}

            {nav==="directions"&&canNav("directions")&&(
              <DirectionsTab isSuperAdmin={false} showToast={showToast}/>
            )}

            {nav==="sub-admins"&&!isSubAdmin&&(
              <SubAdminsTab myPerms={myPerms} showToast={showToast}/>
            )}

          </main>
        </div>
      </div>
    </>
  );
}