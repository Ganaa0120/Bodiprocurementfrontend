export function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div style={{ display:"flex",alignItems:"flex-start",gap:8,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
      <span style={{ fontSize:11,color:"rgba(148,163,184,0.5)",width:130,flexShrink:0,paddingTop:1 }}>{label}</span>
      <span style={{ fontSize:12,color:"rgba(255,255,255,0.8)",fontWeight:500,flex:1 }}>{value}</span>
    </div>
  );
}

export function Section({ icon: Icon, title, children }: {
  icon: any; title: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:10 }}>
        <Icon size={12} style={{ color:"rgba(96,165,250,0.6)" }}/>
        <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",
          textTransform:"uppercase" as const,color:"rgba(148,163,184,0.4)" }}>
          {title}
        </span>
      </div>
      <div style={{ background:"rgba(255,255,255,0.02)",borderRadius:12,padding:"0 14px",border:"1px solid rgba(255,255,255,0.04)" }}>
        {children}
      </div>
    </div>
  );
}