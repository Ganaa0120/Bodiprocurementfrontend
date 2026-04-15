"use client";
import { useState } from "react";
import { X, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { API, AIMAG } from "./constants";

const getToken = () =>
  localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";

const inp: React.CSSProperties = {
  width:"100%",height:40,background:"rgba(255,255,255,0.04)",
  border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,
  padding:"0 12px",fontSize:13,color:"rgba(255,255,255,0.85)",
  outline:"none",fontFamily:"inherit",boxSizing:"border-box",
};
const lbl: React.CSSProperties = {
  fontSize:10,fontWeight:700,letterSpacing:"0.1em",
  textTransform:"uppercase" as const,color:"rgba(148,163,184,0.35)",
  display:"block" as const,marginBottom:5,
};
const onFocus = (e: any) => (e.target as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)";
const onBlur  = (e: any) => (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";

export function EditModal({ person, onClose, onSave }: {
  person: any; onClose: () => void; onSave: (updated: any) => void;
}) {
  const [form, setForm] = useState({
    last_name:     person.last_name     || "",
    first_name:    person.first_name    || "",
    family_name:   person.family_name   || "",
    phone:         person.phone         || "",
    gender:        person.gender        || "",
    aimag_niislel: person.aimag_niislel || "",
    sum_duureg:    person.sum_duureg    || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const F = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/api/persons/${person.id}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");
      onSave(data.person || { ...person, ...form });
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:320,display:"flex",alignItems:"center",
      justifyContent:"center",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)" }}
      onClick={onClose}>
      <div style={{ width:"100%",maxWidth:520,background:"#0d1526",
        border:"1px solid rgba(255,255,255,0.08)",borderRadius:22,padding:28,
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)",maxHeight:"90vh",overflowY:"auto" }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.92)" }}>Мэдээлэл засах</div>
            <div style={{ fontSize:11,color:"rgba(148,163,184,0.4)",marginTop:2,fontFamily:"monospace" }}>
              {person.supplier_number || person.email}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:7,
            cursor:"pointer",color:"rgba(148,163,184,0.5)",display:"flex" }}>
            <X size={15}/>
          </button>
        </div>

        {error && (
          <div style={{ padding:"10px 13px",borderRadius:10,background:"rgba(239,68,68,0.07)",
            border:"1px solid rgba(239,68,68,0.18)",marginBottom:16,
            display:"flex",alignItems:"center",gap:8 }}>
            <AlertCircle size={13} style={{ color:"#ef4444",flexShrink:0 }}/>
            <span style={{ fontSize:12,color:"rgba(239,68,68,0.9)" }}>{error}</span>
          </div>
        )}

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
            {([ ["family_name","Ургийн овог"], ["last_name","Овог"], ["first_name","Нэр"] ] as [string,string][]).map(([k,l]) => (
              <div key={k}>
                <label style={lbl}>{l}</label>
                <input value={(form as any)[k]} onChange={e => F(k, e.target.value)}
                  style={inp} placeholder={l} onFocus={onFocus} onBlur={onBlur}/>
              </div>
            ))}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={lbl}>Утас</label>
              <input value={form.phone} onChange={e => F("phone",e.target.value)}
                style={inp} placeholder="99001234" onFocus={onFocus} onBlur={onBlur}/>
            </div>
            <div>
              <label style={lbl}>Хүйс</label>
              <div style={{ display:"flex",gap:6 }}>
                {[{v:"male",l:"Эрэгтэй"},{v:"female",l:"Эмэгтэй"}].map(({v,l}) => (
                  <button key={v} type="button" onClick={() => F("gender",v)} style={{
                    flex:1,height:40,borderRadius:9,fontSize:12,cursor:"pointer",fontFamily:"inherit",
                    border: form.gender===v?"1px solid rgba(59,130,246,0.4)":"1px solid rgba(255,255,255,0.08)",
                    background: form.gender===v?"rgba(59,130,246,0.12)":"rgba(255,255,255,0.04)",
                    color: form.gender===v?"#60a5fa":"rgba(148,163,184,0.6)" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={lbl}>Аймаг / Нийслэл</label>
              <div style={{ position:"relative" }}>
                <select value={form.aimag_niislel} onChange={e => F("aimag_niislel",e.target.value)}
                  style={{ ...inp,appearance:"none" as const,paddingRight:30,cursor:"pointer" }}>
                  <option value="">Сонгох</option>
                  {AIMAG.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown size={13} style={{ position:"absolute",right:10,top:"50%",
                  transform:"translateY(-50%)",color:"rgba(148,163,184,0.4)",pointerEvents:"none" }}/>
              </div>
            </div>
            <div>
              <label style={lbl}>Сум / Дүүрэг</label>
              <input value={form.sum_duureg} onChange={e => F("sum_duureg",e.target.value)}
                style={inp} placeholder="Сум/дүүрэг" onFocus={onFocus} onBlur={onBlur}/>
            </div>
          </div>

          <div style={{ display:"flex",gap:10,marginTop:6 }}>
            <button onClick={onClose} style={{ flex:1,height:42,borderRadius:10,
              background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
              color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
              Болих
            </button>
            <button onClick={handleSave} disabled={saving} style={{ flex:2,height:42,borderRadius:10,
              background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",
              color:"white",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
              display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:saving?0.7:1 }}>
              {saving && <Loader2 size={14} style={{ animation:"spin 0.8s linear infinite" }}/>}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}