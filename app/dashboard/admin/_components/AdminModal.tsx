"use client";
import { useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type Props = {
  mode: "create" | "edit" | null;
  admin?: any;
  onClose: () => void;
  onSave: () => void;
};

// Nav permissions list
const NAV_PERMS = [
  { id: "dashboard", label: "Хянах самбар" },
  { id: "notifications", label: "Мэдэгдэл" },
  { id: "admins", label: "Админууд" },
  { id: "companies", label: "Компаниуд" },
  { id: "individuals", label: "Хувь хүн" },
  { id: "categories", label: "Ангилалууд" },
  { id: "directions", label: "Үйл ажиллагааны чиглэл" },
  { id: "announcements", label: "Зарлалууд" },
];

export function AdminModal({ mode, admin, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    company_name: admin?.company_name ?? "",
    first_name: admin?.first_name ?? "",
    last_name: admin?.last_name ?? "",
    phone: admin?.phone ?? "",
    email: admin?.email ?? "",
    password: "",
    role: admin?.role ?? "admin",
    status: admin?.status ?? "active",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [permissions, setPermissions] = useState<string[]>(() => {
    if (!admin?.permissions) return ["dashboard", "companies", "individuals"];
    try {
      const p = admin.permissions;
      if (Array.isArray(p)) return p;
      if (typeof p === "string") {
        const parsed = JSON.parse(p);
        return Array.isArray(parsed) ? parsed : ["dashboard", "companies", "individuals"];
      }
      return ["dashboard", "companies", "individuals"];
    } catch {
      return ["dashboard", "companies", "individuals"];
    }
  });

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const h = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      
      const payload = {
        ...form,
        permissions: form.role === "super_admin" ? null : JSON.stringify(permissions),
      };

      if (mode === "create") {
        if (!form.first_name || !form.last_name || !form.email || !form.password) {
          setError("Бүх заавал талбарыг бөглөнө үү");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API}/api/super-admins/create`, {
          method: "POST",
          headers: h,
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message);
      } else {
        const res = await fetch(`${API}/api/super-admins/${admin.id}`, {
          method: "PUT",
          headers: h,
          body: JSON.stringify(payload),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message);
      }
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const inp: React.CSSProperties = {
    width: "100%",
    height: 42,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "0 14px",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
  };
  
  const lbl: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(148,163,184,0.6)",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          padding: 28,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <ShieldCheck size={22} style={{ color: "#60a5fa" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {mode === "create" ? "Шинэ Админ үүсгэх" : "Админ мэдээлэл засах"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.5)",
                marginTop: 2,
              }}
            >
              {mode === "create" ? "Бүх заавал талбарыг бөглөнө үү" : "Мэдээллийг шинэчилнэ үү"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 8,
              cursor: "pointer",
              color: "rgba(148,163,184,0.5)",
              display: "flex",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(148,163,184,0.5)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 12,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: 20,
            }}
          >
            <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Овог *</label>
              <input
                value={form.last_name}
                onChange={setField("last_name")}
                placeholder="Овог"
                required
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
            <div>
              <label style={lbl}>Нэр *</label>
              <input
                value={form.first_name}
                onChange={setField("first_name")}
                placeholder="Нэр"
                required
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
          </div>

          <div>
            <label style={lbl}>Компанийн нэр</label>
            <input
              value={form.company_name}
              onChange={setField("company_name")}
              placeholder="Компани"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>И-мэйл *</label>
              <input
                type="email"
                value={form.email}
                onChange={setField("email")}
                placeholder="mail@company.mn"
                required
                disabled={mode === "edit"}
                style={{
                  ...inp,
                  opacity: mode === "edit" ? 0.5 : 1,
                  cursor: mode === "edit" ? "not-allowed" : "text",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
            <div>
              <label style={lbl}>Утас</label>
              <input
                value={form.phone}
                onChange={setField("phone")}
                placeholder="99001122"
                style={inp}
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
                  onChange={setField("password")}
                  placeholder="••••••••"
                  required
                  style={{ ...inp, paddingRight: 45 }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(148,163,184,0.5)",
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Эрх</label>
              <select
                value={form.role}
                onChange={setField("role")}
                style={{ ...inp, cursor: "pointer" }}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Статус</label>
              <select
                value={form.status}
                onChange={setField("status")}
                style={{ ...inp, cursor: "pointer" }}
              >
                <option value="active">Идэвхтэй</option>
                <option value="inactive">Идэвхгүй</option>
              </select>
            </div>
          </div>

          {form.role === "admin" && (
            <div>
              <label style={lbl}>Харах цэсүүд</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 8,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                }}
              >
                {NAV_PERMS.map(({ id, label }) => {
                  const checked = permissions.includes(id);
                  return (
                    <label
                      key={id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                        padding: "6px 8px",
                        borderRadius: 8,
                        transition: "all 0.15s",
                        background: checked ? "rgba(99,102,241,0.08)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!checked) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (!checked) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div
                        onClick={() => togglePermission(id)}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          flexShrink: 0,
                          border: `1.5px solid ${checked ? "#6366f1" : "rgba(255,255,255,0.2)"}`,
                          background: checked ? "#6366f1" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s",
                        }}
                      >
                        {checked && <CheckCircle2 size={12} color="white" />}
                      </div>
                      <span style={{ fontSize: 12, color: checked ? "#a5b4fc" : "rgba(148,163,184,0.7)" }}>
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(148,163,184,0.4)",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {permissions.length} / {NAV_PERMS.length} цэс сонгогдсон
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.6)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "rgba(148,163,184,0.6)";
              }}
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                height: 46,
                borderRadius: 12,
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(99,102,241,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  {mode === "create" ? "Үүсгэх" : "Хадгалах"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}