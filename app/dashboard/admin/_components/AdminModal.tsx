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
    if (!admin?.permissions) return ["dashboard", "individuals", "companies"];
    try {
      const p = admin.permissions;
      // DB-с string болон array хоёуланг handle хийнэ
      if (Array.isArray(p)) return p;
      if (typeof p === "string") {
        const parsed = JSON.parse(p);
        return Array.isArray(parsed)
          ? parsed
          : ["dashboard", "individuals", "companies"];
      }
      return ["dashboard", "individuals", "companies"];
    } catch {
      return ["dashboard", "individuals", "companies"];
    }
  });

  const NAV_PERMS = [
    { id: "dashboard", label: "Хянах самбар" },
    { id: "notifications", label: "Мэдэгдэл" },
    { id: "admins", label: "Админууд" },
    { id: "companies", label: "Компаниуд" },
    { id: "individuals", label: "Хувь хүн" },
  ];

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
      if (mode === "create") {
        if (
          !form.first_name ||
          !form.last_name ||
          !form.email ||
          !form.password
        ) {
          setError("Бүх заавал талбарыг бөглөнө үү");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API}/api/super-admins/create`, {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            ...form,
            permissions: JSON.stringify(permissions), // ← НЭМНЭ
          }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message);
      } else {
        const res = await fetch(`${API}/api/super-admins/${admin.id}`, {
          method: "PUT",
          headers: h,
          body: JSON.stringify({
            company_name: form.company_name,
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            role: form.role,
            status: form.status,
            permissions: JSON.stringify(permissions), // ← НЭМНЭ
          }),
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

  const inp: React.CSSProperties = {
    width: "100%",
    height: 42,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "0 12px",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color .15s",
    boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(148,163,184,0.7)",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          background: "#0d1526",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          padding: 32,
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)",
          animation: "modalIn .25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background:
                "linear-gradient(135deg,rgba(59,130,246,0.2),rgba(99,102,241,0.2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <ShieldCheck size={20} style={{ color: "#60a5fa" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {mode === "create" ? "Шинэ Админ үүсгэх" : "Админ мэдээлэл засах"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.6)",
                marginTop: 2,
              }}
            >
              {mode === "create"
                ? "Бүх заавал талбарыг бөглөнө үү"
                : "Мэдээллийг шинэчилнэ үү"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: 8,
              cursor: "pointer",
              color: "rgba(148,163,184,0.6)",
              display: "flex",
              transition: "all .15s",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              marginBottom: 20,
            }}
          >
            <AlertCircle
              size={14}
              style={{ color: "#f87171", flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: "#fca5a5" }}>{error}</span>
          </div>
        )}

        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Овог *</label>
              <input
                value={form.last_name}
                onChange={set("last_name")}
                placeholder="Овог"
                required
                style={inp}
                onFocus={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(96,165,250,0.5)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              />
            </div>
            <div>
              <label style={lbl}>Нэр *</label>
              <input
                value={form.first_name}
                onChange={set("first_name")}
                placeholder="Нэр"
                required
                style={inp}
                onFocus={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(96,165,250,0.5)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              />
            </div>
          </div>

          <div>
            <label style={lbl}>Компанийн нэр</label>
            <input
              value={form.company_name}
              onChange={set("company_name")}
              placeholder="Компани"
              style={inp}
              onFocus={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "rgba(96,165,250,0.5)")
              }
              onBlur={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.08)")
              }
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>И-мэйл *</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="mail@company.mn"
                required
                disabled={mode === "edit"}
                style={{
                  ...inp,
                  opacity: mode === "edit" ? 0.4 : 1,
                  cursor: mode === "edit" ? "not-allowed" : "text",
                }}
                onFocus={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(96,165,250,0.5)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
              />
            </div>
            <div>
              <label style={lbl}>Утас</label>
              <input
                value={form.phone}
                onChange={set("phone")}
                placeholder="99001122"
                style={inp}
                onFocus={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(96,165,250,0.5)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.08)")
                }
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
                  onChange={set("password")}
                  placeholder="••••••••"
                  required
                  style={{ ...inp, paddingRight: 42 }}
                  onFocus={(e) =>
                    ((e.target as HTMLElement).style.borderColor =
                      "rgba(96,165,250,0.5)")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.08)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(148,163,184,0.5)",
                    display: "flex",
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label style={lbl}>Эрх</label>
              <select
                value={form.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setForm((p) => ({ ...p, role: newRole }));
                  // role super_admin болоход permissions хадгална, admin болоход default болгохгүй
                }}
                style={{ ...inp, cursor: "pointer", appearance: "none" }}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Статус</label>
              <select
                value={form.status}
                onChange={set("status")}
                style={{ ...inp, cursor: "pointer", appearance: "none" }}
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
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
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
                        gap: 8,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setPermissions((p) =>
                          p.includes(id)
                            ? p.filter((x) => x !== id)
                            : [...p, id],
                        )
                      }
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          flexShrink: 0,
                          border: `1px solid ${checked ? "#3b82f6" : "rgba(255,255,255,0.15)"}`,
                          background: checked ? "#3b82f6" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all .15s",
                        }}
                      >
                        {checked && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        style={{ fontSize: 12, color: "rgba(148,163,184,0.8)" }}
                      >
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.7)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                border: "none",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />{" "}
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
