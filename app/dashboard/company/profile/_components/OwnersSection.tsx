"use client";
import { Section } from "./Section";
import { FInput, RadioGroup } from "./FormFields";
import { User } from "lucide-react";
import { BLANK_OWNER, BLANK_FINAL, BLANK_EXEC } from "./constants";
import { isMongolian } from "@/utils/mongolianValidation";

function OwnerCard({ owner, idx, editing, label, onRemove, canRemove, fieldErrors, onUpdate }: any) {
  return (
    <div style={{ padding:16, borderRadius:12,
      background: idx%2===0 ? "#f8fafc" : "#f1f5f9", border:"1px solid #e2e8f0" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ fontSize:11, fontWeight:700, color:"#6366f1",
          letterSpacing:"0.06em", textTransform:"uppercase" as const }}>
          {idx+1}-р {label}
        </span>
        {canRemove && editing && (
          <button type="button" onClick={onRemove}
            style={{ fontSize:11, color:"#ef4444", background:"rgba(239,68,68,0.08)",
              border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:"3px 10px", cursor:"pointer" }}>
            Устгах
          </button>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:14 }}>
        {/* Ургийн овог */}
        <div>
          <FInput label="Ургийн овог" value={owner.family_name} editing={editing}
            onChange={(v:string) => onUpdate(idx, "family_name", v)}/>
          {fieldErrors?.[`owner_${idx}_family_name`] && (
            <span style={{ fontSize:11, color:"#ef4444", marginTop:4, display:"block" }}>
              ✕ {fieldErrors[`owner_${idx}_family_name`]}
            </span>
          )}
        </div>
        {/* Овог */}
        <div>
          <FInput label="Овог" value={owner.last_name} editing={editing}
            onChange={(v:string) => onUpdate(idx, "last_name", v)}/>
          {fieldErrors?.[`owner_${idx}_last_name`] && (
            <span style={{ fontSize:11, color:"#ef4444", marginTop:4, display:"block" }}>
              ✕ {fieldErrors[`owner_${idx}_last_name`]}
            </span>
          )}
        </div>
        {/* Нэр */}
        <div>
          <FInput label="Нэр" value={owner.first_name} editing={editing}
            onChange={(v:string) => onUpdate(idx, "first_name", v)}/>
          {fieldErrors?.[`owner_${idx}_first_name`] && (
            <span style={{ fontSize:11, color:"#ef4444", marginTop:4, display:"block" }}>
              ✕ {fieldErrors[`owner_${idx}_first_name`]}
            </span>
          )}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
        <RadioGroup label="Хүйс" value={owner.gender} editing={editing}
          onChange={(v:string) => onUpdate(idx, "gender", v)}
          options={[{value:"male",label:"Эрэгтэй"},{value:"female",label:"Эмэгтэй"}]}/>
        <FInput label="Албан тушаал" value={owner.position} editing={editing}
          onChange={(v:string) => onUpdate(idx, "position", v)}/>
        <FInput label="Утас" value={owner.phone} editing={editing}
          onChange={(v:string) => onUpdate(idx, "phone", v)}/>
      </div>
    </div>
  );
}

export function OwnersSection({ owners, setOwners, editing, fieldErrors = {}, setFieldErrors }: any) {
  const update = (idx: number, key: string, val: string) => {
    setOwners((p: any[]) => p.map((o,i) => i===idx ? {...o,[key]:val} : o));
    // ✅ Real-time validation
    if (setFieldErrors && ["family_name","last_name","first_name"].includes(key)) {
      setFieldErrors((p: any) => ({
        ...p,
        [`owner_${idx}_${key}`]: val && !isMongolian(val) ? "Монгол үсгээр бичнэ үү" : "",
      }));
    }
  };

  return (
    <Section icon={User} title="ӨМЧЛӨГЧИЙН МЭДЭЭЛЭЛ">
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {owners.map((owner: any, idx: number) => (
          <OwnerCard
            key={idx} idx={idx} label="эзэмшигч" editing={editing}
            owner={owner} fieldErrors={fieldErrors}
            canRemove={owners.length > 1}
            onRemove={() => setOwners((p: any[]) => p.filter((_,i) => i!==idx))}
            onUpdate={update}
          />
        ))}
        {editing && (
          <AddBtn onClick={() => setOwners((p: any[]) => [...p, {...BLANK_OWNER}])} label="Эзэмшигч нэмэх"/>
        )}
      </div>
    </Section>
  );
}

export function ExecutiveDirectorsSection({ directors, setDirectors, editing }: any) {
  const update = (idx: number, key: string, val: string) =>
    setDirectors((p: any[]) => p.map((o,i) => i===idx ? {...o,[key]:val} : o));

  return (
    <Section icon={User} title="ГҮЙЦЭТГЭХ ЗАХИРАЛ">
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {directors.map((d: any, idx: number) => (
          <div key={idx} style={{ padding:16, borderRadius:12,
            background: idx%2===0 ? "#f8fafc" : "#f1f5f9", border:"1px solid #e2e8f0" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#6366f1",
                letterSpacing:"0.06em", textTransform:"uppercase" as const }}>
                {idx === 0 ? "Гүйцэтгэх захирал" : ``}
              </span>
              {directors.length > 1 && editing && (
                <button type="button"
                  onClick={() => setDirectors((p: any[]) => p.filter((_,i) => i!==idx))}
                  style={{ fontSize:11, color:"#ef4444", background:"rgba(239,68,68,0.08)",
                    border:"1px solid rgba(239,68,68,0.2)", borderRadius:8,
                    padding:"3px 10px", cursor:"pointer" }}>
                  Устгах
                </button>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:14 }}>
              <FInput label="Албан тушаал" value={d.position} editing={editing}
                onChange={(v:string) => update(idx, "position", v)}
                placeholder="Гүйцэтгэх захирал"/>
              <FInput label="Овог" value={d.last_name} editing={editing}
                onChange={(v:string) => update(idx, "last_name", v)}/>
              <FInput label="Нэр" value={d.first_name} editing={editing}
                onChange={(v:string) => update(idx, "first_name", v)}/>
              <FInput label="Утас" value={d.phone} editing={editing}
                onChange={(v:string) => update(idx, "phone", v)}/>
              <FInput label="И-мэйл хаяг" value={d.email} editing={editing}
                onChange={(v:string) => update(idx, "email", v)}/>
            </div>
          </div>
        ))}
        {editing && (
          <AddBtn
            onClick={() => setDirectors((p: any[]) => [...p, {...BLANK_EXEC, position:""}])}
            label="Мөр нэмэх"/>
        )}
      </div>
    </Section>
  );
}

// export function FinalOwnersSection({ finalOwners, setFinalOwners, editing }: any) {
//   const update = (idx: number, key: string, val: string) =>
//     setFinalOwners((p: any[]) => p.map((o,i) => i===idx ? {...o,[key]:val} : o));

//   return (
//     <Section icon={User} title="ӨМЧЛӨГЧИЙН МЭДЭЭЛЭЛ">
//       <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
//         {finalOwners.map((fo: any, idx: number) => (
//           <div key={idx} style={{ padding:16, borderRadius:12,
//             background: idx%2===0 ? "#f8fafc" : "#f1f5f9", border:"1px solid #e2e8f0" }}>
//             <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
//               <span style={{ fontSize:11, fontWeight:700, color:"#6366f1",
//                 letterSpacing:"0.06em", textTransform:"uppercase" as const }}>
//                 {idx+1}-р өмчлөгч
//               </span>
//               {finalOwners.length > 1 && editing && (
//                 <button type="button"
//                   onClick={() => setFinalOwners((p: any[]) => p.filter((_,i) => i!==idx))}
//                   style={{ fontSize:11, color:"#ef4444", background:"rgba(239,68,68,0.08)",
//                     border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:"3px 10px", cursor:"pointer" }}>
//                   Устгах
//                 </button>
//               )}
//             </div>
//             <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
//               <FInput label="Овог" value={fo.last_name} editing={editing}
//                 onChange={(v:string) => update(idx, "last_name", v)}/>
//               <FInput label="Нэр"  value={fo.first_name} editing={editing}
//                 onChange={(v:string) => update(idx, "first_name", v)}/>
//             </div>
//           </div>
//         ))}
//         {editing && (
//           <AddBtn onClick={() => setFinalOwners((p: any[]) => [...p, {...BLANK_FINAL}])} label="Өмчлөгч нэмэх"/>
//         )}
//       </div>
//     </Section>
//   );
// }

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6,
        padding:12, borderRadius:12, border:"1.5px dashed #c7d2fe", background:"#eef2ff",
        color:"#6366f1", fontSize:13, fontWeight:600, cursor:"pointer", width:"100%", transition:"all .15s" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#e0e7ff"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="#eef2ff"}>
      + {label}
    </button>
  );
}