"use client";
import { useEffect, useState } from "react";
import {
  Loader2, Building2, MapPin, Briefcase, FileText, CreditCard, X, Check, Save,
  Plus,
  ChevronDown,
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

function buildForm(u: any) {
  return {
    register_number:           u.register_number           || "",
    state_registry_number:     u.state_registry_number     || "",
    company_name:              u.company_name              || "",
    company_name_en:           u.company_name_en           || "",
    company_type:              u.company_type              || "ХХК",
    established_date:          u.established_date?.slice(0,10) || "",
    is_vat_payer:              u.is_vat_payer              || false,
    is_iso_certified:          u.is_iso_certified          || false,
    employee_count:            u.employee_count?.toString() || "",
    has_special_permission:    u.has_special_permission    || false,
    aimag_niislel:             u.aimag_niislel             || "",
    sum_duureg:                u.sum_duureg                || "",
    bag_horoo:                 u.bag_horoo                 || "",
    address:                   u.address                   || "",
    bank_name:                 u.bank_name                 || "",
    bank_account_number:       u.bank_account_number       || "",
    vat_number:                u.vat_number                || "",
    swift_code:                u.swift_code                || "",
    iban:                      u.iban                      || "",
    currency:                  u.currency                  || "MNT",
    phone:                     u.phone                     || "",
    activity_description:      u.activity_description      || "",
    supply_direction:          u.supply_direction          || "",
  };
}

export default function CompanyProfilePage() {
  const [profile,          setProfile]          = useState<any>(null);
  const [dirs,             setDirs]             = useState<DirItem[]>([]);
  const [permTypes,        setPermTypes]        = useState<{id:number;label:string}[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [saving,           setSaving]           = useState(false);
  const [error,            setError]            = useState("");
  const [saved,            setSaved]            = useState(false);
  const [editing,          setEditing]          = useState(false);
  const [selDirs,          setSelDirs]          = useState<SelDir[]>([]);
  const [selDirSnap,       setSelDirSnap]       = useState<SelDir[]>([]);
  const [previews,         setPreviews]         = useState<Record<string,string>>({});
  const [files,            setFiles]            = useState<Record<string,File>>({});
  const [form,             setForm]             = useState<any>(BLANK);
  const [snapshot,         setSnapshot]         = useState<any>(BLANK);
  const [owners,           setOwners]           = useState<any[]>([{...BLANK_OWNER}]);
  const [ownerSnap,        setOwnerSnap]        = useState<any[]>([{...BLANK_OWNER}]);
  const [finalOwners,      setFinalOwners]      = useState<any[]>([{...BLANK_FINAL}]);
  const [finalOwnerSnap,   setFinalOwnerSnap]   = useState<any[]>([{...BLANK_FINAL}]);
  const [directors,        setDirectors]        = useState<any[]>([{...BLANK_EXEC}]);
  const [directorSnap,     setDirectorSnap]     = useState<any[]>([{...BLANK_EXEC}]);
  const [specPerms,        setSpecPerms]        = useState<any[]>([{...BLANK_PERM}]);
  const [specPermSnap,     setSpecPermSnap]     = useState<any[]>([{...BLANK_PERM}]);
  const [fieldErrors,      setFieldErrors]      = useState<Record<string,string>>({});
  const [ownerFieldErrors, setOwnerFieldErrors] = useState<Record<string,string>>({});

  function AddDirectionRow({ dirs, selDirs, onAdd }: {
  dirs: DirItem[];
  selDirs: SelDir[];
  onAdd: (mainId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const available = dirs.filter(d => !selDirs.find(s => s.main_id === d.id));

  return (
    <div style={{ position:"relative" }}>
      <button type="button" onClick={() => setOpen(p => !p)}
        style={{ width:"100%", display:"flex", alignItems:"center", gap:8,
          padding:"10px 14px", borderRadius:12,
          border:"1.5px dashed #c7d2fe", background:"#eef2ff",
          cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#e0e7ff"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="#eef2ff"}>
        <div style={{ width:20, height:20, borderRadius:6, flexShrink:0,
          background:"#6366f1", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Plus size={11} color="white"/>
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:"#6366f1", flex:1, textAlign:"left" as const }}>
          Үйл ажиллагааны чиглэл нэмэх
        </span>
        <ChevronDown size={14} style={{ color:"#6366f1",
          transform: open ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .2s" }}/>
      </button>

      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:20,
          background:"white", borderRadius:12, border:"1.5px solid #e2e8f0",
          boxShadow:"0 8px 24px rgba(0,0,0,0.1)", overflow:"hidden" }}>
          {available.map(d => (
            <button key={d.id} type="button"
              onClick={() => { onAdd(d.id); setOpen(false); }}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"10px 14px", border:"none", background:"transparent",
                cursor:"pointer", fontFamily:"inherit", textAlign:"left" as const,
                borderBottom:"1px solid #f1f5f9", transition:"background .1s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#f8f9ff"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}>
              <div style={{ width:28, height:28, borderRadius:8, flexShrink:0,
                background:"#eef2ff", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:12, fontWeight:700, color:"#6366f1" }}>
                {d.label[0]}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{d.label}</div>
                {d.children?.length > 0 && (
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>
                    {d.children.length} дэд чиглэл
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
  .then(r => r.json())
  .then(d => {
    if (d.success) {
      // API hierarchy буцаана — mains + children
      setDirs(d.directions || []);
    }
  }).catch(() => {});

    fetch(`${API}/api/special-permission-types`)
      .then(r => r.json()).then(d => { if (d.success) setPermTypes(d.types || []); }).catch(() => {});

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/api/organizations/me`, { headers: { Authorization:`Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success && (d.organization || d.user)) {
          const u = d.organization || d.user;
          setProfile(u);
          const f = buildForm(u);
          setForm(f); setSnapshot(f);

          // ✅ SelDirs — шинэ format эсвэл хуучин number[] format дэмжих
          const rawDirs = u.activity_directions || [];
          const parsedDirs: SelDir[] = Array.isArray(rawDirs) && rawDirs.length > 0 && typeof rawDirs[0] === "object"
            ? rawDirs
            : rawDirs.map((id: number) => ({ main_id: id, sub_ids: [] }));
          setSelDirs(parsedDirs); setSelDirSnap(parsedDirs);

          const lo = u.beneficial_owners?.length       ? u.beneficial_owners       : [{...BLANK_OWNER}];
          const lf = u.final_beneficial_owners?.length ? u.final_beneficial_owners : [{...BLANK_FINAL}];
          const ld = u.executive_directors?.length     ? u.executive_directors     : [{...BLANK_EXEC}];
          const lp = u.special_permissions?.length     ? u.special_permissions     : [{...BLANK_PERM}];
          setOwners(lo);      setOwnerSnap(lo);
          setFinalOwners(lf); setFinalOwnerSnap(lf);
          setDirectors(ld);   setDirectorSnap(ld);
          setSpecPerms(lp);   setSpecPermSnap(lp);

          const p: Record<string,string> = {};
          if (u.company_logo_url)           p.company_logo          = u.company_logo_url;
          if (u.doc_state_registry_url)     p.doc_state_registry    = u.doc_state_registry_url;
          if (u.doc_vat_certificate_url)    p.doc_vat_certificate   = u.doc_vat_certificate_url;
          if (u.doc_special_permission_url) p.doc_special_permission= u.doc_special_permission_url;
          if (u.doc_contract_url)           p.doc_contract          = u.doc_contract_url;
          if (u.doc_company_intro_url)      p.doc_company_intro     = u.doc_company_intro_url;
          setPreviews(p);

          const isNewUser = !u.aimag_niislel && !u.address && !u.bank_name;
          setEditing(isNewUser);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const refreshStatus = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      fetch(`${API}/api/organizations/me`, { headers: { Authorization:`Bearer ${t}` } })
        .then(r => r.json())
        .then(d => {
          if (d.success && (d.organization || d.user)) {
            const fresh = d.organization || d.user;
            setProfile((p: any) => p ? {...p, status:fresh.status, return_reason:fresh.return_reason} : p);
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({...stored, status:fresh.status, return_reason:fresh.return_reason}));
          }
        }).catch(() => {});
    };
    const interval = setInterval(refreshStatus, 12*60*60*1000);
    window.addEventListener("focus", refreshStatus);
    return () => { clearInterval(interval); window.removeEventListener("focus", refreshStatus); };
  }, []);

  const F = (k: string, v: any) => setForm((p: any) => ({...p,[k]:v}));
  const onFile = (field: string, file: File) => {
    setFiles(p => ({...p,[field]:file}));
    setPreviews(p => ({...p,[field]:URL.createObjectURL(file)}));
  };

  const toggleMain = (mainId: number) => {
    setSelDirs(p => {
      const exists = p.find(d => d.main_id === mainId);
      return exists ? p.filter(d => d.main_id !== mainId) : [...p, { main_id: mainId, sub_ids: [] }];
    });
  };

  const toggleSub = (mainId: number, subId: number) => {
    setSelDirs(p => p.map(d => d.main_id !== mainId ? d : {
      ...d,
      sub_ids: d.sub_ids.includes(subId)
        ? d.sub_ids.filter(id => id !== subId)
        : [...d.sub_ids, subId],
    }));
  };

  const startEdit = () => {
    setSnapshot({...form});
    setOwnerSnap(owners.map(o => ({...o})));
    setFinalOwnerSnap(finalOwners.map(o => ({...o})));
    setDirectorSnap(directors.map(o => ({...o})));
    setSpecPermSnap(specPerms.map(o => ({...o})));
    setSelDirSnap(selDirs.map(d => ({...d, sub_ids:[...d.sub_ids]})));
    setEditing(true); setError(""); setFieldErrors({});
  };

  const cancelEdit = () => {
    setForm({...snapshot});
    setOwners(ownerSnap.map(o => ({...o})));
    setFinalOwners(finalOwnerSnap.map(o => ({...o})));
    setDirectors(directorSnap.map(o => ({...o})));
    setSpecPerms(specPermSnap.map(o => ({...o})));
    setSelDirs(selDirSnap.map(d => ({...d, sub_ids:[...d.sub_ids]})));
    setEditing(false); setError(""); setFieldErrors({});
  };

  const handleSave = async () => {
    if (form.company_name !== snapshot.company_name && !isMongolian(form.company_name)) {
      setFieldErrors(p => ({...p, company_name:"Монгол үсгээр бичнэ үү"}));
      setError("Байгууллагын нэр монгол үсгээр бичнэ үү"); return;
    }
    const errs = validateMongolianForm(form, [
      "sum_duureg",
      ...(form.aimag_niislel !== "Улаанбаатар" ? ["bag_horoo" as const] : []),
    ]);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); setError(Object.values(errs)[0]); return; }
    const ownerErrs = validateOwnersMongolian(owners);
    if (Object.keys(ownerErrs).length > 0) { setOwnerFieldErrors(ownerErrs); return; }
    setOwnerFieldErrors({}); setFieldErrors({});

    setSaving(true); setError("");
    const token = localStorage.getItem("token");
    if (!token) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k, String(v)));
    fd.append("activity_directions",     JSON.stringify(selDirs));
    fd.append("beneficial_owners",       JSON.stringify(owners));
    fd.append("final_beneficial_owners", JSON.stringify(finalOwners));
    fd.append("executive_directors",     JSON.stringify(directors));
    fd.append("special_permissions",     JSON.stringify(specPerms));
    Object.entries(files).forEach(([k,f]) => fd.append(k, f as File));
    try {
      const res  = await fetch(`${API}/api/organizations/me`, {
        method:"PUT", headers:{ Authorization:`Bearer ${token}` }, body:fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");
      const updated = data.organization || data.user;
      setProfile((p: any) => ({...p, ...updated}));
      const f = buildForm(updated);
      setForm(f); setSnapshot(f);

      const rawDirs = updated.activity_directions || [];
      const parsedDirs: SelDir[] = Array.isArray(rawDirs) && rawDirs.length > 0 && typeof rawDirs[0] === "object"
        ? rawDirs : rawDirs.map((id: number) => ({ main_id: id, sub_ids: [] }));
      setSelDirs(parsedDirs); setSelDirSnap(parsedDirs);

      const lo = updated.beneficial_owners?.length       ? updated.beneficial_owners       : [{...BLANK_OWNER}];
      const lf = updated.final_beneficial_owners?.length ? updated.final_beneficial_owners : [{...BLANK_FINAL}];
      const ld = updated.executive_directors?.length     ? updated.executive_directors     : [{...BLANK_EXEC}];
      const lp = updated.special_permissions?.length     ? updated.special_permissions     : [{...BLANK_PERM}];
      setOwners(lo);      setOwnerSnap(lo);
      setFinalOwners(lf); setFinalOwnerSnap(lf);
      setDirectors(ld);   setDirectorSnap(ld);
      setSpecPerms(lp);   setSpecPermSnap(lp);

      const p: Record<string,string> = {...previews};
      if (updated.company_logo_url)           p.company_logo          = updated.company_logo_url;
      if (updated.doc_state_registry_url)     p.doc_state_registry    = updated.doc_state_registry_url;
      if (updated.doc_vat_certificate_url)    p.doc_vat_certificate   = updated.doc_vat_certificate_url;
      if (updated.doc_special_permission_url) p.doc_special_permission= updated.doc_special_permission_url;
      if (updated.doc_contract_url)           p.doc_contract          = updated.doc_contract_url;
      if (updated.doc_company_intro_url)      p.doc_company_intro     = updated.doc_company_intro_url;
      setPreviews(p);
      localStorage.setItem("user", JSON.stringify({...JSON.parse(localStorage.getItem("user") || "{}"), ...updated}));
      setSaved(true); setEditing(false); setFiles({});
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const isNewUser = !profile?.company_name;
  const pct = (() => {
    const fields = [
      form.company_name, form.register_number, form.company_type,
      form.established_date, form.aimag_niislel, form.sum_duureg, form.address,
      owners[0]?.last_name, owners[0]?.first_name, owners[0]?.phone,
      form.bank_name, form.bank_account_number,
    ];
    const extras = [selDirs.length > 0, !!previews.doc_state_registry, !!previews.doc_company_intro].filter(Boolean).length;
    return Math.round(((fields.filter(Boolean).length + extras) / (fields.length + 3)) * 100);
  })();

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:400 }}>
      <Loader2 size={22} style={{ color:"#6366f1", animation:"spin .8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", gap:16, paddingBottom:32 }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Sticky save bar ── */}
      {editing && (
        <div style={{ position:"sticky", top:0, zIndex:50, animation:"fadeIn .2s ease",
          background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)",
          border:"1px solid #e2e8f0", borderRadius:14, padding:"12px 18px",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
          boxShadow:"0 4px 20px rgba(99,102,241,0.12)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#f59e0b", animation:"pulse 1.5s infinite" }}/>
            <div>
              <span style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>
                {isNewUser ? "Мэдээлэл бөглөх" : "Засварлаж байна"}
              </span>
              {isNewUser && (
                <span style={{ fontSize:11, color:"#94a3b8", marginLeft:8 }}>
                  · Доорх талбаруудыг бөглөөд хадгална уу
                </span>
              )}
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {!isNewUser && (
              <button onClick={cancelEdit} disabled={saving}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 16px",
                  borderRadius:9, border:"1px solid #e2e8f0", background:"white",
                  color:"#64748b", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
                <X size={13}/> Болих
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 20px",
                borderRadius:9, border:"none", background:"linear-gradient(135deg,#4f46e5,#6366f1)",
                color:"white", fontSize:13, fontWeight:600, cursor:"pointer",
                opacity:saving?0.7:1, fontFamily:"inherit" }}>
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
      {profile?.status === "returned" && (
        <div style={{ borderRadius:14, border:"1.5px solid #fecaca", overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", background:"#fef2f2", display:"flex", alignItems:"center", gap:10,
            borderBottom: profile?.return_reason ? "1px solid #fecaca" : "none" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#dc2626" }}>Бүртгэл буцаагдсан байна</div>
              <div style={{ fontSize:11, color:"#ef4444", marginTop:1 }}>Доорх шалтгааныг уншаад мэдээллээ засаад хадгална уу</div>
            </div>
          </div>
          {profile?.return_reason && (
            <div style={{ padding:"14px 16px", background:"#fff5f5" }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em",
                textTransform:"uppercase" as const, color:"#dc2626", marginBottom:8 }}>Буцаасан шалтгаан</div>
              <div style={{ fontSize:13, color:"#7f1d1d", lineHeight:1.7, background:"white",
                borderRadius:10, padding:"10px 14px", border:"1px solid #fecaca", whiteSpace:"pre-wrap" as const }}>
                {profile.return_reason}
              </div>
              <div style={{ fontSize:11, color:"#b91c1c", marginTop:10, display:"flex", alignItems:"center", gap:5 }}>
                <span>→</span><span>Мэдээллээ засаад <strong>"Хадгалах"</strong> товчийг дарна уу</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <Alert type="error"   msg={error}/>}
      {saved && <Alert type="success" msg="Амжилттай хадгаллаа"/>}

      {/* 1. Байгааллагын үндсэн мэдээлэл */}
      <Section icon={Building2} title="БАЙГУУЛЛАГЫН ҮНДСЭН МЭДЭЭЛЭЛ">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <FInput label="Байгууллагын нэр *" value={form.company_name} editing={editing}
            onChange={(v:string) => { F("company_name",v);
              setFieldErrors(p => ({...p, company_name: v && !isMongolian(v) ? "Монгол үсгээр бичнэ үү" : ""})); }}
            fieldError={fieldErrors.company_name}/>
          <FInput label="Байгууллагын нэр англи" value={form.company_name_en} editing={editing}
            onChange={(v:string) => F("company_name_en",v)}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <FInput label="Регистрийн дугаар *" value={form.register_number} editing={editing}
            onChange={(v:string) => F("register_number",v)} mono/>
          <FSelect label="Байгааллагын хэлбэр" value={form.company_type} editing={editing}
            onChange={(v:string) => F("company_type",v)}
            options={["ХХК","ХХК/ГХО","ХК","Холбоо","Хоршоо","ТББ","Сан","Нөхөрлөл"]}/>
          <RadioGroup label="НӨАТ төлөгч" value={form.is_vat_payer} editing={editing}
            onChange={(v:any) => F("is_vat_payer",v)}
            options={[{value:true,label:"Тийм"},{value:false,label:"Үгүй"}]}/>
          <FInput label="Үүсгэн байгуулагдсан огноо" value={form.established_date} editing={editing}
            onChange={(v:string) => F("established_date",v)} type="date"/>
        </div>
      </Section>

      {/* 2. Гүйцэтгэх захирал */}
      <ExecutiveDirectorsSection directors={directors} setDirectors={setDirectors} editing={editing}/>

      {/* 3. Үйл ажиллагаа */}
      <Section icon={Briefcase} title="ҮЙЛ АЖИЛЛАГААНЫ МЭДЭЭЛЭЛ">

        {/* Үйл ажиллагааны чиглэл */}
        {/* Үйл ажиллагааны чиглэл — шинэ design */}
<div style={{ marginBottom:16 }}>
  <label style={{ fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:"0.06em",
    textTransform:"uppercase" as const, display:"block", marginBottom:10 }}>
    Үйл ажиллагааны чиглэл
  </label>

  {editing ? (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

      {/* Сонгогдсон чиглэлүүд */}
      {selDirs.map((sel, idx) => {
        const main = dirs.find(d => d.id === sel.main_id);
        if (!main) return null;
        return (
          <div key={sel.main_id} style={{ borderRadius:12,
            border:"1.5px solid #6366f1", background:"#f8f9ff", overflow:"hidden" }}>

            {/* Main row */}
            <div style={{ display:"flex", alignItems:"center", gap:10,
              padding:"10px 14px", borderBottom: main.children?.length > 0 ? "1px solid #e8eaf0" : "none" }}>
              <div style={{ width:20, height:20, borderRadius:6, flexShrink:0,
                background:"#6366f1", border:"2px solid #6366f1",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Check size={11} color="white" strokeWidth={3}/>
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:"#4f46e5", flex:1 }}>
                {main.label}
              </span>
              {/* Устгах */}
              <button type="button" onClick={() => toggleMain(main.id)}
                style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
                  borderRadius:7, padding:"3px 8px", cursor:"pointer", fontFamily:"inherit",
                  fontSize:11, color:"#ef4444", display:"flex", alignItems:"center", gap:3 }}>
                <X size={10}/> Хасах
              </button>
            </div>

            {/* Sub чиглэлүүд */}
            {main.children?.length > 0 && (
              <div style={{ padding:"10px 14px 12px 44px", background:"rgba(99,102,241,0.02)" }}>
                <div style={{ fontSize:10, color:"#94a3b8", marginBottom:6,
                  fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" as const }}>
                  Дэд чиглэл сонгох
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {main.children.map((sub:any) => {
                    const isSubSel = sel.sub_ids.includes(sub.id);
                    return (
                      <button key={sub.id} type="button"
                        onClick={() => toggleSub(main.id, sub.id)}
                        style={{ padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:500,
                          border: isSubSel?"1.5px solid #6366f1":"1.5px solid #e2e8f0",
                          background: isSubSel?"#eef2ff":"white",
                          color: isSubSel?"#4f46e5":"#64748b",
                          cursor:"pointer", transition:"all .12s", fontFamily:"inherit",
                          display:"flex", alignItems:"center", gap:4 }}>
                        {isSubSel && <Check size={10} strokeWidth={3}/>}
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

      {/* Шинэ чиглэл нэмэх dropdown */}
      {dirs.filter(d => !selDirs.find(s => s.main_id === d.id)).length > 0 && (
        <AddDirectionRow
          dirs={dirs}
          selDirs={selDirs}
          onAdd={(mainId) => toggleMain(mainId)}
        />
      )}
    </div>

  ) : (
    /* View mode */
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {selDirs.length === 0 ? (
        <div style={{ fontSize:13, color:"#cbd5e1" }}>—</div>
      ) : selDirs.map(sel => {
        const main = dirs.find(d => d.id === sel.main_id);
        if (!main) return null;
        return (
          <div key={sel.main_id} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
            <span style={{ fontSize:12, fontWeight:600, color:"#4f46e5",
              background:"#eef2ff", border:"1px solid #c7d2fe",
              padding:"3px 10px", borderRadius:99, whiteSpace:"nowrap" as const }}>
              {main.label}
            </span>
            {sel.sub_ids.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {sel.sub_ids.map(sid => {
                  const sub = main.children?.find((c:any) => c.id === sid);
                  return sub ? (
                    <span key={sid} style={{ fontSize:11, color:"#64748b",
                      background:"#f8fafc", border:"1px solid #e2e8f0",
                      padding:"3px 8px", borderRadius:99 }}>
                      {sub.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}
</div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:14 }}>
          <FInput label="Ажилчдын тоо" value={form.employee_count} editing={editing}
            onChange={(v:string) => F("employee_count",v)} placeholder="0"/>
          <RadioGroup label="ISO сертификаттай эсэх" value={form.is_iso_certified} editing={editing}
            onChange={(v:any) => F("is_iso_certified",v)}
            options={[{value:true,label:"Тийм"},{value:false,label:"Үгүй"}]}/>
        </div>

        {/* Тусгай зөвшөөрөл */}
        <div style={{ marginBottom: form.has_special_permission ? 12 : 0 }}>
          <RadioGroup label="Тусгай зөвшөөрөлтэй эсэх" value={form.has_special_permission}
            editing={editing} onChange={(v:any) => F("has_special_permission",v)}
            options={[{value:true,label:"Тийм"},{value:false,label:"Үгүй"}]}/>
        </div>

        {form.has_special_permission && (
          <div style={{ display:"flex", flexDirection:"column", gap:10,
            padding:14, borderRadius:12, background:"#f8fafc", border:"1px solid #f1f5f9", marginTop:8 }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr auto",
              gap:10, paddingBottom:6, borderBottom:"1px solid #e2e8f0" }}>
              {["Тусгай зөвшөөрлийн төрөл","Дугаар","Хүчинтэй хугацаа",""].map((h,i) => (
                <div key={i} style={{ fontSize:10, fontWeight:700, color:"#94a3b8",
                  letterSpacing:"0.06em", textTransform:"uppercase" as const }}>{h}</div>
              ))}
            </div>
            {specPerms.map((perm: any, idx: number) => (
              <div key={idx} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr auto",
                gap:10, alignItems:"center", padding:"10px 12px",
                borderRadius:10, background:"white", border:"1px solid #e2e8f0" }}>
                <FSelect label="" value={perm.type_label} editing={editing}
                  onChange={(v:string) => {
                    const found = permTypes.find(t => t.label === v);
                    setSpecPerms(p => p.map((x,i) => i===idx ? {...x,type_label:v,type_id:found?.id||null} : x));
                  }}
                  options={permTypes.map(t => t.label)} placeholder="Төрөл сонгох"/>
                <FInput label="" value={perm.number} editing={editing}
                  onChange={(v:string) => setSpecPerms(p => p.map((x,i) => i===idx ? {...x,number:v} : x))}
                  placeholder="Дугаар"/>
                <FInput label="" type="date" value={perm.expiry} editing={editing}
                  onChange={(v:string) => setSpecPerms(p => p.map((x,i) => i===idx ? {...x,expiry:v} : x))}/>
                {editing && specPerms.length > 1 ? (
                  <button type="button" onClick={() => setSpecPerms(p => p.filter((_,i) => i!==idx))}
                    style={{ padding:"7px 12px", borderRadius:8, border:"1px solid #fecaca",
                      background:"#fef2f2", color:"#ef4444", fontSize:12, cursor:"pointer",
                      fontFamily:"inherit", whiteSpace:"nowrap" as const }}>Устгах</button>
                ) : <div/>}
              </div>
            ))}
            {editing && (
              <button type="button" onClick={() => setSpecPerms(p => [...p, {...BLANK_PERM}])}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  padding:"10px", borderRadius:10, border:"1.5px dashed #c7d2fe",
                  background:"#eef2ff", color:"#6366f1", fontSize:13, fontWeight:600,
                  cursor:"pointer", fontFamily:"inherit" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#e0e7ff"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="#eef2ff"}>
                + Тусгай зөвшөөрлийн төрөл нэмэх
              </button>
            )}
          </div>
        )}
      </Section>

      {/* 4. Хаяг */}
      <Section icon={MapPin} title="ХАЯГИЙН МЭДЭЭЛЭЛ">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <FSelect label="Аймаг / Нийслэл" value={form.aimag_niislel} editing={editing}
            onChange={(v:string) => { F("aimag_niislel",v); F("sum_duureg",""); F("bag_horoo","");
              setFieldErrors(p => ({...p, sum_duureg:"", bag_horoo:""})); }}
            options={AIMAG} placeholder="Сонгох"/>
          {form.aimag_niislel === "Улаанбаатар" ? (
            <FSelect label="Дүүрэг" value={form.sum_duureg} editing={editing}
              onChange={(v:string) => { F("sum_duureg",v); F("bag_horoo",""); }}
              options={Object.keys(UB_DUUREG)} placeholder="Дүүрэг сонгох"/>
          ) : (
            <FSelect label="Сум" value={form.sum_duureg} editing={editing}
              onChange={(v:string) => { F("sum_duureg",v); F("bag_horoo",""); }}
              options={form.aimag_niislel && AIMAG_SUM[form.aimag_niislel] ? AIMAG_SUM[form.aimag_niislel] : []}
              placeholder={form.aimag_niislel ? "Сум сонгох" : "Эхлээд аймаг сонгоно уу"}/>
          )}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:14 }}>
          {form.aimag_niislel === "Улаанбаатар" && form.sum_duureg && UB_DUUREG[form.sum_duureg] ? (
            <FSelect label="Хороо" value={form.bag_horoo} editing={editing}
              onChange={(v:string) => F("bag_horoo",v)}
              options={UB_DUUREG[form.sum_duureg]} placeholder="Хороо сонгох"/>
          ) : (
            <FInput label="Баг / Хороо" value={form.bag_horoo} editing={editing}
              onChange={(v:string) => { F("bag_horoo",v);
                setFieldErrors(p => ({...p, bag_horoo: v && !isMongolian(v) ? "Монгол үсгээр бичнэ үү" : ""})); }}
              fieldError={fieldErrors.bag_horoo}/>
          )}
          <FInput label="Дэлгэрэнгүй хаяг" value={form.address} editing={editing}
            onChange={(v:string) => F("address",v)}/>
        </div>
      </Section>

      {/* 5. Эзэмшигч */}
      <OwnersSection owners={owners} setOwners={setOwners} editing={editing}
        fieldErrors={ownerFieldErrors} setFieldErrors={setOwnerFieldErrors}/>

      {/* 6. Баримт бичиг */}
      <Section icon={FileText} title="КОМПАНИЙН БАРИМТ БИЧИГ">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          <DocUpload label="Улсын бүртгэлийн гэрчилгээ" fieldKey="doc_state_registry"
            preview={previews.doc_state_registry} onFile={onFile} editing={editing} accept=".pdf,image/*" required/>
          <DocUpload label="НӨАТ-ын гэрчилгээ" fieldKey="doc_vat_certificate"
            preview={previews.doc_vat_certificate} onFile={onFile} editing={editing} accept=".pdf,image/*"/>
          <DocUpload label="Тусгай зөвшөөрөл" fieldKey="doc_special_permission"
            preview={previews.doc_special_permission} onFile={onFile} editing={editing} accept=".pdf,image/*"/>
          <DocUpload label="Гэрээ" fieldKey="doc_contract"
            preview={previews.doc_contract} onFile={onFile} editing={editing} accept=".pdf,image/*"/>
          <DocUpload label="Танилцуулга" fieldKey="doc_company_intro"
            preview={previews.doc_company_intro} onFile={onFile} editing={editing} accept=".pdf,.doc,.docx,image/*"/>
        </div>
      </Section>

      {/* 7. Санхүүгийн мэдээлэл */}
      <Section icon={CreditCard} title="САНХҮҮГИЙН МЭДЭЭЛЭЛ">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <FInput label="Банкны нэр" value={form.bank_name} editing={editing}
            onChange={(v:string) => F("bank_name",v)}/>
          <FInput label="Дансны дугаар" value={form.bank_account_number} editing={editing}
            onChange={(v:string) => F("bank_account_number",v)} mono/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:14 }}>
          <FInput label="НӨАТ дугаар" value={form.vat_number} editing={editing}
            onChange={(v:string) => F("vat_number",v)} mono/>
          <FInput label="SWIFT код" value={form.swift_code} editing={editing}
            onChange={(v:string) => F("swift_code",v)} mono/>
          <FInput label="IBAN" value={form.iban} editing={editing}
            onChange={(v:string) => F("iban",v)} mono/>
          <FSelect label="Валют" value={form.currency} editing={editing}
            onChange={(v:string) => F("currency",v)}
            options={[{value:"MNT",label:"₮ Төгрөг"},{value:"USD",label:"$ Доллар"},{value:"EUR",label:"€ Евро"}]}/>
        </div>
      </Section>

      {/* ── Bottom save bar ── */}
      {editing && (
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10,
          padding:"16px 20px", background:"white", borderRadius:14,
          border:"1px solid #e2e8f0", boxShadow:"0 -4px 20px rgba(99,102,241,0.08)" }}>
          {!isNewUser && (
            <button onClick={cancelEdit} disabled={saving}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px",
                borderRadius:10, border:"1px solid #e2e8f0", background:"white",
                color:"#64748b", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>
              <X size={14}/> Болих
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 28px",
              borderRadius:10, border:"none", background:"linear-gradient(135deg,#4f46e5,#6366f1)",
              color:"white", fontSize:13, fontWeight:600, cursor:"pointer",
              opacity:saving?0.7:1, fontFamily:"inherit",
              boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
            {saving
              ? <><Loader2 size={14} style={{ animation:"spin .8s linear infinite" }}/> Хадгалж байна...</>
              : <><Save size={14}/> Хадгалах</>}
          </button>
        </div>
      )}
    </div>
  );
}