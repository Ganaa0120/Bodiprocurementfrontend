"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Plus, Trash2, Loader2 } from "lucide-react";
import { API, getToken } from "./constants";
import { CategoryModal } from "./CategoryModal";
import { CategoryRow } from "./CategoryRow";
import type { Category } from "./types";

export function CategoriesTab({ isSuperAdmin, showToast }: {
  isSuperAdmin: boolean;
  showToast: (msg: string, ok?: boolean) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [modalMode,  setModalMode]  = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [confirmDel, setConfirmDel] = useState<Category | null>(null);
  const [deleting,   setDeleting]   = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.categories ?? []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/categories/${confirmDel.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Алдаа гарлаа");
      showToast(`${confirmDel.category_name} устгагдлаа`);
      setConfirmDel(null);
      fetchCategories();
    } catch (e: any) { showToast(e.message, false); }
    finally { setDeleting(false); }
  };

  const countAll = (cats: Category[]): number =>
    cats.reduce((s, c) => s + 1 + countAll(c.children ?? []), 0);

  return (
    <>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .tr{border-bottom:1px solid rgba(255,255,255,0.04);transition:background .12s;}
        .tr:hover{background:rgba(255,255,255,0.025);}
        .tr:last-child{border-bottom:none;}
      `}</style>

      {(modalMode === "create" || modalMode === "edit") && (
        <CategoryModal mode={modalMode} category={editTarget} categories={categories}
          onClose={() => { setModalMode(null); setEditTarget(null); }}
          onSave={() => { setModalMode(null); setEditTarget(null); fetchCategories(); }}
          showToast={showToast}/>
      )}

      {confirmDel && (
        <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.82)",backdropFilter:"blur(10px)" }}
          onClick={() => setConfirmDel(null)}>
          <div style={{ width:"100%",maxWidth:380,background:"#0d1526",border:"1px solid rgba(239,68,68,0.2)",borderRadius:20,padding:28,boxShadow:"0 32px 80px rgba(0,0,0,0.7)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:52,height:52,borderRadius:16,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px" }}>
              <Trash2 size={22} style={{ color:"#ef4444" }}/>
            </div>
            <div style={{ textAlign:"center",marginBottom:22 }}>
              <p style={{ fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.9)",margin:"0 0 8px" }}>Устгах уу?</p>
              <p style={{ fontSize:13,color:"rgba(148,163,184,0.6)",margin:"0 0 6px" }}>
                <span style={{ color:"rgba(255,255,255,0.8)",fontWeight:600 }}>{confirmDel.category_number} — {confirmDel.category_name}</span>
              </p>
              <p style={{ fontSize:11,color:"rgba(239,68,68,0.6)",margin:0 }}>Дэд категоритой бол устгах боломжгүй</p>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex:1,height:42,borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>Болих</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex:1,height:42,borderRadius:10,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:deleting?0.6:1 }}>
                {deleting ? <Loader2 size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Trash2 size={13}/>}
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-in" style={{ display:"flex",flexDirection:"column",gap:16 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontSize:12,color:"rgba(148,163,184,0.4)" }}>
            {loading ? "..." : countAll(categories) + " категори"}
          </span>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={fetchCategories}
              style={{ padding:"9px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"rgba(148,163,184,0.6)",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontFamily:"inherit" }}>
              <RefreshCw size={13} style={{ animation:loading?"spin 1s linear infinite":undefined }}/>
              Дахин ачаалах
            </button>
            {isSuperAdmin && (
              <button onClick={() => { setEditTarget(null); setModalMode("create"); }}
                style={{ padding:"9px 16px",borderRadius:10,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",border:"none",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6 }}>
                <Plus size={14}/> Шинэ ангилал нэмэх
              </button>
            )}
          </div>
        </div>

        <div style={{ background:"#0d1526",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,overflow:"hidden" }}>
          {loading ? (
            <div style={{ display:"flex",justifyContent:"center",alignItems:"center",padding:56,gap:12 }}>
              <div style={{ width:22,height:22,border:"2px solid rgba(52,211,153,0.3)",borderTopColor:"#34d399",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
              <span style={{ fontSize:13,color:"rgba(148,163,184,0.4)" }}>Ачаалж байна...</span>
            </div>
          ) : (
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["Нэр","Дугаар","Статус","Огноо",""].map((h,i) => (
                    <th key={i} style={{ textAlign:"left",padding:"10px 16px",fontSize:10,fontWeight:700,color:"rgba(148,163,184,0.28)",textTransform:"uppercase" as const,letterSpacing:"0.09em",borderBottom:"1px solid rgba(255,255,255,0.05)",whiteSpace:"nowrap" as const }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding:"48px 16px",textAlign:"center",fontSize:13,color:"rgba(148,163,184,0.3)" }}>Категори байхгүй байна</td></tr>
                ) : categories.map(cat => (
                  <CategoryRow key={cat.id} cat={cat} depth={0}
                    isSuperAdmin={isSuperAdmin}
                    onEdit={c => { setEditTarget(c); setModalMode("edit"); }}
                    onDelete={c => setConfirmDel(c)}
                    onRefresh={fetchCategories}
                    showToast={showToast}/>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}