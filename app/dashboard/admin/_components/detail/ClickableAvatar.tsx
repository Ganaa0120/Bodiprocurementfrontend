"use client";
import { useState } from "react";
import { Eye } from "lucide-react";
import { DocViewerModal } from "./DocViewer";

export function ClickableAvatar({ url, name }: { url?: string; name: string }) {
  const [viewing, setViewing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ini = (name?.[0] ?? "?").toUpperCase();

  return (
    <>
      {viewing && url && (
        <DocViewerModal url={url} label="Профайл зураг" onClose={() => setViewing(false)}/>
      )}
      <div style={{ position:"relative",flexShrink:0,cursor:url?"pointer":"default" }}
        onClick={e => { e.stopPropagation(); url && setViewing(true); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        {url ? (
          <img src={url} style={{ width:54,height:54,borderRadius:14,objectFit:"cover",border:"2px solid rgba(59,130,246,0.3)" }}/>
        ) : (
          <div style={{ width:54,height:54,borderRadius:14,background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:20,fontWeight:700,border:"1px solid rgba(59,130,246,0.2)" }}>
            {ini}
          </div>
        )}
        {url && (
          <div style={{ position:"absolute",inset:0,borderRadius:14,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",opacity:hovered?1:0,transition:"opacity .15s" }}>
            <Eye size={16} style={{ color:"white" }}/>
          </div>
        )}
      </div>
    </>
  );
}