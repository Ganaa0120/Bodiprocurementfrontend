"use client";
import { useState } from "react";
import {
  X, AlertCircle, Loader2, CheckCircle2,
  Eye, EyeOff, Lock, ChevronDown, ChevronRight,
} from "lucide-react";
import { API, jsonH } from "../_lib/constants";
import { NAV_PERMS, SUB_PERMS, parsePerms } from "../_lib/permissions";

export function SubAdminModal({
  mode, admin, parentPerms, onClose, onSave,
}: {
  mode: "create" | "edit";
  admin?: any;
  parentPerms: string[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    first_name: admin?.first_name ?? "",
    last_name: admin?.last_name ?? "",
    company_name: admin?.company_name ?? "",
    email: admin?.email ?? "",
    phone: admin?.phone ?? "",
    password: "",
  });
  const [perms, setPerms] = useState<string[]>(parsePerms(admin?.permissions));
  const [showPw, setShowPw] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["individuals"]));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navVisible = (id: string) =>
    perms.includes(`${id}.view`) ||
    (id === "dashboard" && perms.includes("dashboard.view"));

  const toggleNav = (id: string) => {
    if (id === "dashboard") return;
    const viewId = `${id}.view`;
    if (navVisible(id))
      setPerms((p) => p.filter((x) => !x.startsWith(`${id}.`)));
    else setPerms((p) => [...new Set([...p, viewId])]);
  };

  const toggleSub = (subId: string) => {
    setPerms((p) =>
      p.includes(subId) ? p.filter((x) => x !== subId) : [...p, subId]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const finalPerms = perms.filter(
        (p) => parentPerms.includes(p) || p === "dashboard" || p === "dashboard.view"
      );
      if (mode === "create") {
        if (!form.first_name || !form.last_name || !form.email || !form.password) {
          setError("Бүх заавал талбарыг бөглөнө үү");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API}/api/super-admins/create`, {
          method: "POST",
          headers: jsonH(),
          body: JSON.stringify({ ...form, role: "admin", permissions: finalPerms }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      } else {
        const res = await fetch(`${API}/api/super-admins/${admin.id}`, {
          method: "PUT",
          headers: jsonH(),
          body: JSON.stringify({
            first_name: form.first_name,
            last_name: form.last_name,
            company_name: form.company_name,
            phone: form.phone,
            permissions: finalPerms,
          }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message ?? "Алдаа гарлаа");
      }
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", height: 42,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: "0 14px",
    fontSize: 13, color: "rgba(255,255,255,0.85)",
    outline: "none", fontFamily: "inherit", transition: "all 0.2s",
  };
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 600,
    letterSpacing: "0.05em", textTransform: "uppercase",
    color: "rgba(148,163,184,0.5)",
    display: "block", marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 520,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28, padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>
              {mode === "create" ? "Шинэ Брокер" : "Брокер засах"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", marginTop: 2 }}>
              Зөвхөн өөрт байгаа эрхийн хүрээнд олгоно
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: 8, cursor: "pointer",
            color: "rgba(148,163,184,0.5)", display: "flex",
          }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 16px", borderRadius: 12,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            marginBottom: 20,
          }}>
            <AlertCircle size={14} style={{ color: "#f87171" }} />
            <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Овог *</label>
              <input
                value={form.last_name}
                onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
                placeholder="Овог" required style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
            <div>
              <label style={lbl}>Нэр *</label>
              <input
                value={form.first_name}
                onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
                placeholder="Нэр" required style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
          </div>

          <div>
            <label style={lbl}>Компани</label>
            <input
              value={form.company_name}
              onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
              placeholder="Компанийн нэр" style={inp}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>И-мэйл *</label>
              <input
                type="email" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="mail@example.mn" required disabled={mode === "edit"}
                style={{ ...inp, opacity: mode === "edit" ? 0.5 : 1 }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
            <div>
              <label style={lbl}>Утас</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="99001122" style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
          </div>

          {mode === "create" && (
            <div>
              <label style={lbl}>Нууц үг *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" required
                  style={{ ...inp, paddingRight: 45 }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)",
                  }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Lock size={14} style={{ color: "#60a5fa" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                Цэсний эрх тохиргоо
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {NAV_PERMS.filter((n) =>
                n.id !== "dashboard" && n.id !== "sub-admins" &&
                n.id !== "categories" && n.id !== "directions"
              ).map((nav) => {
                const vis = navVisible(nav.id);
                const subs = SUB_PERMS[nav.id] || [];
                const isExpanded = expanded.has(nav.id);
                const activeCount = subs.filter((s) => perms.includes(s.id)).length;
                const availableSubs = subs.filter((s) => parentPerms.includes(s.id));

                return (
                  <div key={nav.id} style={{
                    borderRadius: 12, overflow: "hidden",
                    border: vis ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(255,255,255,0.07)",
                    background: vis ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.02)",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px",
                    }}>
                      <button type="button" onClick={() => toggleNav(nav.id)} style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        cursor: "pointer",
                        background: vis ? "#6366f1" : "rgba(255,255,255,0.05)",
                        border: vis ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {vis && <CheckCircle2 size={13} color="white" />}
                      </button>
                      {nav.icon}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: vis ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.4)",
                        }}>{nav.label}</div>
                        {vis && availableSubs.length > 0 && (
                          <div style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", marginTop: 1 }}>
                            {activeCount}/{availableSubs.length} эрх
                          </div>
                        )}
                      </div>
                      {vis && availableSubs.length > 1 && (
                        <button type="button"
                          onClick={() => setExpanded((prev) => {
                            const n = new Set(prev);
                            n.has(nav.id) ? n.delete(nav.id) : n.add(nav.id);
                            return n;
                          })}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 8, padding: "4px 10px",
                            cursor: "pointer", fontSize: 10,
                            color: "rgba(148,163,184,0.5)",
                            display: "flex", alignItems: "center", gap: 4,
                          }}>
                          {isExpanded ? "Хаах" : "Тохируулах"}
                          {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        </button>
                      )}
                    </div>

                    {vis && isExpanded && availableSubs.length > 1 && (
                      <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        padding: "8px 12px 10px",
                      }}>
                        <div style={{
                          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5,
                        }}>
                          {availableSubs.map((sub) => {
                            const checked = perms.includes(sub.id);
                            const isView = sub.id === `${nav.id}.view`;
                            return (
                              <div key={sub.id}
                                onClick={() => !isView && toggleSub(sub.id)}
                                style={{
                                  display: "flex", alignItems: "flex-start", gap: 10,
                                  padding: "7px 9px", borderRadius: 10,
                                  cursor: isView ? "default" : "pointer",
                                  background: checked ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                                  border: checked ? "1px solid rgba(99,102,241,0.18)" : "1px solid rgba(255,255,255,0.05)",
                                  opacity: isView ? 0.6 : 1,
                                }}>
                                <div style={{
                                  width: 16, height: 16, borderRadius: 4,
                                  flexShrink: 0, marginTop: 1,
                                  background: checked ? "#6366f1" : "rgba(255,255,255,0.05)",
                                  border: checked ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.15)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  {checked && <CheckCircle2 size={10} color="white" />}
                                </div>
                                <div>
                                  <div style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: checked ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)",
                                  }}>{sub.label}</div>
                                  <div style={{
                                    fontSize: 10, color: "rgba(148,163,184,0.35)", marginTop: 1,
                                  }}>{sub.desc}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, height: 46, borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(148,163,184,0.6)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>Болих</button>
            <button type="submit" disabled={loading} style={{
              flex: 2, height: 46, borderRadius: 12,
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              border: "none", color: "white",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, opacity: loading ? 0.7 : 1,
            }}>
              {loading ? (
                <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {loading ? "Хадгалж байна..." : mode === "create" ? "Үүсгэх" : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}