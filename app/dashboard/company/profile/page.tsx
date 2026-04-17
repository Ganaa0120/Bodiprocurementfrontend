"use client";
import { useEffect, useState } from "react";
import {
  Loader2, Building2, MapPin, Briefcase, FileText, CreditCard,
  X, Check, Save, Plus, ChevronDown, Bell,
} from "lucide-react";
import { API, BLANK, BLANK_OWNER, BLANK_FINAL, AIMAG } from "./_components/constants";
import { HeroCard, Alert } from "./_components/HeroCard";
import { FInput, FSelect, RadioGroup } from "./_components/FormFields";
import { Section, DocUpload } from "./_components/Section";
import { OwnersSection, ExecutiveDirectorsSection } from "./_components/OwnersSection";
import { validateMongolianForm, isMongolian, validateOwnersMongolian } from "@/utils/mongolianValidation";
import { UB_DUUREG, AIMAG_SUM } from "@/constants/addressData";

const BLANK_EXEC = { position:"Гүйцэтгэх захирал", last_name:"", first_name:"", phone:"", email:"" };
const BLANK_PERM = { type_id:null, type_label:"", number:"", expiry:"" };

type DirItem = { id:number; label:string; children:{ id:number; label:string }[] };
type SelDir  = { main_id:number; sub_ids:number[] };

function useW() {
  const [w, setW] = useState(0);
  useEffect(() => {
    setW(window.innerWidth);
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

function buildForm(u: any) {
  return {
    register_number:       u.register_number || "",
    state_registry_number: u.state_registry_number || "",
    company_name:          u.company_name || "",
    company_name_en:       u.company_name_en || "",
    company_type:          u.company_type || "ХХК",
    established_date:      u.established_date?.slice(0,10) || "",
    is_vat_payer:          u.is_vat_payer || false,
    is_iso_certified:      u.is_iso_certified || false,
    employee_count:        u.employee_count?.toString() || "",
    has_special_permission:u.has_special_permission || false,
    aimag_niislel:         u.aimag_niislel || "",
    sum_duureg:            u.sum_duureg || "",
    bag_horoo:             u.bag_horoo || "",
    address:               u.address || "",
    bank_name:             u.bank_name || "",
    bank_account_number:   u.bank_account_number || "",
    vat_number:            u.vat_number || "",
    swift_code:            u.swift_code || "",
    iban:                  u.iban || "",
    currency:              u.currency || "MNT",
    phone:                 u.phone || "",
    activity_description:  u.activity_description || "",
    supply_direction:      u.supply_direction || "",
    notification_preference: u.notification_preference || "selected_dirs",
  };
}

export default function CompanyProfilePage() {
  const w        = useW();
  const isMobile = w > 0 && w < 640;
  const isTablet = w > 0 && w < 1024;

  const [profile,             setProfile]             = useState<any>(null);
  const [dirs,                setDirs]                = useState<DirItem[]>([]);
  const [permTypes,           setPermTypes]           = useState<{ id:number; label:string }[]>([]);
  const [loading,             setLoading]             = useState(true);
  const [saving,              setSaving]              = useState(false);
  const [error,               setError]               = useState("");
  const [saved,               setSaved]               = useState(false);
  const [editing,             setEditing]             = useState(false);
  const [selDirs,             setSelDirs]             = useState<SelDir[]>([]);
  const [selDirSnap,          setSelDirSnap]          = useState<SelDir[]>([]);
  const [previews,            setPreviews]            = useState<Record<string,string>>({});
  const [files,               setFiles]               = useState<Record<string,File>>({});
  const [extraFiles,          setExtraFiles]          = useState<File[]>([]);
  const [extraSnap,           setExtraSnap]           = useState<File[]>([]);
  const [form,                setForm]                = useState<any>(BLANK);
  const [snapshot,            setSnapshot]            = useState<any>(BLANK);
  const [owners,              setOwners]              = useState<any[]>([{ ...BLANK_OWNER }]);
  const [ownerSnap,           setOwnerSnap]           = useState<any[]>([{ ...BLANK_OWNER }]);
  const [finalOwners,         setFinalOwners]         = useState<any[]>([{ ...BLANK_FINAL }]);
  const [finalOwnerSnap,      setFinalOwnerSnap]      = useState<any[]>([{ ...BLANK_FINAL }]);
  const [directors,           setDirectors]           = useState<any[]>([{ ...BLANK_EXEC }]);
  const [directorSnap,        setDirectorSnap]        = useState<any[]>([{ ...BLANK_EXEC }]);
  const [specPerms,           setSpecPerms]           = useState<any[]>([{ ...BLANK_PERM }]);
  const [specPermSnap,        setSpecPermSnap]        = useState<any[]>([{ ...BLANK_PERM }]);
  const [fieldErrors,         setFieldErrors]         = useState<Record<string,string>>({});
  const [ownerFieldErrors,    setOwnerFieldErrors]    = useState<Record<string,string>>({});
  const [directorFieldErrors, setDirectorFieldErrors] = useState<Record<string,string>>({});
  const [showSuccessModal,    setShowSuccessModal]    = useState(false);

  // ── AddDirectionRow ───────────────────────────────────────
  function AddDirectionRow({ dirs, selDirs, onAdd }:{
    dirs:DirItem[]; selDirs:SelDir[]; onAdd:(mainId:number)=>void;
  }) {
    const [open, setOpen] = useState(false);
    const available = dirs.filter(d => !selDirs.find(s => Number(s.main_id)===Number(d.id)));
    return (
      <div>
        <button type="button" onClick={()=>setOpen(p=>!p)}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:8,
            padding:"10px 14px", borderRadius:12, border:"1.5px dashed #c7d2fe",
            background:"#eef2ff", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}
          onMouseEnter={e=>((e.currentTarget as HTMLElement).style.background="#e0e7ff")}
          onMouseLeave={e=>((e.currentTarget as HTMLElement).style.background="#eef2ff")}>
          <div style={{ width:20, height:20, borderRadius:6, flexShrink:0, background:"#6366f1",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Plus size={11} color="white"/>
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:"#6366f1", flex:1, textAlign:"left" as const }}>
            Үйл ажиллагааны чиглэл нэмэх
          </span>
          <ChevronDown size={14} style={{ color:"#6366f1",
            transform:open?"rotate(180deg)":"rotate(0deg)", transition:"transform .2s" }}/>
        </button>
        {open && (
          <div style={{ marginTop:6, background:"white", borderRadius:12,
            border:"1.5px solid #e2e8f0", boxShadow:"0 8px 24px rgba(0,0,0,0.1)" }}>
            {available.map(d => (
              <button key={d.id} type="button" onClick={()=>{ onAdd(d.id); setOpen(false); }}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding:"10px 14px", border:"none", background:"transparent",
                  cursor:"pointer", fontFamily:"inherit", textAlign:"left" as const,
                  borderBottom:"1px solid #f1f5f9", transition:"background .1s" }}
                onMouseEnter={e=>((e.currentTarget as HTMLElement).style.background="#f8f9ff")}
                onMouseLeave={e=>((e.currentTarget as HTMLElement).style.background="transparent")}>
                <div style={{ width:28, height:28, borderRadius:8, flexShrink:0,
                  background:"#eef2ff", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:12, fontWeight:700, color:"#6366f1" }}>
                  {d.label[0]}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{d.label}</div>
                  {d.children?.length>0&&(
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>{d.children.length} дэд чиглэл</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── useEffect ─────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/activity-directions`).then(r=>r.json()).then(d=>{
      if(d.success) {
        setDirs((d.directions||[]).map((dir:any) => ({
          id:Number(dir.id), label:dir.label,
          children:(dir.children||[]).map((c:any)=>({ id:Number(c.id), label:c.label })),
        })));
      }
    }).catch(()=>{});

    fetch(`${API}/api/special-permission-types`).then(r=>r.json()).then(d=>{
      if(d.success) setPermTypes(d.types||[]);
    }).catch(()=>{});

    const token = localStorage.getItem("token");
    if(!token) return;

    fetch(`${API}/api/organizations/me`,{ headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{
        if(d.success&&(d.organization||d.user)){
          const u = d.organization||d.user;
          setProfile(u);
          const f = buildForm(u);
          setForm(f); setSnapshot(f);

          const rawDirs = u.activity_directions||[];
          const parsedDirs:SelDir[] = Array.isArray(rawDirs)&&rawDirs.length>0&&typeof rawDirs[0]==="object"
            ? rawDirs.map((d:any)=>({ main_id:Number(d.main_id), sub_ids:(d.sub_ids||[]).map(Number) }))
            : rawDirs.map((id:number)=>({ main_id:Number(id), sub_ids:[] }));
          setSelDirs(parsedDirs); setSelDirSnap(parsedDirs);

          setOwners(u.beneficial_owners?.length?u.beneficial_owners:[{...BLANK_OWNER}]);
          setOwnerSnap(u.beneficial_owners?.length?u.beneficial_owners:[{...BLANK_OWNER}]);
          setFinalOwners(u.final_beneficial_owners?.length?u.final_beneficial_owners:[{...BLANK_FINAL}]);
          setFinalOwnerSnap(u.final_beneficial_owners?.length?u.final_beneficial_owners:[{...BLANK_FINAL}]);
          setDirectors(u.executive_directors?.length?u.executive_directors:[{...BLANK_EXEC}]);
          setDirectorSnap(u.executive_directors?.length?u.executive_directors:[{...BLANK_EXEC}]);
          setSpecPerms(u.special_permissions?.length?u.special_permissions:[{...BLANK_PERM}]);
          setSpecPermSnap(u.special_permissions?.length?u.special_permissions:[{...BLANK_PERM}]);

          const p:Record<string,string>={};
          if(u.company_logo_url)           p.company_logo           = u.company_logo_url;
          if(u.doc_state_registry_url)     p.doc_state_registry     = u.doc_state_registry_url;
          if(u.doc_vat_certificate_url)    p.doc_vat_certificate    = u.doc_vat_certificate_url;
          if(u.doc_special_permission_url) p.doc_special_permission = u.doc_special_permission_url;
          if(u.doc_contract_url)           p.doc_contract           = u.doc_contract_url;
          if(u.doc_company_intro_url)      p.doc_company_intro      = u.doc_company_intro_url;
          setPreviews(p);
          setEditing(!u.aimag_niislel&&!u.address&&!u.bank_name);
        }
      }).catch(()=>{}).finally(()=>setLoading(false));

    const refreshStatus = () => {
      const t = localStorage.getItem("token"); if(!t) return;
      fetch(`${API}/api/organizations/me`,{ headers:{ Authorization:`Bearer ${t}` } })
        .then(r=>r.json()).then(d=>{
          if(d.success&&(d.organization||d.user)){
            const fresh = d.organization||d.user;
            setProfile((p:any)=>p?{...p,status:fresh.status,return_reason:fresh.return_reason}:p);
            const stored = JSON.parse(localStorage.getItem("user")||"{}");
            localStorage.setItem("user",JSON.stringify({...stored,status:fresh.status,return_reason:fresh.return_reason}));
          }
        }).catch(()=>{});
    };
    const interval = setInterval(refreshStatus, 12*60*60*1000);
    window.addEventListener("focus", refreshStatus);
    return () => { clearInterval(interval); window.removeEventListener("focus", refreshStatus); };
  }, []);

  const F = (k:string,v:any) => setForm((p:any)=>({...p,[k]:v}));
  const onFile = (field:string,file:File) => {
    setFiles(p=>({...p,[field]:file}));
    setPreviews(p=>({...p,[field]:URL.createObjectURL(file)}));
  };

  const toggleMain = (mainId:number) => {
    setSelDirs(p=>{
      const exists = p.find(d=>Number(d.main_id)===Number(mainId));
      if(exists) return p.filter(d=>Number(d.main_id)!==Number(mainId));
      const main = dirs.find(d=>Number(d.id)===Number(mainId));
      const allSubIds = (main?.children||[]).map(c=>Number(c.id));
      return [...p,{ main_id:Number(mainId), sub_ids:allSubIds }];
    });
  };

  const toggleSub = (mainId:number, subId:number) => {
    setSelDirs(p=>p.map(d=>d.main_id!==mainId?d:{
      ...d,
      sub_ids: d.sub_ids.some(id=>Number(id)===Number(subId))
        ? d.sub_ids.filter(id=>Number(id)!==Number(subId))
        : [...d.sub_ids, subId],
    }));
  };

  const startEdit = () => {
    setSnapshot({...form});
    setOwnerSnap(owners.map(o=>({...o})));
    setFinalOwnerSnap(finalOwners.map(o=>({...o})));
    setDirectorSnap(directors.map(o=>({...o})));
    setSpecPermSnap(specPerms.map(o=>({...o})));
    setSelDirSnap(selDirs.map(d=>({...d,sub_ids:[...d.sub_ids]})));
    setEditing(true); setError(""); setFieldErrors({}); setExtraSnap([...extraFiles]);
  };

  const cancelEdit = () => {
    setForm({...snapshot});
    setOwners(ownerSnap.map(o=>({...o})));
    setFinalOwners(finalOwnerSnap.map(o=>({...o})));
    setDirectors(directorSnap.map(o=>({...o})));
    setSpecPerms(specPermSnap.map(o=>({...o})));
    setSelDirs(selDirSnap.map(d=>({...d,sub_ids:[...d.sub_ids]})));
    setEditing(false); setError(""); setFieldErrors({}); setExtraFiles([...extraSnap]);
  };

  // ── handleSave ────────────────────────────────────────────
  const handleSave = async () => {
    // 1. Company name
    if (form.company_name!==snapshot.company_name && !isMongolian(form.company_name)) {
      setFieldErrors(p=>({...p,company_name:"Крилл үсгээр бичнэ үү"}));
      setError("Байгууллагын нэр монгол үсгээр бичнэ үү"); return;
    }
    if (form.register_number && form.register_number.length !== 7) {
  setFieldErrors(p=>({...p, register_number:"7 оронтой тоо оруулна уу"}));
  setError("Регистрийн дугаар 7 оронтой байх ёстой");
  return;
}
    // 2. Form validation
    const errs = validateMongolianForm(form, [
      "sum_duureg",
      ...(form.aimag_niislel!=="Улаанбаатар"?["bag_horoo" as const]:[]),
    ]);
    if(Object.keys(errs).length>0){ setFieldErrors(errs); setError(Object.values(errs)[0]); return; }

    // 3. Owners
    const ownerErrs = validateOwnersMongolian(owners);
    if(Object.keys(ownerErrs).length>0){ setOwnerFieldErrors(ownerErrs); return; }

    // 4. Directors — API CALL-ЫН ӨМНӨ
    const dirErrors:Record<string,string> = {};
    directors.forEach((d:any, idx:number) => {
      if(d.position  && !/^[\u0400-\u04FF\s\-]+$/.test(d.position))
        dirErrors[`${idx}_position`]  = "Крилл үсгээр бичнэ үү";
      if(d.last_name && !/^[\u0400-\u04FF\s\-]+$/.test(d.last_name))
        dirErrors[`${idx}_last_name`] = "Крилл үсгээр бичнэ үү";
      if(d.first_name && !/^[\u0400-\u04FF\s\-]+$/.test(d.first_name))
        dirErrors[`${idx}_first_name`]= "Крилл үсгээр бичнэ үү";
      if(d.phone && (!/^\d+$/.test(d.phone)||d.phone.length!==8))
        dirErrors[`${idx}_phone`]     = "8 оронтой тоо оруулна уу";
      if(d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
        dirErrors[`${idx}_email`]     = "И-мэйл хаяг буруу байна";
    });
    if(Object.keys(dirErrors).length>0){
      setDirectorFieldErrors(dirErrors);
      setError("Гүйцэтгэх захирлын мэдээлэл буруу байна — доорх алдааг засна уу");
      return;
    }

    // Clear all errors
    setOwnerFieldErrors({}); setFieldErrors({}); setDirectorFieldErrors({}); setError("");

    const wasNewUser = !profile?.company_name;
    setSaving(true);
    const token = localStorage.getItem("token");
    if(!token){ setSaving(false); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k,v])=>fd.append(k,String(v)));
    fd.append("activity_directions",   JSON.stringify(selDirs));
    fd.append("beneficial_owners",     JSON.stringify(owners));
    fd.append("final_beneficial_owners",JSON.stringify(finalOwners));
    fd.append("executive_directors",   JSON.stringify(directors));
    fd.append("special_permissions",   JSON.stringify(specPerms));
    Object.entries(files).forEach(([k,f])=>fd.append(k,f as File));

    try {
      const res = await fetch(`${API}/api/organizations/me`,{
        method:"PUT", headers:{ Authorization:`Bearer ${token}` }, body:fd,
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message||"Алдаа гарлаа");

      const updated = data.organization||data.user;
      setProfile((p:any)=>({...p,...updated}));
      const f = buildForm(updated);
      setForm(f); setSnapshot(f);

      const rawDirs = updated.activity_directions||[];
      const parsedDirs:SelDir[] = Array.isArray(rawDirs)&&rawDirs.length>0&&typeof rawDirs[0]==="object"
        ? rawDirs.map((d:any)=>({ main_id:Number(d.main_id), sub_ids:(d.sub_ids||[]).map(Number) }))
        : rawDirs.map((id:number)=>({ main_id:Number(id), sub_ids:[] }));
      setSelDirs(parsedDirs); setSelDirSnap(parsedDirs);

      setOwners(updated.beneficial_owners?.length?updated.beneficial_owners:[{...BLANK_OWNER}]);
      setOwnerSnap(updated.beneficial_owners?.length?updated.beneficial_owners:[{...BLANK_OWNER}]);
      setFinalOwners(updated.final_beneficial_owners?.length?updated.final_beneficial_owners:[{...BLANK_FINAL}]);
      setFinalOwnerSnap(updated.final_beneficial_owners?.length?updated.final_beneficial_owners:[{...BLANK_FINAL}]);
      setDirectors(updated.executive_directors?.length?updated.executive_directors:[{...BLANK_EXEC}]);
      setDirectorSnap(updated.executive_directors?.length?updated.executive_directors:[{...BLANK_EXEC}]);
      setSpecPerms(updated.special_permissions?.length?updated.special_permissions:[{...BLANK_PERM}]);
      setSpecPermSnap(updated.special_permissions?.length?updated.special_permissions:[{...BLANK_PERM}]);

      const p:Record<string,string>={...previews};
      if(updated.company_logo_url)           p.company_logo           = updated.company_logo_url;
      if(updated.doc_state_registry_url)     p.doc_state_registry     = updated.doc_state_registry_url;
      if(updated.doc_vat_certificate_url)    p.doc_vat_certificate    = updated.doc_vat_certificate_url;
      if(updated.doc_special_permission_url) p.doc_special_permission = updated.doc_special_permission_url;
      if(updated.doc_contract_url)           p.doc_contract           = updated.doc_contract_url;
      if(updated.doc_company_intro_url)      p.doc_company_intro      = updated.doc_company_intro_url;
      setPreviews(p);

      localStorage.setItem("user",JSON.stringify({
        ...JSON.parse(localStorage.getItem("user")||"{}"), ...updated,
      }));
      setSaved(true); setEditing(false); setFiles({});
      if(wasNewUser) setShowSuccessModal(true);
      setTimeout(()=>setSaved(false),3000);
    } catch(e:any){ setError(e.message); }
    finally{ setSaving(false); }
  };

  const isNewUser = !profile?.company_name;
  const pct = (() => {
    const fields = [
      form.company_name, form.register_number, form.company_type,
      form.established_date, form.aimag_niislel, form.sum_duureg, form.address,
      owners[0]?.last_name, owners[0]?.first_name, owners[0]?.phone,
      form.bank_name, form.bank_account_number,
    ];
    const extras = [selDirs.length>0, !!previews.doc_state_registry].filter(Boolean).length;
    return Math.min(100,Math.round(((fields.filter(Boolean).length+extras)/(fields.length+2))*100));
  })();

  if(loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:400 }}>
      <Loader2 size={22} style={{ color:"#6366f1", animation:"spin .8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Grid helpers
  const g2   = isMobile?"1fr":"1fr 1fr";
  const g3   = isMobile?"1fr":isTablet?"1fr 1fr":"1fr 1fr 1fr";
  const g4   = isMobile?"1fr 1fr":isTablet?"1fr 1fr":"1fr 1fr 1fr 1fr";
  const gDoc = isMobile?"1fr":isTablet?"1fr 1fr":"repeat(3,1fr)";
  const gAddr= isMobile?"1fr":"1fr 2fr";
  const gPerm= isMobile?"1fr":"2fr 1fr 1fr auto";

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column",
      gap:16, paddingBottom:32, paddingLeft:isMobile?8:0, paddingRight:isMobile?8:0 }}>
      <style>{`
        @keyframes spin   { to { transform:rotate(360deg) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Sticky save bar ── */}
      {editing && (
        <div style={{ position:"sticky", top:0, zIndex:50, animation:"fadeIn .2s ease",
          background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)",
          border:"1px solid #e2e8f0", borderRadius:isMobile?10:14,
          padding:isMobile?"10px 12px":"12px 18px",
          display:"flex", flexDirection:isMobile?"column":"row" as any,
          alignItems:isMobile?"stretch":"center",
          justifyContent:"space-between", gap:10,
          boxShadow:"0 4px 20px rgba(99,102,241,0.12)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#f59e0b", animation:"pulse 1.5s infinite" }}/>
            <span style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>
              {isNewUser?"Мэдээлэл бөглөх":"Засварлаж байна"}
            </span>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:isMobile?"flex-end":"flex-start" }}>
            {!isNewUser&&(
              <button onClick={cancelEdit} disabled={saving}
                style={{ display:"flex", alignItems:"center", gap:5,
                  padding:isMobile?"8px 12px":"8px 16px", borderRadius:9,
                  border:"1px solid #e2e8f0", background:"white", color:"#64748b",
                  fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
                <X size={13}/> Болих
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              style={{ display:"flex", alignItems:"center", gap:5,
                padding:isMobile?"8px 16px":"8px 20px", borderRadius:9, border:"none",
                background:"linear-gradient(135deg,#4f46e5,#6366f1)", color:"white",
                fontSize:13, fontWeight:600, cursor:saving?"not-allowed":"pointer",
                opacity:saving?0.7:1, fontFamily:"inherit",
                flex:isMobile?1:"none" as any, justifyContent:"center" }}>
              {saving
                ? <><Loader2 size={13} style={{ animation:"spin .8s linear infinite" }}/> Хадгалж байна...</>
                : <><Check size={13}/> Хадгалах</>}
            </button>
          </div>
        </div>
      )}

      <HeroCard profile={profile} previews={previews} editing={editing}
        onFile={onFile} startEdit={startEdit} pct={pct} isNewUser={isNewUser}/>

      {/* Буцаагдсан шалтгаан */}
      {profile?.status==="returned"&&(
        <div style={{ borderRadius:14, border:"1.5px solid #fecaca", overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", background:"#fef2f2", display:"flex",
            alignItems:"center", gap:10, borderBottom:profile?.return_reason?"1px solid #fecaca":"none" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#dc2626" }}>Бүртгэл буцаагдсан байна</div>
              <div style={{ fontSize:11, color:"#ef4444", marginTop:1 }}>Доорх шалтгааныг уншаад мэдээллээ засаад хадгална уу</div>
            </div>
          </div>
          {profile?.return_reason&&(
            <div style={{ padding:"14px 16px", background:"#fff5f5" }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em",
                textTransform:"uppercase" as const, color:"#dc2626", marginBottom:8 }}>Буцаасан шалтгаан</div>
              <div style={{ fontSize:13, color:"#7f1d1d", lineHeight:1.7, background:"white",
                borderRadius:10, padding:"10px 14px", border:"1px solid #fecaca",
                whiteSpace:"pre-wrap" as const }}>{profile.return_reason}</div>
              <div style={{ fontSize:11, color:"#b91c1c", marginTop:10, display:"flex", alignItems:"center", gap:5 }}>
                <span>→</span><span>Мэдээллээ засаад <strong>"Хадгалах"</strong> товчийг дарна уу</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error&&<Alert type="error" msg={error}/>}
      {saved&&<Alert type="success" msg="Амжилттай хадгаллаа"/>}

      {/* 1. Байгууллагын үндсэн мэдээлэл */}
      <Section icon={Building2} title="БАЙГУУЛЛАГЫН ҮНДСЭН МЭДЭЭЛЭЛ">
        <div style={{ display:"grid", gridTemplateColumns:g2, gap:14, marginBottom:14 }}>
          <FInput label="Байгууллагын нэр *" value={form.company_name} editing={editing}
            onChange={(v:string)=>{ F("company_name",v);
              setFieldErrors(p=>({...p,company_name:v&&!isMongolian(v)?"Крилл үсгээр бичнэ үү":""})); }}
            fieldError={fieldErrors.company_name}/>
          <FInput label="Байгууллагын нэр англи" value={form.company_name_en} editing={editing}
            onChange={(v:string)=>F("company_name_en",v)}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:g2, gap:14, marginBottom:14 }}>
          <FInput
  label="Регистрийн дугаар *"
  value={form.register_number}
  editing={editing}
  onChange={(v:string) => {
    const digits = v.replace(/\D/g,"").slice(0,7);
    F("register_number", digits);
    setFieldErrors(p=>({...p,
      register_number: digits && digits.length<7 ? "7 оронтой тоо оруулна уу" : ""
    }));
  }}
  fieldError={fieldErrors.register_number}
  mono
/>
          <FSelect label="Байгааллагын хэлбэр" value={form.company_type} editing={editing}
            onChange={(v:string)=>F("company_type",v)}
            options={["ХХК","ХХК/ГХО","ХК","Холбоо","Хоршоо","ТББ","Сан","Нөхөрлөл"]}/>
          <RadioGroup label="НӨАТ төлөгч" value={form.is_vat_payer} editing={editing}
            onChange={(v:any)=>F("is_vat_payer",v)}
            options={[{value:true,label:"Тийм"},{value:false,label:"Үгүй"}]}/>
          <FInput label="Үүсгэн байгуулагдсан огноо" value={form.established_date}
            editing={editing} onChange={(v:string)=>F("established_date",v)} type="date"/>
        </div>
      </Section>

      {/* 2. Гүйцэтгэх захирал */}
      <ExecutiveDirectorsSection
        directors={directors} setDirectors={setDirectors} editing={editing}
        fieldErrors={directorFieldErrors} setFieldErrors={setDirectorFieldErrors}/>

      {/* 3. Үйл ажиллагаа */}
      <Section icon={Briefcase} title="ҮЙЛ АЖИЛЛАГААНЫ МЭДЭЭЛЭЛ">
        {/* Чиглэл */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:"0.06em",
            textTransform:"uppercase" as const, display:"block", marginBottom:10 }}>
            Үйл ажиллагааны чиглэл
          </label>
          {editing ? (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {selDirs.map(sel=>{
                const main = dirs.find(d=>Number(d.id)===Number(sel.main_id));
                if(!main) return null;
                return (
                  <div key={sel.main_id} style={{ borderRadius:12, border:"1.5px solid #6366f1",
                    background:"#f8f9ff", overflow:"hidden" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                      borderBottom:main.children?.length>0?"1px solid #e8eaf0":"none" }}>
                      <div style={{ width:20, height:20, borderRadius:6, flexShrink:0,
                        background:"#6366f1", border:"2px solid #6366f1",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Check size={11} color="white" strokeWidth={3}/>
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:"#4f46e5", flex:1 }}>{main.label}</span>
                      <button type="button" onClick={()=>toggleMain(main.id)}
                        style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
                          borderRadius:7, padding:"3px 8px", cursor:"pointer", fontFamily:"inherit",
                          fontSize:11, color:"#ef4444", display:"flex", alignItems:"center", gap:3 }}>
                        <X size={10}/> Хасах
                      </button>
                    </div>
                    {main.children?.length>0&&(
                      <div style={{ padding:isMobile?"8px 10px 10px":"10px 14px 12px 44px",
                        background:"rgba(99,102,241,0.02)" }}>
                        <div style={{ fontSize:10, color:"#94a3b8", marginBottom:6, fontWeight:600,
                          letterSpacing:"0.06em", textTransform:"uppercase" as const }}>Дэд чиглэл сонгох</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {main.children.map((sub:any)=>{
                            const isSubSel = sel.sub_ids.some(id=>Number(id)===Number(sub.id));
                            return (
                              <button key={sub.id} type="button" onClick={()=>toggleSub(main.id,sub.id)}
                                style={{ padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:500,
                                  border:isSubSel?"1.5px solid #6366f1":"1.5px solid #e2e8f0",
                                  background:isSubSel?"#eef2ff":"white", color:isSubSel?"#4f46e5":"#64748b",
                                  cursor:"pointer", transition:"all .12s", fontFamily:"inherit",
                                  display:"flex", alignItems:"center", gap:4 }}>
                                {isSubSel&&<Check size={10} strokeWidth={3}/>}
                                {sub.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {dirs.filter(d=>!selDirs.find(s=>s.main_id===d.id)).length>0&&(
                <AddDirectionRow dirs={dirs} selDirs={selDirs} onAdd={mainId=>toggleMain(mainId)}/>
              )}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {selDirs.length===0
                ? <div style={{ fontSize:13, color:"#cbd5e1" }}>—</div>
                : selDirs.map(sel=>{
                    const main = dirs.find(d=>Number(d.id)===Number(sel.main_id));
                    if(!main) return null;
                    return (
                      <div key={sel.main_id} style={{ display:"flex", alignItems:"flex-start",
                        flexWrap:"wrap", gap:8 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:"#4f46e5",
                          background:"#eef2ff", border:"1px solid #c7d2fe",
                          padding:"3px 10px", borderRadius:99, whiteSpace:"nowrap" as const }}>
                          {main.label}
                        </span>
                        {sel.sub_ids.length>0&&(
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            {sel.sub_ids.map(sid=>{
                              const sub = main.children?.find((c:any)=>Number(c.id)===Number(sid));
                              return sub?(
                                <span key={sid} style={{ fontSize:11, color:"#64748b",
                                  background:"#f8fafc", border:"1px solid #e2e8f0",
                                  padding:"3px 8px", borderRadius:99 }}>{sub.label}</span>
                              ):null;
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
          )}
        </div>

        {/* Ажилчдын тоо + ISO */}
        <div style={{ display:"grid", gridTemplateColumns:g3, gap:14, marginBottom:14 }}>
          <FInput label="Ажилчдын тоо" value={form.employee_count} editing={editing}
            onChange={(v:string)=>F("employee_count",v)} placeholder="0"/>
          <RadioGroup label="ISO сертификаттай эсэх" value={form.is_iso_certified} editing={editing}
            onChange={(v:any)=>F("is_iso_certified",v)}
            options={[{value:true,label:"Тийм"},{value:false,label:"Үгүй"}]}/>
        </div>

        {/* Үйл ажиллагааны тайлбар */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:"0.06em",
            textTransform:"uppercase" as const, display:"block", marginBottom:8 }}>
            Үйл ажиллагааны тайлбар
          </label>
          {editing?(
            <textarea value={form.activity_description}
              onChange={e=>F("activity_description",e.target.value)} rows={3}
              placeholder="Байгууллагын үйл ажиллагаа, чиглэл, туршлагыг товч тайлбарлана уу..."
              style={{ width:"100%", padding:"10px 14px", borderRadius:10,
                border:"1.5px solid #e2e8f0", fontSize:13, color:"#1e293b",
                outline:"none", resize:"vertical" as const, fontFamily:"inherit",
                lineHeight:1.6, transition:"border-color .15s", boxSizing:"border-box" as const }}
              onFocus={e=>((e.target as HTMLElement).style.borderColor="#6366f1")}
              onBlur={e=>((e.target as HTMLElement).style.borderColor="#e2e8f0")}/>
          ):(
            <div style={{ fontSize:13, color:form.activity_description?"#1e293b":"#cbd5e1",
              padding:"10px 0", lineHeight:1.6, borderBottom:"1px solid #f1f5f9",
              wordBreak:"break-word", whiteSpace:"pre-wrap" }}>
              {form.activity_description||"—"}
            </div>
          )}
        </div>

        {/* Тусгай зөвшөөрөл */}
        <div style={{ marginBottom:form.has_special_permission?12:0 }}>
          <RadioGroup label="Тусгай зөвшөөрөлтэй эсэх" value={form.has_special_permission}
            editing={editing} onChange={(v:any)=>F("has_special_permission",v)}
            options={[{value:true,label:"Тийм"},{value:false,label:"Үгүй"}]}/>
        </div>

        {form.has_special_permission&&(
          <div style={{ display:"flex", flexDirection:"column", gap:10, padding:14,
            borderRadius:12, background:"#f8fafc", border:"1px solid #f1f5f9", marginTop:8 }}>
            <div style={{ overflowX:isMobile?"auto":"visible" as any }}>
              <div style={{ minWidth:isMobile?480:"auto" }}>
                <div style={{ display:"grid", gridTemplateColumns:gPerm, gap:10,
                  paddingBottom:6, borderBottom:"1px solid #e2e8f0" }}>
                  {["Тусгай зөвшөөрлийн төрөл","Дугаар","Хүчинтэй хугацаа",""].map((h,i)=>(
                    <div key={i} style={{ fontSize:10, fontWeight:700, color:"#94a3b8",
                      letterSpacing:"0.06em", textTransform:"uppercase" as const }}>{h}</div>
                  ))}
                </div>
                {specPerms.map((perm:any,idx:number)=>(
                  <div key={idx} style={{ display:"grid", gridTemplateColumns:gPerm, gap:10,
                    alignItems:"center", padding:"10px 12px", borderRadius:10,
                    background:"white", border:"1px solid #e2e8f0", marginTop:8 }}>
                    <FSelect label="" value={perm.type_label} editing={editing}
                      onChange={(v:string)=>{
                        const found = permTypes.find(t=>t.label===v);
                        setSpecPerms(p=>p.map((x,i)=>i===idx?{...x,type_label:v,type_id:found?.id||null}:x));
                      }}
                      options={permTypes.map(t=>t.label)} placeholder="Төрөл сонгох"/>
                    <FInput label="" value={perm.number} editing={editing}
                      onChange={(v:string)=>setSpecPerms(p=>p.map((x,i)=>i===idx?{...x,number:v}:x))}
                      placeholder="Дугаар"/>
                    <FInput label="" type="date" value={perm.expiry} editing={editing}
                      onChange={(v:string)=>setSpecPerms(p=>p.map((x,i)=>i===idx?{...x,expiry:v}:x))}/>
                    {editing&&specPerms.length>1?(
                      <button type="button" onClick={()=>setSpecPerms(p=>p.filter((_,i)=>i!==idx))}
                        style={{ padding:"7px 12px", borderRadius:8, border:"1px solid #fecaca",
                          background:"#fef2f2", color:"#ef4444", fontSize:12, cursor:"pointer",
                          fontFamily:"inherit", whiteSpace:"nowrap" as const }}>Устгах</button>
                    ):<div/>}
                  </div>
                ))}
              </div>
            </div>
            {editing&&(
              <button type="button" onClick={()=>setSpecPerms(p=>[...p,{...BLANK_PERM}])}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  padding:"10px", borderRadius:10, border:"1.5px dashed #c7d2fe",
                  background:"#eef2ff", color:"#6366f1", fontSize:13, fontWeight:600,
                  cursor:"pointer", fontFamily:"inherit" }}
                onMouseEnter={e=>((e.currentTarget as HTMLElement).style.background="#e0e7ff")}
                onMouseLeave={e=>((e.currentTarget as HTMLElement).style.background="#eef2ff")}>
                + Тусгай зөвшөөрлийн төрөл нэмэх
              </button>
            )}
          </div>
        )}
      </Section>

      {/* 4. Хаяг */}
      <Section icon={MapPin} title="ХАЯГИЙН МЭДЭЭЛЭЛ">
        <div style={{ display:"grid", gridTemplateColumns:g2, gap:14, marginBottom:14 }}>
          <FSelect label="Аймаг / Нийслэл" value={form.aimag_niislel} editing={editing}
            onChange={(v:string)=>{ F("aimag_niislel",v); F("sum_duureg",""); F("bag_horoo","");
              setFieldErrors(p=>({...p,sum_duureg:"",bag_horoo:""})); }}
            options={AIMAG} placeholder="Сонгох"/>
          {form.aimag_niislel==="Улаанбаатар"
            ? <FSelect label="Дүүрэг" value={form.sum_duureg} editing={editing}
                onChange={(v:string)=>{ F("sum_duureg",v); F("bag_horoo",""); }}
                options={Object.keys(UB_DUUREG)} placeholder="Дүүрэг сонгох"/>
            : <FSelect label="Сум" value={form.sum_duureg} editing={editing}
                onChange={(v:string)=>{ F("sum_duureg",v); F("bag_horoo",""); }}
                options={form.aimag_niislel&&AIMAG_SUM[form.aimag_niislel]?AIMAG_SUM[form.aimag_niislel]:[]}
                placeholder={form.aimag_niislel?"Сум сонгох":"Эхлээд аймаг сонгоно уу"}/>}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:gAddr, gap:14 }}>
          {form.aimag_niislel==="Улаанбаатар"&&form.sum_duureg&&UB_DUUREG[form.sum_duureg]
            ? <FSelect label="Хороо" value={form.bag_horoo} editing={editing}
                onChange={(v:string)=>F("bag_horoo",v)}
                options={UB_DUUREG[form.sum_duureg]} placeholder="Хороо сонгох"/>
            : <FInput label="Баг / Хороо" value={form.bag_horoo} editing={editing}
  onChange={(v:string)=>{ F("bag_horoo",v);
    setFieldErrors(p=>({...p,
      bag_horoo: v && !/^[\u0400-\u04FF\s\d\-\/\.]+$/.test(v)
        ? "Крилл үсэг, тоо оруулна уу" : ""
    }));
  }}
  fieldError={fieldErrors.bag_horoo}/>}
          <FInput label="Дэлгэрэнгүй хаяг" value={form.address} editing={editing}
            onChange={(v:string)=>F("address",v)}/>
        </div>
      </Section>

      {/* 5. Эзэмшигч */}
      <OwnersSection owners={owners} setOwners={setOwners} editing={editing}
        fieldErrors={ownerFieldErrors} setFieldErrors={setOwnerFieldErrors}/>

      {/* 6. Баримт бичиг */}
      <Section icon={FileText} title="КОМПАНИЙН БАРИМТ БИЧИГ">
        <div style={{ display:"grid", gridTemplateColumns:gDoc, gap:14, marginBottom:14 }}>
          <DocUpload label="Улсын бүртгэлийн гэрчилгээ" fieldKey="doc_state_registry"
            preview={previews.doc_state_registry} onFile={onFile} editing={editing}
            accept=".pdf,image/*" required/>
          <DocUpload label="НӨАТ-ын гэрчилгээ" fieldKey="doc_vat_certificate"
            preview={previews.doc_vat_certificate} onFile={onFile} editing={editing}
            accept=".pdf,image/*" required/>
          <DocUpload label="Тусгай зөвшөөрөл" fieldKey="doc_special_permission"
            preview={previews.doc_special_permission} onFile={onFile} editing={editing}
            accept=".pdf,image/*" required/>
        </div>
        <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:14 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:"0.06em",
            textTransform:"uppercase" as const, display:"block", marginBottom:10 }}>
            Нэмэлт баримт бичиг
          </label>
          {extraFiles.length>0&&(
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
              {extraFiles.map((f,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                  padding:"8px 12px", borderRadius:10, background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                  <FileText size={14} style={{ color:"#6366f1", flexShrink:0 }}/>
                  <span style={{ fontSize:12, color:"#1e293b", flex:1, overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{f.name}</span>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>{(f.size/1024).toFixed(0)} KB</span>
                  {editing&&(
                    <button type="button" onClick={()=>setExtraFiles(p=>p.filter((_,j)=>j!==i))}
                      style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
                        borderRadius:6, padding:"3px 8px", cursor:"pointer", fontSize:11, color:"#ef4444" }}>
                      Хасах
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {editing&&(
            <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:"12px", borderRadius:12, border:"1.5px dashed #c7d2fe",
              background:"#eef2ff", cursor:"pointer", transition:"all .15s" }}
              onMouseEnter={e=>((e.currentTarget as HTMLElement).style.background="#e0e7ff")}
              onMouseLeave={e=>((e.currentTarget as HTMLElement).style.background="#eef2ff")}>
              <Plus size={14} style={{ color:"#6366f1" }}/>
              <span style={{ fontSize:13, fontWeight:600, color:"#6366f1" }}>Файл нэмэх</span>
              <input type="file" multiple style={{ display:"none" }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                onChange={e=>{
                  const newFiles = Array.from(e.target.files||[]);
                  if(newFiles.some(f=>f.size>10*1024*1024)){ alert("10MB-аас хэтэрсэн файл байна"); return; }
                  setExtraFiles(p=>[...p,...newFiles]); e.target.value="";
                }}/>
            </label>
          )}
          {!editing&&extraFiles.length===0&&<div style={{ fontSize:13, color:"#cbd5e1" }}>—</div>}
        </div>
      </Section>

      {/* 7. Санхүүгийн мэдээлэл */}
      <Section icon={CreditCard} title="САНХҮҮГИЙН МЭДЭЭЛЭЛ">
        <div style={{ display:"grid", gridTemplateColumns:g2, gap:14, marginBottom:14 }}>
          <FInput label="Банкны нэр" value={form.bank_name} editing={editing}
            onChange={(v:string)=>F("bank_name",v)}/>
          <FInput label="Дансны дугаар" value={form.bank_account_number} editing={editing}
            onChange={(v:string)=>F("bank_account_number",v)} mono/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:g4, gap:14 }}>
          <FInput label="НӨАТ дугаар" value={form.vat_number} editing={editing}
            onChange={(v:string)=>F("vat_number",v)} mono/>
          <FInput label="SWIFT код" value={form.swift_code} editing={editing}
            onChange={(v:string)=>F("swift_code",v)} mono/>
          <FInput label="IBAN" value={form.iban} editing={editing}
            onChange={(v:string)=>F("iban",v)} mono/>
          <FSelect label="Валют" value={form.currency} editing={editing}
            onChange={(v:string)=>F("currency",v)}
            options={[{value:"MNT",label:"₮ Төгрөг"},{value:"USD",label:"$ Доллар"},{value:"EUR",label:"€ Евро"}]}/>
        </div>
      </Section>

      {/* 8. Мэдэгдлийн тохиргоо */}
      <Section icon={Bell} title="МЭДЭГДЛИЙН ТОХИРГОО">
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:"0.06em",
            textTransform:"uppercase" as const, display:"block", marginBottom:10 }}>
            Худалдан авалтын зарын мэдэгдэл хүлээн авах
          </label>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { value:"all", icon:"🔔", label:"Бүх үйл ажиллагааны чиглэлээр хүлээн авах",
                desc:"Системд нийтлэгдсэн бүх зарын мэдэгдлийг хүлээн авна" },
              { value:"selected_dirs", icon:"🎯", label:"Сонгосон үйл ажиллагааны чиглэлээр хүлээн авах",
                desc:"Үйл ажиллагааны чиглэлтээс сонгосон зарын мэдэгдлийг л хүлээн авна" },
            ].map(opt=>{
              const isOn = form.notification_preference===opt.value;
              return (
                <div key={opt.value} onClick={()=>editing&&F("notification_preference",opt.value)}
                  style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px",
                    borderRadius:12, cursor:editing?"pointer":"default",
                    border:isOn?"1.5px solid #6366f1":"1.5px solid #e2e8f0",
                    background:isOn?"#f8f9ff":"white", transition:"all .15s" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", flexShrink:0, marginTop:1,
                    border:isOn?"2px solid #6366f1":"2px solid #e2e8f0",
                    background:isOn?"#6366f1":"white",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {isOn&&<div style={{ width:6, height:6, borderRadius:"50%", background:"white" }}/>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                      <span style={{ fontSize:15 }}>{opt.icon}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:isOn?"#4f46e5":"#0f172a" }}>{opt.label}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.5 }}>{opt.desc}</div>
                    {opt.value==="selected_dirs"&&isOn&&(
                      <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:5 }}>
                        {selDirs.length===0
                          ? <span style={{ fontSize:11, color:"#f59e0b", fontWeight:500 }}>⚠️ Үйл ажиллагааны чиглэл сонгоогүй байна</span>
                          : selDirs.map(sel=>{
                              const main = dirs.find(d=>Number(d.id)===Number(sel.main_id));
                              return main?(
                                <span key={sel.main_id} style={{ fontSize:11, fontWeight:600,
                                  color:"#4f46e5", background:"#eef2ff",
                                  border:"1px solid #c7d2fe", padding:"2px 8px", borderRadius:99 }}>
                                  {main.label}
                                </span>
                              ):null;
                            })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ padding:"12px 16px", borderRadius:12, background:"#f8fafc",
          border:"1px solid #f1f5f9", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>📧</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>И-мэйл мэдэгдэл</div>
              <div style={{ fontSize:11, color:"#94a3b8" }}>{profile?.email||"И-мэйл хаяг байхгүй"}</div>
            </div>
          </div>
          <div style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99,
            background:"#dcfce7", color:"#166534" }}>Идэвхтэй</div>
        </div>
      </Section>

      {/* ── Bottom save bar ── */}
      {editing&&(
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10,
          padding:isMobile?"12px":"16px 20px", background:"white", borderRadius:14,
          border:"1px solid #e2e8f0", boxShadow:"0 -4px 20px rgba(99,102,241,0.08)",
          flexDirection:isMobile?"column":"row" as any }}>
          {!isNewUser&&(
            <button onClick={cancelEdit} disabled={saving}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                padding:"10px 20px", borderRadius:10, border:"1px solid #e2e8f0",
                background:"white", color:"#64748b", fontSize:13, fontWeight:500,
                cursor:"pointer", fontFamily:"inherit" }}>
              <X size={14}/> Болих
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              padding:"10px 28px", borderRadius:10, border:"none",
              background:"linear-gradient(135deg,#4f46e5,#6366f1)", color:"white",
              fontSize:13, fontWeight:600, cursor:saving?"not-allowed":"pointer",
              opacity:saving?0.7:1, fontFamily:"inherit",
              boxShadow:"0 4px 14px rgba(99,102,241,0.35)",
              flex:isMobile?1:"none" as any }}>
            {saving
              ? <><Loader2 size={14} style={{ animation:"spin .8s linear infinite" }}/> Хадгалж байна...</>
              : <><Save size={14}/> Хадгалах</>}
          </button>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal&&(
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.45)",
          backdropFilter:"blur(8px)", display:"flex",
          alignItems:isMobile?"flex-end":"center", justifyContent:"center",
          padding:isMobile?0:16 }}>
          <div style={{ width:"100%", maxWidth:isMobile?"100%":420, background:"white",
            borderRadius:isMobile?"20px 20px 0 0":24,
            padding:isMobile?"28px 20px 40px":36,
            textAlign:"center", boxShadow:"0 24px 64px rgba(0,0,0,0.15)",
            animation:"fadeIn .3s ease" }}>
            <div style={{ width:72, height:72, borderRadius:"50%",
              background:"linear-gradient(135deg,#d1fae5,#a7f3d0)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 20px", fontSize:32 }}>✅</div>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#0f172a", margin:"0 0 10px" }}>
              Бүртгэл амжилттай!
            </h2>
            <p style={{ fontSize:14, color:"#64748b", lineHeight:1.7, margin:"0 0 24px" }}>
              Таны бүртгэл амжилттай дууслаа.<br/>
              Администратор таны бүртгэлийг хянах болно.<br/>
              Удахгүй буцаад хариу өгнө.
            </p>
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:24 }}>
              {["Бүртгэл","Хянагдаж байна","Баталгаажна"].map((step,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%",
                      background:i===0?"#10b981":i===1?"#f59e0b":"#e2e8f0",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, color:"white", fontWeight:700 }}>
                      {i===0?"✓":i+1}
                    </div>
                    <span style={{ fontSize:10, color:i===0?"#10b981":i===1?"#f59e0b":"#94a3b8", fontWeight:500 }}>
                      {step}
                    </span>
                  </div>
                  {i<2&&<div style={{ width:24, height:2, borderRadius:99, marginBottom:16,
                    background:i===0?"#10b981":"#e2e8f0" }}/>}
                </div>
              ))}
            </div>
            <button onClick={()=>setShowSuccessModal(false)}
              style={{ width:"100%", height:46, borderRadius:12, border:"none",
                background:"linear-gradient(135deg,#4f46e5,#6366f1)", color:"white",
                fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
              Ойлголоо
            </button>
          </div>
        </div>
      )}
    </div>
  );
}