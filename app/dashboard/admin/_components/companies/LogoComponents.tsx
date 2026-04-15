"use client";
import { useState } from "react";
import { Eye } from "lucide-react";
import { ORG_COLORS } from "./constants";
import { DocViewerModal } from "../detail/DocViewer";

export function OrgAvatar({ org, size = 34 }: { org: any; size?: number }) {
  const col = ORG_COLORS[(org.company_name?.charCodeAt(0) ?? 0) % ORG_COLORS.length];
  const r = Math.round(size * 0.3);

  if (org.company_logo_url) {
    return (
      <img src={org.company_logo_url}
        style={{ width:size,height:size,borderRadius:r,objectFit:"cover",
          flexShrink:0,border:"1px solid rgba(255,255,255,0.08)" }}/>
    );
  }
  return (
    <div style={{ width:size,height:size,borderRadius:r,flexShrink:0,
      background:`${col}15`,border:`1px solid ${col}20`,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:Math.round(size*0.38),fontWeight:700,color:col }}>
      {org.company_name?.[0] ?? "?"}
    </div>
  );
}

export function ClickableLogo({ org, size = 54 }: { org: any; size?: number }) {
  const [viewing, setViewing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const col = ORG_COLORS[(org.company_name?.charCodeAt(0) ?? 0) % ORG_COLORS.length];
  const url = org.company_logo_url;
  const r   = Math.round(size * 0.26);

  return (
    <>
      {viewing && url && (
        <DocViewerModal  url={url} label="Компанийн лого" onClose={() => setViewing(false)}/>
      )}
      <div style={{ position:"relative",flexShrink:0,cursor:url?"pointer":"default" }}
        onClick={e => { e.stopPropagation(); url && setViewing(true); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        {url ? (
          <img src={url} style={{ width:size,height:size,borderRadius:r,objectFit:"cover",
            border:"1px solid rgba(255,255,255,0.1)" }}/>
        ) : (
          <div style={{ width:size,height:size,borderRadius:r,
            background:`${col}15`,border:`1px solid ${col}25`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:Math.round(size*0.4),fontWeight:700,color:col }}>
            {org.company_name?.[0] ?? "?"}
          </div>
        )}
        {url && (
          <div style={{ position:"absolute",inset:0,borderRadius:r,
            background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",
            justifyContent:"center",opacity:hovered?1:0,transition:"opacity .15s" }}>
            <Eye size={16} style={{ color:"white" }}/>
          </div>
        )}
      </div>
    </>
  );
}