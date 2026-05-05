"use client";
import { useState, useEffect } from "react";
import { Loader2, ChevronDown, Users, Building2, CheckCircle2 } from "lucide-react";
import { API, authH } from "./constants";

type DirGroup = { main_id: number; sub_ids: number[] };

export function RecipientPicker({ form, setForm, directions, accentColor, optional }: {
  form: any; setForm: any; directions: any[]; accentColor: string; optional?: boolean;
}) {
  const [persons,   setPersons]   = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [dirF,      setDirF]      = useState("");
  const ac = accentColor;

  useEffect(() => {
    setLoading(true);
    const url = form.recipient_type === "individual"
      ? `${API}/api/persons?limit=500`
      : `${API}/api/organizations?limit=500`;
    fetch(url, { headers: authH() }).then(r => r.json()).then(d => {
      if (form.recipient_type === "individual") setPersons(d.persons ?? d.data ?? []);
      else setCompanies(d.organizations ?? d.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
    setForm((p: any) => ({ ...p, recipient_ids: [] }));
    setSearch(""); setDirF("");
  }, [form.recipient_type]);

  /* ── activity_directions-аас label жагсаалт авах ── */
  const getDirLabels = (rawDirs: any): string[] => {
    if (!Array.isArray(rawDirs) || rawDirs.length === 0) return [];

    // Шинэ формат: [{main_id, sub_ids:[]}]
    if (typeof rawDirs[0] === "object" && rawDirs[0]?.main_id !== undefined) {
      return (rawDirs as DirGroup[])
        .map(g => {
          const main = directions.find((d: any) => Number(d.id) === Number(g.main_id));
          return main?.label || `#${g.main_id}`;
        })
        .filter(Boolean);
    }

    // Хуучин формат: ["label1", "label2"]
    if (typeof rawDirs[0] === "string") {
      return rawDirs as string[];
    }

    // Хуучин формат: [number, number]
    if (typeof rawDirs[0] === "number") {
      return (rawDirs as number[]).map(id => {
        const main = directions.find((d: any) => Number(d.id) === Number(id));
        return main?.label || `#${id}`;
      });
    }

    return [];
  };

  /* ── User filter-ийг шинэ форматтай ажилладаг болгох ── */
  const userMatchesDir = (item: any, dirLabel: string): boolean => {
    if (!dirLabel) return true;
    const userDirs = item.activity_directions;
    if (!Array.isArray(userDirs) || userDirs.length === 0) return false;

    // Хуучин формат: string[]
    if (typeof userDirs[0] === "string") return userDirs.includes(dirLabel);

    // Шинэ формат: {main_id, sub_ids:[]}[]
    if (typeof userDirs[0] === "object" && userDirs[0]?.main_id !== undefined) {
      // dirLabel-аас main_id олох
      const matchedMain = directions.find((d: any) => d.label === dirLabel);
      if (!matchedMain) return false;
      return userDirs.some((g: DirGroup) => Number(g.main_id) === Number(matchedMain.id));
    }

    // Number array
    if (typeof userDirs[0] === "number") {
      const matchedMain = directions.find((d: any) => d.label === dirLabel);
      return matchedMain ? userDirs.includes(matchedMain.id) : false;
    }

    return false;
  };

  const items   = form.recipient_type === "individual" ? persons : companies;
  const getName = (x: any) => form.recipient_type === "individual"
    ? `${x.last_name ?? ""} ${x.first_name ?? ""}`.trim() || x.email
    : x.company_name || x.email;

  const filtered = items.filter(x => {
    const q = search.toLowerCase();
    return (!q || getName(x).toLowerCase().includes(q) || x.email?.toLowerCase().includes(q))
      && userMatchesDir(x, dirF);
  });

  const toggle    = (id: string) => setForm((p: any) => ({
    ...p, recipient_ids: p.recipient_ids.includes(id)
      ? p.recipient_ids.filter((x: string) => x !== id)
      : [...p.recipient_ids, id]
  }));
  const toggleAll = () => {
    const ids = filtered.map(x => x.id);
    setForm((p: any) => ({
      ...p, recipient_ids: ids.every(id => p.recipient_ids.includes(id))
        ? p.recipient_ids.filter((id: string) => !ids.includes(id))
        : [...new Set([...p.recipient_ids, ...ids])]
    }));
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
        {[{v:"individual",l:"Хувь хүн",I:Users},{v:"company",l:"Байгууллага",I:Building2}].map(({v,l,I}) => (
          <button key={v} type="button"
            onClick={() => setForm((p: any) => ({ ...p, recipient_type: v, recipient_ids: [] }))}
            style={{ height:42,borderRadius:10,cursor:"pointer",fontFamily:"inherit",
              display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:12,
              border: form.recipient_type===v ? `1px solid ${ac}60` : "1px solid rgba(255,255,255,0.08)",
              background: form.recipient_type===v ? `${ac}15` : "rgba(255,255,255,0.04)",
              color: form.recipient_type===v ? ac : "rgba(148,163,184,0.6)" }}>
            <I size={13}/>{l}
          </button>
        ))}
      </div>

      <div style={{ position:"relative" }}>
        <select value={dirF} onChange={e => setDirF(e.target.value)}
          style={{ width:"100%",height:38,background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,
            padding:"0 30px 0 12px",fontSize:12,color:"rgba(255,255,255,0.75)",
            outline:"none",cursor:"pointer",fontFamily:"inherit",appearance:"none" as const }}>
          <option value="">— Бүх үйл ажиллагааны чиглэл —</option>
          {directions.map(d => <option key={d.id} value={d.label}>{d.label}</option>)}
        </select>
        <ChevronDown size={13} style={{ position:"absolute",right:10,top:"50%",
          transform:"translateY(-50%)",color:"rgba(148,163,184,0.4)",pointerEvents:"none" }}/>
      </div>

      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",
          fontSize:12,color:"rgba(148,163,184,0.3)",pointerEvents:"none" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={form.recipient_type==="individual" ? "Нэр, и-мэйлээр хайх..." : "Байгууллагын нэр хайх..."}
          style={{ width:"100%",height:38,background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.08)",borderRadius:9,
            padding:"0 12px 0 34px",fontSize:12,color:"rgba(255,255,255,0.8)",
            outline:"none",fontFamily:"inherit" }}
          onFocus={e => (e.target as HTMLElement).style.borderColor = `${ac}60`}
          onBlur={e  => (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"}/>
      </div>

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ fontSize:11,color:"rgba(148,163,184,0.4)" }}>
          {loading ? "Ачаалж байна..." : `${filtered.length} / ${items.length}`}
          {form.recipient_ids.length > 0 && (
            <> · <span style={{ color:ac,fontWeight:600 }}>{form.recipient_ids.length} сонгогдсон</span></>
          )}
        </span>
        {filtered.length > 0 && (
          <button type="button" onClick={toggleAll}
            style={{ fontSize:11,background:"none",border:"none",color:`${ac}bb`,cursor:"pointer",fontFamily:"inherit" }}>
            {filtered.every(x => form.recipient_ids.includes(x.id)) ? "Бүгдийг арилгах" : "Бүгдийг сонгох"}
          </button>
        )}
      </div>

      <div style={{ maxHeight:220,overflowY:"auto",background:"rgba(255,255,255,0.02)",
        borderRadius:10,border:"1px solid rgba(255,255,255,0.06)" }}>
        {loading ? (
          <div style={{ display:"flex",justifyContent:"center",padding:24 }}>
            <Loader2 size={16} style={{ color:ac,animation:"spin 0.8s linear infinite" }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"20px",textAlign:"center",fontSize:12,color:"rgba(148,163,184,0.3)" }}>
            {optional ? "Сонгоогүй бол бүх нийлүүлэгчид явна" : "Тохирох бүртгэл олдсонгүй"}
          </div>
        ) : filtered.map(item => {
          const checked = form.recipient_ids.includes(item.id);
          // ⭐ Шинэ хувилбар: object-уудыг ч label руу хөрвүүлнэ
          const dirLabels = getDirLabels(item.activity_directions);
          return (
            <div key={item.id} onClick={() => toggle(item.id)}
              style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 14px",cursor:"pointer",
                borderBottom:"1px solid rgba(255,255,255,0.04)",
                background:checked ? `${ac}10` : "transparent",transition:"background .1s" }}>
              <div style={{ width:18,height:18,borderRadius:5,flexShrink:0,
                background:checked ? ac : "rgba(255,255,255,0.04)",
                border:checked ? `1px solid ${ac}` : "1px solid rgba(255,255,255,0.15)",
                display:"flex",alignItems:"center",justifyContent:"center" }}>
                {checked && <CheckCircle2 size={11} color="white"/>}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.85)",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{getName(item)}</div>
                <div style={{ fontSize:10,color:"rgba(148,163,184,0.35)",
                  display:"flex",gap:5,flexWrap:"wrap",marginTop:1 }}>
                  <span>{item.email}</span>
                  {dirLabels.slice(0,2).map((label, i) => (
                    <span key={`${item.id}-dir-${i}`}
                      style={{ padding:"0 5px",borderRadius:99,background:`${ac}15`,
                        color:ac,fontSize:9 }}>
                      {label}
                    </span>
                  ))}
                  {dirLabels.length > 2 && (
                    <span style={{ fontSize:9,color:"rgba(148,163,184,0.4)" }}>
                      +{dirLabels.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {optional && form.recipient_ids.length === 0 && items.length > 0 && (
        <div style={{ fontSize:11,color:"rgba(148,163,184,0.35)",textAlign:"center",
          padding:"6px 10px",borderRadius:8,background:"rgba(255,255,255,0.02)",
          border:"1px solid rgba(255,255,255,0.05)" }}>
          🌐 Хэн ч сонгоогүй → бүх нийлүүлэгчид илгээгдэнэ
        </div>
      )}
    </div>
  );
}