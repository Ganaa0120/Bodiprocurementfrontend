"use client";
import { useState, useCallback, useRef } from "react";
import { RefreshCw, Eye, Search, Download } from "lucide-react";
import { API, AVATAR_COLORS } from "./constants";
import { getStatus, fmtDate, getDirLabels } from "./utils";
import { Avatar } from "./AvatarComponents";
import { DetailModal } from "./DetailModal";
import type { IndividualsTabProps } from "./types";
import { ExcelExportModal } from "../ExcelImportModal";

const getToken = () =>
  localStorage.getItem("super_admin_token") || localStorage.getItem("token") || "";

function Badge({ status }: { status: string }) {
  const c = getStatus(status);
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",
      borderRadius:99,background:c.bg,fontSize:11,fontWeight:600,color:c.color }}>
      <span style={{ width:5,height:5,borderRadius:"50%",background:c.dot }}/>
      {c.label}
    </span>
  );
}

function Th({ h }: { h: string }) {
  return (
    <th style={{ textAlign:"left",padding:"10px 16px",fontSize:10,fontWeight:700,
      color:"rgba(148,163,184,0.28)",textTransform:"uppercase" as const,
      letterSpacing:"0.09em",borderBottom:"1px solid rgba(255,255,255,0.05)",
      whiteSpace:"nowrap" as const }}>
      {h}
    </th>
  );
}

export function IndividualsTab({
  data, search, setSearch, status, setStatus, dirs = [],
}: IndividualsTabProps) {
  const canEditStatus = data.canEditStatus !== false;
  const canEdit       = data.canEdit       !== false;
  const canDelete     = data.canDelete     !== false;
  const [detailPerson, setDetailPerson] = useState<any>(null);
  const [localPersons, setLocalPersons] = useState<any[] | null>(null);
  const [showExport,   setShowExport]   = useState(false);
  const isOpening = useRef(false);
  const showToast = data.showToast ?? (() => {});
  const persons   = localPersons ?? data.persons ?? [];

  const filtered = persons.filter((p: any) => {
    const q = search.toLowerCase();
    return !q || `${p.last_name??""} ${p.first_name??""} ${p.email}`.toLowerCase().includes(q);
  });

  const openDetail = useCallback(async (p: any) => {
    isOpening.current = true;
    setDetailPerson(p);
    requestAnimationFrame(() => { isOpening.current = false; });
    try {
      const res = await fetch(`${API}/api/persons/${p.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const d = await res.json();
      if (d.success) setDetailPerson(d.person ?? d.user ?? p);
    } catch {}
  }, []);

  const closeDetail = useCallback(() => {
    if (isOpening.current) return;
    setDetailPerson(null);
  }, []);

  const handleStatusChange = useCallback((id: string, newStatus: string) => {
    const update = (prev: any[]) =>
      newStatus === "deleted"
        ? prev.filter(p => p.id !== id)
        : prev.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setLocalPersons(prev => update(prev ?? data.persons ?? []));
    setDetailPerson((prev: any) => prev?.id === id ? { ...prev, status: newStatus } : prev);
  }, [data.persons]);

  const handleDeleted = useCallback((id: string) => {
    handleStatusChange(id, "deleted");
    setDetailPerson(null);
  }, [handleStatusChange]);

  return (
    <>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        .ind-row { transition:background .12s; }
        .ind-row:hover { background:rgba(255,255,255,0.028); }
        .ind-row:last-child td { border-bottom:none; }
      `}</style>

      {detailPerson && (
        <DetailModal
          person={detailPerson}
          onClose={closeDetail}
          onStatusChange={handleStatusChange}
          onDeleted={handleDeleted}
          showToast={showToast}
          dirs={dirs}
          canEditStatus={canEditStatus}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}

      {/* Excel татах — зөвхөн хувь хүн */}
      {showExport && (
        <ExcelExportModal
          type="persons"
          totalCount={persons.length}
          currentStatus={status}
          onClose={() => setShowExport(false)}
          showToast={showToast}
        />
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
            <div style={{ position:"relative" }}>
              <Search size={13} style={{ position:"absolute",left:12,top:"50%",
                transform:"translateY(-50%)",color:"rgba(148,163,184,0.4)",pointerEvents:"none" }}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Нэр, и-мэйл хайх..." className="gi"
                style={{ width:240,paddingLeft:36 }}/>
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ height:38,background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,
                padding:"0 14px",fontSize:12,color:"rgba(148,163,184,0.6)",
                outline:"none",cursor:"pointer",fontFamily:"inherit" }}>
              <option value="">Бүх статус</option>
              <option value="pending">Хүлээгдэж</option>
              <option value="active">Идэвхтэй</option>
              <option value="returned">Буцаагдсан</option>
            </select>
            <span style={{ fontSize:12,color:"rgba(148,163,184,0.4)" }}>
              {data.personsLoading ? "..." : `${filtered.length} / ${persons.length} хувь хүн`}
            </span>
          </div>

          {/* Action buttons — Excel татах + Дахин ачаалах */}
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={() => setShowExport(true)}
              style={{ padding:"9px 14px",borderRadius:10,
                background:"rgba(59,130,246,0.08)",
                border:"1px solid rgba(59,130,246,0.22)",
                color:"#60a5fa",cursor:"pointer",
                display:"flex",alignItems:"center",gap:6,
                fontSize:12,fontWeight:600,fontFamily:"inherit" }}>
              <Download size={13}/> Excel татах
            </button>
            <button onClick={() => data.fetchPersons?.(status)}
              style={{ padding:"9px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",
                cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontFamily:"inherit" }}>
              <RefreshCw size={13} style={{ animation:data.personsLoading?"spin 1s linear infinite":undefined }}/>
              Дахин ачаалах
            </button>
          </div>
        </div>

        <div style={{ background:"#0d1526",border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:18,overflow:"hidden" }}>
          {data.personsLoading ? (
            <div style={{ display:"flex",justifyContent:"center",alignItems:"center",padding:56,gap:12 }}>
              <div style={{ width:22,height:22,border:"2px solid rgba(52,211,153,0.3)",
                borderTopColor:"#34d399",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
              <span style={{ fontSize:13,color:"rgba(148,163,184,0.4)" }}>Ачаалж байна...</span>
            </div>
          ) : (
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"rgba(255,255,255,0.015)" }}>
                  <Th h="Нэр"/><Th h="Нийлүүлэгч №"/><Th h="Регистр"/>
                  <Th h="И-мэйл"/><Th h="Утас"/><Th h="Статус"/>
                  <Th h="Огноо"/><Th h=""/>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding:"52px 16px",textAlign:"center",
                      fontSize:13,color:"rgba(148,163,184,0.3)" }}>
                      {persons.length === 0 ? "Бүртгэлтэй хувь хүн байхгүй байна" : "Хайлтын үр дүн олдсонгүй"}
                    </td>
                  </tr>
                ) : filtered.map((p: any) => {
                  const nm = [p.last_name, p.first_name].filter(Boolean).join(" ") || "—";
                  const rowDirLabels = getDirLabels(p.activity_directions ?? [], dirs);
                  return (
                    <tr key={p.id} className="ind-row"
                      style={{ cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.04)" }}
                      onClick={() => openDetail(p)}>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:11 }}>
                          <Avatar person={p} size={34}/>
                          <div>
                            <div style={{ fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)" }}>{nm}</div>
                            {rowDirLabels.length > 0 && (
                              <div style={{ display:"flex",gap:4,marginTop:3,flexWrap:"wrap" }}>
                                {rowDirLabels.slice(0,2).map(label => (
                                  <span key={label} style={{ fontSize:9,padding:"1px 6px",borderRadius:99,
                                    background:"rgba(59,130,246,0.1)",color:"#60a5fa" }}>
                                    {label}
                                  </span>
                                ))}
                                {rowDirLabels.length > 2 && (
                                  <span style={{ fontSize:9,color:"rgba(148,163,184,0.4)" }}>
                                    +{rowDirLabels.length-2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px",fontSize:11,fontFamily:"monospace",
                        color:"rgba(148,163,184,0.5)",letterSpacing:"0.05em" }}>
                        {p.supplier_number||"—"}
                      </td>
                      <td style={{ padding:"12px 16px",fontSize:11,fontFamily:"monospace",
                        color:"rgba(148,163,184,0.45)" }}>
                        {p.register_number||"—"}
                      </td>
                      <td style={{ padding:"12px 16px",fontSize:12,color:"rgba(148,163,184,0.55)" }}>
                        {p.email}
                      </td>
                      <td style={{ padding:"12px 16px",fontSize:12,fontFamily:"monospace",
                        color:"rgba(148,163,184,0.5)" }}>
                        {p.phone||"—"}
                      </td>
                      <td style={{ padding:"12px 16px" }}><Badge status={p.status}/></td>
                      <td style={{ padding:"12px 16px",fontSize:11,color:"rgba(148,163,184,0.4)" }}>
                        {fmtDate(p.created_at)||"—"}
                      </td>
                      <td style={{ padding:"12px 16px" }} onClick={e => e.stopPropagation()}>
                        <button onClick={e => { e.stopPropagation(); openDetail(p); }}
                          style={{ background:"rgba(59,130,246,0.08)",
                            border:"1px solid rgba(59,130,246,0.18)",borderRadius:8,
                            padding:"6px 10px",cursor:"pointer",display:"flex",
                            alignItems:"center",gap:5,fontSize:11,color:"#60a5fa",fontFamily:"inherit" }}>
                          <Eye size={12}/> Харах
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}