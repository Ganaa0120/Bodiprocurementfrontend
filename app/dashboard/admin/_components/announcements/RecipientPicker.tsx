"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Loader2,
  ChevronDown,
  Users,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { API, authH } from "./constants";

type DirGroup = { main_id: number; sub_ids: number[] };

export function RecipientPicker({
  form,
  setForm,
  directions,
  accentColor,
  optional,
}: {
  form: any;
  setForm: any;
  directions: any[];
  accentColor: string;
  optional?: boolean;
}) {
  const [persons, setPersons] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dirF, setDirF] = useState("");
  const [permF, setPermF] = useState(""); // ⭐ ШИНЭ — тусгай зөвшөөрлийн filter
  const [permOpen, setPermOpen] = useState(false); // ⭐ ШИНЭ
  const [permSearch, setPermSearch] = useState(""); // ⭐ ШИНЭ
  const [permTypes, setPermTypes] = useState<any[]>([]);
  const ac = accentColor;

  useEffect(() => {
    setLoading(true);
    const url =
      form.recipient_type === "individual"
        ? `${API}/api/persons?limit=500`
        : `${API}/api/organizations?limit=500`;
    fetch(url, { headers: authH() })
      .then((r) => r.json())
      .then((d) => {
        if (form.recipient_type === "individual")
          setPersons(d.persons ?? d.data ?? []);
        else setCompanies(d.organizations ?? d.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    setForm((p: any) => ({ ...p, recipient_ids: [] }));
    setSearch("");
    setDirF("");
    setPermF("");
    setPermOpen(false);
    setPermSearch("");
  }, [form.recipient_type]);

  /* ── ⭐ ШИНЭ — Тусгай зөвшөөрлийн master types-ийг татах (нэг удаа) ── */
  useEffect(() => {
    fetch(`${API}/api/special-permission-types`, { headers: authH() })
      .then((r) => r.json())
      .then((d) => {
        const list = (d.types || []).filter((t: any) => t.is_active);
        setPermTypes(list);
      })
      .catch(() => {});
  }, []);

  /* ── Тусгай зөвшөөрлийн төрлүүдийг компаниудаас цуглуулна ── */
  const permissionTypes = useMemo(() => {
    if (form.recipient_type !== "company") return [];
    return permTypes
      .map((t: any) => t.label?.trim())
      .filter(Boolean) as string[];
  }, [permTypes, form.recipient_type]);

  const filteredPermTypes = useMemo(() => {
    if (!permSearch.trim()) return permissionTypes;
    const q = permSearch.toLowerCase();
    return permissionTypes.filter((l) => l.toLowerCase().includes(q));
  }, [permissionTypes, permSearch]);

  /* ── Escape товч даравал dropdown хаах ── */
  useEffect(() => {
    if (!permOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPermOpen(false);
        setPermSearch("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [permOpen]);

  /* ── activity_directions-аас label жагсаалт авах ── */
  const getDirLabels = (rawDirs: any): string[] => {
    if (!Array.isArray(rawDirs) || rawDirs.length === 0) return [];
    if (typeof rawDirs[0] === "object" && rawDirs[0]?.main_id !== undefined) {
      return (rawDirs as DirGroup[])
        .map((g) => {
          const main = directions.find(
            (d: any) => Number(d.id) === Number(g.main_id),
          );
          return main?.label || `#${g.main_id}`;
        })
        .filter(Boolean);
    }
    if (typeof rawDirs[0] === "string") return rawDirs as string[];
    if (typeof rawDirs[0] === "number") {
      return (rawDirs as number[]).map((id) => {
        const main = directions.find((d: any) => Number(d.id) === Number(id));
        return main?.label || `#${id}`;
      });
    }
    return [];
  };

  const userMatchesDir = (item: any, dirLabel: string): boolean => {
    if (!dirLabel) return true;
    const userDirs = item.activity_directions;

    // ⚠️ DEBUG — дараа устга
    console.log("🔍 userMatchesDir:", {
      company: item.company_name || item.email,
      dirLabel,
      userDirs,
      userDirsType: Array.isArray(userDirs) ? typeof userDirs[0] : "not-array",
      directionsCount: directions.length,
      sampleDirection: directions[0],
    });

    if (!Array.isArray(userDirs) || userDirs.length === 0) return false;
    if (typeof userDirs[0] === "string") return userDirs.includes(dirLabel);
    if (typeof userDirs[0] === "object" && userDirs[0]?.main_id !== undefined) {
      const matchedMain = directions.find((d: any) => d.label === dirLabel);
      if (!matchedMain) {
        console.log("❌ matchedMain олдсонгүй:", dirLabel);
        return false;
      }
      const result = userDirs.some(
        (g: DirGroup) => Number(g.main_id) === Number(matchedMain.id),
      );
      console.log("✓ matchedMain:", matchedMain, "→ matches:", result);
      return result;
    }
    if (typeof userDirs[0] === "number") {
      const matchedMain = directions.find((d: any) => d.label === dirLabel);
      return matchedMain ? userDirs.includes(matchedMain.id) : false;
    }
    return false;
  };

  /* ── Тусгай зөвшөөрлийн filter ── */
  const matchesPermission = (item: any, permLabel: string): boolean => {
    if (!permLabel) return true;
    if (form.recipient_type !== "company") return true;
    if (permLabel === "__has_any__") return !!item.has_special_permission;
    if (!Array.isArray(item.special_permissions)) return false;
    return item.special_permissions.some(
      (sp: any) => sp?.type_label?.trim() === permLabel,
    );
  };

  /* ── Тусгай зөвшөөрлийн хүчинтэй огноо тооцоолох ── */
  const getPermissionInfo = (
    item: any,
    permLabel: string,
  ): {
    date: string;
    daysLeft: number;
    status: "valid" | "soon" | "expired";
  } | null => {
    let expiryStr: string | null = null;
    if (
      permLabel &&
      permLabel !== "__has_any__" &&
      Array.isArray(item.special_permissions)
    ) {
      const sp = item.special_permissions.find(
        (s: any) => s?.type_label?.trim() === permLabel,
      );
      expiryStr = sp?.expiry ?? null;
    } else if (
      Array.isArray(item.special_permissions) &&
      item.special_permissions.length > 0
    ) {
      // Хамгийн ойрхон дуусах огноог авна
      const expiries = item.special_permissions
        .map((s: any) => s?.expiry)
        .filter(Boolean)
        .sort();
      expiryStr = expiries[0] ?? null;
    }
    if (!expiryStr && item.special_permission_expiry) {
      expiryStr = item.special_permission_expiry;
    }
    if (!expiryStr) return null;

    const exp = new Date(expiryStr);
    if (isNaN(exp.getTime())) return null;
    const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
    return {
      date: exp.toLocaleDateString("mn-MN"),
      daysLeft: days,
      status: days < 0 ? "expired" : days <= 30 ? "soon" : "valid",
    };
  };

  const items = form.recipient_type === "individual" ? persons : companies;
  const getName = (x: any) =>
    form.recipient_type === "individual"
      ? `${x.last_name ?? ""} ${x.first_name ?? ""}`.trim() || x.email
      : x.company_name || x.email;

  const filtered = items.filter((x) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        getName(x).toLowerCase().includes(q) ||
        x.email?.toLowerCase().includes(q)) &&
      userMatchesDir(x, dirF) &&
      matchesPermission(x, permF)
    );
  });

  const toggle = (id: string) =>
    setForm((p: any) => ({
      ...p,
      recipient_ids: p.recipient_ids.includes(id)
        ? p.recipient_ids.filter((x: string) => x !== id)
        : [...p.recipient_ids, id],
    }));

  const toggleAll = () => {
    const ids = filtered.map((x) => x.id);
    setForm((p: any) => ({
      ...p,
      recipient_ids: ids.every((id) => p.recipient_ids.includes(id))
        ? p.recipient_ids.filter((id: string) => !ids.includes(id))
        : [...new Set([...p.recipient_ids, ...ids])],
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Recipient type tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {[
          { v: "individual", l: "Хувь хүн", I: Users },
          { v: "company", l: "Байгууллага", I: Building2 },
        ].map(({ v, l, I }) => (
          <button
            key={v}
            type="button"
            onClick={() =>
              setForm((p: any) => ({
                ...p,
                recipient_type: v,
                recipient_ids: [],
              }))
            }
            style={{
              height: 42,
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 12,
              border:
                form.recipient_type === v
                  ? `1px solid ${ac}60`
                  : "1px solid rgba(255,255,255,0.08)",
              background:
                form.recipient_type === v
                  ? `${ac}15`
                  : "rgba(255,255,255,0.04)",
              color: form.recipient_type === v ? ac : "rgba(148,163,184,0.6)",
            }}
          >
            <I size={13} />
            {l}
          </button>
        ))}
      </div>

      {/* Activity direction filter */}
      <div style={{ position: "relative" }}>
        <select
          value={dirF}
          onChange={(e) => setDirF(e.target.value)}
          style={{
            width: "100%",
            height: 38,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 9,
            padding: "0 30px 0 12px",
            fontSize: 12,
            color: "rgba(255,255,255,0.75)",
            outline: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            appearance: "none" as const,
          }}
        >
          <option value="" className="bg-slate-800 text-white">
            — Бүх үйл ажиллагааны чиглэл —
          </option>
          {directions.map((d) => (
            <option
              key={d.id}
              value={d.label}
              className="bg-slate-800 text-white"
            >
              {d.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(148,163,184,0.4)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ⭐ Тусгай зөвшөөрлийн хайлттай custom dropdown */}
      {form.recipient_type === "company" && (
        <div style={{ position: "relative" }} data-perm-dropdown>
          <button
            type="button"
            onClick={() => setPermOpen((o) => !o)}
            style={{
              width: "100%",
              height: 38,
              background: permF !== "" ? `${ac}10` : "rgba(255,255,255,0.04)",
              border:
                permF !== ""
                  ? `1px solid ${ac}40`
                  : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 9,
              padding: "0 30px 0 32px",
              fontSize: 12,
              color: permF !== "" ? ac : "rgba(255,255,255,0.75)",
              outline: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: permF !== "" ? 600 : 400,
              display: "flex",
              alignItems: "center",
              textAlign: "left",
              position: "relative",
            }}
          >
            <ShieldCheck
              size={13}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                color: permF !== "" ? ac : "rgba(148,163,184,0.4)",
              }}
            />
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {permF === ""
                ? "— Тусгай зөвшөөрлөөр шүүх —"
                : permF === "__has_any__"
                  ? "✓ Зөвшөөрөлтэй бүх компани"
                  : permF}
            </span>
            <ChevronDown
              size={13}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: `translateY(-50%) ${permOpen ? "rotate(180deg)" : ""}`,
                color: "rgba(148,163,184,0.4)",
                transition: "transform 0.15s",
              }}
            />
          </button>

          {permOpen && (
            <div
              style={{
                position: "absolute",
                top: 42,
                left: 0,
                right: 0,
                zIndex: 50,
                background: "#1e293b",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                maxHeight: 320,
              }}
            >
              {/* Хайлт */}
              <div
                style={{
                  padding: 8,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "#0f172a",
                }}
              >
                <input
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder="🔍 Зөвшөөрөл хайх..."
                  autoFocus
                  style={{
                    width: "100%",
                    height: 32,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.85)",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Сонголтууд */}
              <div style={{ overflowY: "auto", flex: 1 }}>
                {/* Үндсэн 2 сонголт */}
                {!permSearch.trim() && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setPermF("");
                        setPermOpen(false);
                        setPermSearch("");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: permF === "" ? `${ac}15` : "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        color: permF === "" ? ac : "rgba(255,255,255,0.75)",
                        textAlign: "left",
                        fontFamily: "inherit",
                        fontWeight: permF === "" ? 600 : 400,
                      }}
                    >
                      — Бүх компани —
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPermF("__has_any__");
                        setPermOpen(false);
                        setPermSearch("");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background:
                          permF === "__has_any__" ? `${ac}15` : "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        color:
                          permF === "__has_any__"
                            ? ac
                            : "rgba(255,255,255,0.75)",
                        textAlign: "left",
                        fontFamily: "inherit",
                        fontWeight: permF === "__has_any__" ? 600 : 400,
                      }}
                    >
                      ✓ Зөвшөөрөлтэй бүх компани
                    </button>
                    {filteredPermTypes.length > 0 && (
                      <div
                        style={{
                          padding: "6px 14px",
                          fontSize: 9,
                          fontWeight: 700,
                          color: "rgba(148,163,184,0.5)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          background: "rgba(255,255,255,0.02)",
                          borderTop: "1px solid rgba(255,255,255,0.04)",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        Тусгай зөвшөөрлийн төрлүүд ({filteredPermTypes.length})
                      </div>
                    )}
                  </>
                )}

                {/* Шүүгдсэн төрлүүд */}
                {filteredPermTypes.length === 0 ? (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      fontSize: 12,
                      color: "rgba(148,163,184,0.4)",
                    }}
                  >
                    {permSearch
                      ? `"${permSearch}" хайлтад тохирох олдсонгүй`
                      : "Зөвшөөрлийн төрөл байхгүй"}
                  </div>
                ) : (
                  filteredPermTypes.map((label) => {
                    const selected = permF === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setPermF(label);
                          setPermOpen(false);
                          setPermSearch("");
                        }}
                        title={label}
                        style={{
                          width: "100%",
                          padding: "9px 14px",
                          background: selected ? `${ac}15` : "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 12,
                          color: selected ? ac : "rgba(255,255,255,0.75)",
                          textAlign: "left",
                          fontFamily: "inherit",
                          fontWeight: selected ? 600 : 400,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                        }}
                        onMouseEnter={(e) => {
                          if (!selected)
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          if (!selected)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {selected && (
                          <CheckCircle2
                            size={12}
                            style={{ flexShrink: 0, color: ac }}
                          />
                        )}
                        <span
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 11,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 12,
            color: "rgba(148,163,184,0.3)",
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            form.recipient_type === "individual"
              ? "Нэр, и-мэйлээр хайх..."
              : "Байгууллагын нэр хайх..."
          }
          style={{
            width: "100%",
            height: 38,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 9,
            padding: "0 12px 0 34px",
            fontSize: 12,
            color: "rgba(255,255,255,0.8)",
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={(e) =>
            ((e.target as HTMLElement).style.borderColor = `${ac}60`)
          }
          onBlur={(e) =>
            ((e.target as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.08)")
          }
        />
      </div>

      {/* Count + Select all */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(148,163,184,0.4)" }}>
          {loading ? "Ачаалж байна..." : `${filtered.length} / ${items.length}`}
          {form.recipient_ids.length > 0 && (
            <>
              {" "}
              ·{" "}
              <span style={{ color: ac, fontWeight: 600 }}>
                {form.recipient_ids.length} сонгогдсон
              </span>
            </>
          )}
        </span>
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            style={{
              fontSize: 11,
              background: "none",
              border: "none",
              color: `${ac}bb`,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {filtered.every((x) => form.recipient_ids.includes(x.id))
              ? "Бүгдийг арилгах"
              : "Бүгдийг сонгох"}
          </button>
        )}
      </div>

      {/* List */}
      <div
        style={{
          maxHeight: 260,
          overflowY: "auto",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <Loader2
              size={16}
              style={{ color: ac, animation: "spin 0.8s linear infinite" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              fontSize: 12,
              color: "rgba(148,163,184,0.3)",
            }}
          >
            {permF !== ""
              ? "Тохирох зөвшөөрөлтэй компани олдсонгүй"
              : optional
                ? "Сонгоогүй бол бүх нийлүүлэгчид явна"
                : "Тохирох бүртгэл олдсонгүй"}
          </div>
        ) : (
          filtered.map((item) => {
            const checked = form.recipient_ids.includes(item.id);
            const dirLabels = getDirLabels(item.activity_directions);
            // ⭐ ШИНЭ — Permission info зөвхөн компанийн үед
            const permInfo =
              form.recipient_type === "company" && permF !== "" // ⭐ filter байгаа үед л
                ? getPermissionInfo(item, permF)
                : null;

            const permBg =
              permInfo?.status === "expired"
                ? "rgba(239,68,68,0.12)"
                : permInfo?.status === "soon"
                  ? "rgba(245,158,11,0.12)"
                  : "rgba(16,185,129,0.12)";
            const permColor =
              permInfo?.status === "expired"
                ? "#f87171"
                : permInfo?.status === "soon"
                  ? "#fbbf24"
                  : "#34d399";
            const permBorder =
              permInfo?.status === "expired"
                ? "rgba(239,68,68,0.25)"
                : permInfo?.status === "soon"
                  ? "rgba(245,158,11,0.25)"
                  : "rgba(16,185,129,0.25)";

            return (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: checked ? `${ac}10` : "transparent",
                  transition: "background .1s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    flexShrink: 0,
                    background: checked ? ac : "rgba(255,255,255,0.04)",
                    border: checked
                      ? `1px solid ${ac}`
                      : "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {checked && <CheckCircle2 size={11} color="white" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.85)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getName(item)}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(148,163,184,0.35)",
                      display: "flex",
                      gap: 5,
                      flexWrap: "wrap",
                      marginTop: 3,
                      alignItems: "center",
                    }}
                  >
                    <span>{item.email}</span>
                    {dirLabels.slice(0, 2).map((label, i) => (
                      <span
                        key={`${item.id}-dir-${i}`}
                        style={{
                          padding: "0 5px",
                          borderRadius: 99,
                          background: `${ac}15`,
                          color: ac,
                          fontSize: 9,
                        }}
                      >
                        {label}
                      </span>
                    ))}
                    {dirLabels.length > 2 && (
                      <span
                        style={{
                          fontSize: 9,
                          color: "rgba(148,163,184,0.4)",
                        }}
                      >
                        +{dirLabels.length - 2}
                      </span>
                    )}

                    {/* ⭐ ШИНЭ — Тусгай зөвшөөрлийн badge */}
                    {permInfo && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          padding: "1px 7px",
                          borderRadius: 99,
                          background: permBg,
                          color: permColor,
                          border: `1px solid ${permBorder}`,
                          fontSize: 9,
                          fontWeight: 600,
                        }}
                      >
                        {permInfo.status === "expired" ? (
                          <>
                            <AlertTriangle size={9} />
                            Хугацаа дууссан
                          </>
                        ) : permInfo.status === "soon" ? (
                          <>
                            <Calendar size={9} />
                            {permInfo.daysLeft} хоног үлдсэн
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={9} />
                            {permInfo.date} хүртэл
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Optional hint */}
      {optional && form.recipient_ids.length === 0 && items.length > 0 && (
        <div
          style={{
            fontSize: 11,
            color: "rgba(148,163,184,0.35)",
            textAlign: "center",
            padding: "6px 10px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          🌐 Хэн ч сонгоогүй → бүх нийлүүлэгчид илгээгдэнэ
        </div>
      )}
    </div>
  );
}
