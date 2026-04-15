"use client";
import { useState } from "react";
import { Eye } from "lucide-react";
import { AVATAR_COLORS } from "./constants";
import { DocViewerModal } from "./DocViewer";

export function Avatar({ person, size = 34 }: { person: any; size?: number }) {
  const col = AVATAR_COLORS[
    (person.last_name?.charCodeAt(0) ?? person.email?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length
  ];
  const initial = (
    person.last_name?.[0] ?? person.first_name?.[0] ?? person.email?.[0] ?? "?"
  ).toUpperCase();

  if (person.profile_photo_url) {
    return (
      <img src={person.profile_photo_url}
        style={{ width:size,height:size,borderRadius:Math.round(size*0.3),
          objectFit:"cover",flexShrink:0,border:"1px solid rgba(255,255,255,0.1)" }}/>
    );
  }
  return (
    <div style={{ width:size,height:size,borderRadius:Math.round(size*0.3),flexShrink:0,
      background:`${col}15`,border:`1px solid ${col}25`,display:"flex",
      alignItems:"center",justifyContent:"center",
      fontSize:Math.round(size*0.4),fontWeight:700,color:col }}>
      {initial}
    </div>
  );
}

export function ClickableAvatar({ person, size = 52 }: { person: any; size?: number }) {
  const [viewing, setViewing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const col = AVATAR_COLORS[
    (person.last_name?.charCodeAt(0) ?? person.email?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length
  ];
  const initial = (
    person.last_name?.[0] ?? person.first_name?.[0] ?? person.email?.[0] ?? "?"
  ).toUpperCase();
  const r = Math.round(size * 0.27);
  const url = person.profile_photo_url;

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
          <img src={url}
            style={{ width:size,height:size,borderRadius:r,objectFit:"cover",
              border:"2px solid rgba(59,130,246,0.3)" }}/>
        ) : (
          <div style={{ width:size,height:size,borderRadius:r,background:`${col}15`,
            border:`1px solid ${col}30`,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:Math.round(size*0.38),fontWeight:700,color:col }}>
            {initial}
          </div>
        )}
        {url && (
          <div style={{ position:"absolute",inset:0,borderRadius:r,background:"rgba(0,0,0,0.45)",
            display:"flex",alignItems:"center",justifyContent:"center",
            opacity:hovered?1:0,transition:"opacity .15s" }}>
            <Eye size={16} style={{ color:"white" }}/>
          </div>
        )}
      </div>
    </>
  );
}