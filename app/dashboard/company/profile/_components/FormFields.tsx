"use client";
import { ChevronDown } from "lucide-react";

const lbl: React.CSSProperties = {
  fontSize:11, fontWeight:600, color:"#64748b", letterSpacing:"0.06em",
  textTransform:"uppercase" as const, display:"block", marginBottom:6,
};
const base = (editing: boolean): React.CSSProperties => ({
  width:"100%", paddingTop:9, paddingBottom:9,
  paddingLeft: editing ? 12 : 0, paddingRight:12,
  borderRadius:10, fontSize:13, outline:"none",
  border: editing ? "1.5px solid #e2e8f0" : "1.5px solid transparent",
  background: editing ? "white" : "transparent",
  color:"#0f172a", boxSizing:"border-box" as const, transition:"all .15s",
});
const fo = (e: any) => (e.target as HTMLElement).style.borderColor = "#6366f1";
const bl = (e: any) => (e.target as HTMLElement).style.borderColor = "#e2e8f0";

export function FInput({ label, value, onChange, placeholder, type="text", editing, mono=false }: any) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} readOnly={!editing}
        onChange={e => editing && onChange(e.target.value)}
        placeholder={editing ? placeholder || label : "—"}
        style={{ ...base(editing), fontFamily: mono ? "monospace" : "inherit" }}
        onFocus={e => editing && fo(e)} onBlur={e => editing && bl(e)}/>
    </div>
  );
}

export function FSelect({ label, value, onChange, options, placeholder, editing }: any) {
  return (
    <div>
      {label && <label style={lbl}>{label}</label>}
      <div style={{ position:"relative" }}>
        <select value={value} disabled={!editing} onChange={e => onChange(e.target.value)}
          style={{ ...base(editing), paddingRight:28, color:value?"#0f172a":"#94a3b8",
            appearance:"none" as const, cursor:editing?"pointer":"default" }}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o: any) => (
            <option key={o.value||o} value={o.value||o}>{o.label||o}</option>
          ))}
        </select>
        {editing && <ChevronDown size={13} style={{ position:"absolute",right:10,
          top:"50%",transform:"translateY(-50%)",color:"#94a3b8",pointerEvents:"none" }}/>}
      </div>
    </div>
  );
}

export function RadioGroup({ label, options, value, onChange, editing }: any) {
  return (
    <div>
      {label && <label style={lbl}>{label}</label>}
      <div style={{ display:"flex", gap:8 }}>
        {options.map((o: any) => (
          <button key={String(o.value)} type="button" onClick={() => editing && onChange(o.value)}
            style={{ flex:1, paddingTop:8, paddingBottom:8, borderRadius:9, fontSize:13, fontWeight:500,
              border: value===o.value ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
              background: value===o.value ? "#eef2ff" : editing ? "white" : "transparent",
              color: value===o.value ? "#4f46e5" : "#64748b",
              cursor: editing ? "pointer" : "default", transition:"all .15s" }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}