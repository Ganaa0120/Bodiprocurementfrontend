"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, FolderOpen, Folder, Pencil, Trash2, Loader2 } from "lucide-react";
import { API, getToken, CAT_COLORS } from "./constants";
import type { Category } from "./types";

function StatusToggle({ cat, onToggled, showToast }: {
  cat: Category; onToggled: () => void; showToast: (m: string, ok?: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const toggle = async () => {
    setLoading(true);
    try {
      const newStatus = cat.status === "active" ? "inactive" : "active";
      const res = await fetch(`${API}/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast(`Статус → ${newStatus === "active" ? "Идэвхтэй" : "Идэвхгүй"}`);
      onToggled();
    } catch (e: any) { showToast(e.message, false); }
    finally { setLoading(false); }
  };
  const active = cat.status === "active";
  return (
    <button onClick={toggle} disabled={loading}
      style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:99,
        border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,
        background:active?"rgba(16,185,129,0.12)":"rgba(148,163,184,0.1)",
        color:active?"#10b981":"#94a3b8",opacity:loading?0.5:1 }}>
      {loading
        ? <Loader2 size={10} style={{ animation:"spin 0.8s linear infinite" }}/>
        : <span style={{ width:5,height:5,borderRadius:"50%",background:active?"#10b981":"#94a3b8" }}/>
      }
      {active ? "Идэвхтэй" : "Идэвхгүй"}
    </button>
  );
}

export function CategoryRow({ cat, depth, isSuperAdmin, onEdit, onDelete, onRefresh, showToast }: {
  cat: Category; depth: number; isSuperAdmin: boolean;
  onEdit: (c: Category) => void; onDelete: (c: Category) => void;
  onRefresh: () => void; showToast: (m: string, ok?: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = (cat.children ?? []).length > 0;
  const col = CAT_COLORS[cat.category_number % CAT_COLORS.length];
  const prefix = cat.category_prefix;

  return (
    <>
      <tr className="tr">
        {/* ── Нэр багана ── */}
        <td style={{ padding:"11px 16px" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,paddingLeft:depth*22 }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)}
                style={{ background:"none",border:"none",cursor:"pointer",
                  color:"rgba(148,163,184,0.5)",display:"flex",padding:2,flexShrink:0 }}>
                {expanded ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}
              </button>
            ) : <span style={{ width:17,flexShrink:0 }}/>}

            <div style={{ width:30,height:30,borderRadius:8,flexShrink:0,
              background:`${col}15`,border:`1px solid ${col}20`,
              display:"flex",alignItems:"center",justifyContent:"center" }}>
              {hasChildren
                ? <FolderOpen size={13} style={{ color:col }}/>
                : <Folder    size={13} style={{ color:col }}/>}
            </div>

            <div>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                {prefix && (
                  <span style={{ fontSize:10,padding:"1px 7px",borderRadius:6,
                    background:"rgba(59,130,246,0.15)",color:"#60a5fa",
                    fontFamily:"monospace",fontWeight:700,flexShrink:0,letterSpacing:"0.04em" }}>
                    {prefix}
                  </span>
                )}
                <span style={{ fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)" }}>
                  {cat.category_name}
                </span>
              </div>
              {hasChildren && (
                <div style={{ fontSize:10,color:"rgba(148,163,184,0.4)",marginTop:2 }}>
                  {cat.children!.length} дэд ангилал
                </div>
              )}
            </div>
          </div>
        </td>

        {/* ── Дугаар багана — prefix-тэй харуулна ── */}
        <td style={{ padding:"11px 16px",fontSize:12,fontFamily:"monospace",color:"rgba(148,163,184,0.5)" }}>
          {prefix
            ? <span>
                <span style={{ color:"#60a5fa",fontWeight:700 }}>{prefix}</span>
                <span style={{ color:"rgba(148,163,184,0.35)" }}>-</span>
                {cat.category_number}
              </span>
            : cat.category_number
          }
        </td>

        {/* ── Статус багана ── */}
        <td style={{ padding:"11px 16px" }}>
          {isSuperAdmin ? (
            <StatusToggle cat={cat} onToggled={onRefresh} showToast={showToast}/>
          ) : (
            <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",
              borderRadius:99,fontSize:11,fontWeight:600,
              background:cat.status==="active"?"rgba(16,185,129,0.12)":"rgba(148,163,184,0.1)",
              color:cat.status==="active"?"#10b981":"#94a3b8" }}>
              <span style={{ width:5,height:5,borderRadius:"50%",
                background:cat.status==="active"?"#10b981":"#94a3b8" }}/>
              {cat.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
            </span>
          )}
        </td>

        {/* ── Огноо багана ── */}
        <td style={{ padding:"11px 16px",fontSize:11,color:"rgba(148,163,184,0.4)" }}>
          {cat.created_at ? new Date(cat.created_at).toLocaleDateString("mn-MN") : "—"}
        </td>

        {/* ── Үйлдэл багана ── */}
        <td style={{ padding:"11px 16px" }}>
          {isSuperAdmin && (
            <div style={{ display:"flex",gap:5 }}>
              <button onClick={() => onEdit(cat)}
                style={{ background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.18)",
                  borderRadius:8,padding:"5px 9px",cursor:"pointer",display:"flex",
                  alignItems:"center",gap:4,fontSize:11,color:"#60a5fa",fontFamily:"inherit" }}>
                <Pencil size={11}/> Засах
              </button>
              {!hasChildren && (
                <button onClick={() => onDelete(cat)}
                  style={{ background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",
                    borderRadius:8,padding:"5px 8px",cursor:"pointer",display:"flex",
                    alignItems:"center",color:"rgba(239,68,68,0.7)" }}>
                  <Trash2 size={12}/>
                </button>
              )}
            </div>
          )}
        </td>
      </tr>

      {/* ── Дэд ангилалууд ── */}
      {expanded && hasChildren && cat.children!.map(child => (
        <CategoryRow key={child.id} cat={child} depth={depth+1}
          isSuperAdmin={isSuperAdmin} onEdit={onEdit} onDelete={onDelete}
          onRefresh={onRefresh} showToast={showToast}/>
      ))}
    </>
  );
}