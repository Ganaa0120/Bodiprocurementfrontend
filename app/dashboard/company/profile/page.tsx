"use client";
import { useEffect, useState } from "react";
import {
  Loader2,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  CreditCard,
  X,
  Check,
} from "lucide-react";
import {
  API,
  BLANK,
  BLANK_OWNER,
  BLANK_FINAL,
  AIMAG,
} from "./_components/constants";
import { HeroCard, Alert } from "./_components/HeroCard";
import { FInput, FSelect, RadioGroup } from "./_components/FormFields";
import { Section, DocUpload } from "./_components/Section";
import { OwnersSection, FinalOwnersSection } from "./_components/OwnersSection";

function buildForm(u: any) {
  return {
    register_number: u.register_number || "",
    state_registry_number: u.state_registry_number || "",
    company_name: u.company_name || "",
    company_name_en: u.company_name_en || "",
    company_type: u.company_type || "ХХК",
    established_date: u.established_date?.slice(0, 10) || "",
    is_vat_payer: u.is_vat_payer || false,
    is_iso_certified: u.is_iso_certified || false,
    employee_count: u.employee_count?.toString() || "",
    has_special_permission: u.has_special_permission || false,
    special_permission_number: u.special_permission_number || "",
    special_permission_expiry: u.special_permission_expiry?.slice(0, 10) || "",
    aimag_niislel: u.aimag_niislel || "",
    sum_duureg: u.sum_duureg || "",
    bag_horoo: u.bag_horoo || "",
    address: u.address || "",
    bank_name: u.bank_name || "",
    bank_account_number: u.bank_account_number || "",
    vat_number: u.vat_number || "",
    swift_code: u.swift_code || "",
    iban: u.iban || "",
    currency: u.currency || "MNT",
    phone: u.phone || "",
    activity_description: u.activity_description || "",
    supply_direction: u.supply_direction || "",
  };
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [dirs, setDirs] = useState<{ id: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selDirs, setSelDirs] = useState<number[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [form, setForm] = useState<any>(BLANK);
  const [snapshot, setSnapshot] = useState<any>(BLANK);
  const [owners, setOwners] = useState<any[]>([{ ...BLANK_OWNER }]);
  const [ownerSnap, setOwnerSnap] = useState<any[]>([{ ...BLANK_OWNER }]);
  const [finalOwners, setFinalOwners] = useState<any[]>([{ ...BLANK_FINAL }]);
  const [finalOwnerSnap, setFinalOwnerSnap] = useState<any[]>([
    { ...BLANK_FINAL },
  ]);

  useEffect(() => {
    fetch(`${API}/api/persons/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDirs(d.directions || []);
      })
      .catch(() => {});

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/api/organizations/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && (d.organization || d.user)) {
          const u = d.organization || d.user;
          setProfile(u);

          const f = buildForm(u);
          setForm(f);
          setSnapshot(f);
          setSelDirs(u.activity_directions || []);

          const lo = u.beneficial_owners?.length
            ? u.beneficial_owners
            : [{ ...BLANK_OWNER }];
          const lf = u.final_beneficial_owners?.length
            ? u.final_beneficial_owners
            : [{ ...BLANK_FINAL }];
          setOwners(lo);
          setOwnerSnap(lo);
          setFinalOwners(lf);
          setFinalOwnerSnap(lf);

          const p: Record<string, string> = {};
          if (u.company_logo_url) p.company_logo = u.company_logo_url;
          if (u.doc_state_registry_url)
            p.doc_state_registry = u.doc_state_registry_url;
          if (u.doc_vat_certificate_url)
            p.doc_vat_certificate = u.doc_vat_certificate_url;
          if (u.doc_special_permission_url)
            p.doc_special_permission = u.doc_special_permission_url;
          if (u.doc_contract_url) p.doc_contract = u.doc_contract_url;
          if (u.doc_company_intro_url)
            p.doc_company_intro = u.doc_company_intro_url;
          setPreviews(p);

          // ✅ Шинэ хэрэглэгч бол шууд edit mode
          const isNewUser = !u.aimag_niislel && !u.address && !u.bank_name;
          setEditing(isNewUser);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const refreshStatus = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      fetch(`${API}/api/organizations/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && (d.organization || d.user)) {
            const fresh = d.organization || d.user;
            setProfile((p: any) =>
              p
                ? {
                    ...p,
                    status: fresh.status,
                    return_reason: fresh.return_reason,
                  }
                : p,
            );
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...stored,
                status: fresh.status,
                return_reason: fresh.return_reason,
              }),
            );
          }
        })
        .catch(() => {});
    };

    const interval = setInterval(refreshStatus, 12 * 60 * 60 * 1000);
    window.addEventListener("focus", refreshStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshStatus);
    };
  }, []);

  const F = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const onFile = (field: string, file: File) => {
    setFiles((p) => ({ ...p, [field]: file }));
    setPreviews((p) => ({ ...p, [field]: URL.createObjectURL(file) }));
  };

  const startEdit = () => {
    setSnapshot({ ...form });
    setOwnerSnap(owners.map((o) => ({ ...o })));
    setFinalOwnerSnap(finalOwners.map((o) => ({ ...o })));
    setEditing(true);
    setError("");
  };

  const cancelEdit = () => {
    setForm({ ...snapshot });
    setOwners(ownerSnap.map((o) => ({ ...o })));
    setFinalOwners(finalOwnerSnap.map((o) => ({ ...o })));
    setEditing(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("activity_directions", JSON.stringify(selDirs));
    fd.append("beneficial_owners", JSON.stringify(owners));
    fd.append("final_beneficial_owners", JSON.stringify(finalOwners));
    Object.entries(files).forEach(([k, f]) => fd.append(k, f as File));
    try {
      const res = await fetch(`${API}/api/organizations/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Алдаа гарлаа");
      const updated = data.organization || data.user;

      setProfile((p: any) => ({ ...p, ...updated }));

      const f = buildForm(updated);
      setForm(f);
      setSnapshot(f);
      setSelDirs(updated.activity_directions || []);

      const lo = updated.beneficial_owners?.length
        ? updated.beneficial_owners
        : [{ ...BLANK_OWNER }];
      const lf = updated.final_beneficial_owners?.length
        ? updated.final_beneficial_owners
        : [{ ...BLANK_FINAL }];
      setOwners(lo);
      setOwnerSnap(lo);
      setFinalOwners(lf);
      setFinalOwnerSnap(lf);

      const p: Record<string, string> = { ...previews };
      if (updated.company_logo_url) p.company_logo = updated.company_logo_url;
      if (updated.doc_state_registry_url)
        p.doc_state_registry = updated.doc_state_registry_url;
      if (updated.doc_vat_certificate_url)
        p.doc_vat_certificate = updated.doc_vat_certificate_url;
      if (updated.doc_special_permission_url)
        p.doc_special_permission = updated.doc_special_permission_url;
      if (updated.doc_contract_url) p.doc_contract = updated.doc_contract_url;
      if (updated.doc_company_intro_url)
        p.doc_company_intro = updated.doc_company_intro_url;
      setPreviews(p);

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          ...updated,
        }),
      );
      setSaved(true);
      setEditing(false);
      setFiles({});
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const isNewUser = !profile?.company_name;

  const pct = (() => {
    const fields = [
      form.company_name,
      form.register_number,
      form.company_type,
      form.established_date,
      form.aimag_niislel,
      form.sum_duureg,
      form.address,
      owners[0]?.last_name,
      owners[0]?.first_name,
      owners[0]?.phone,
      form.bank_name,
      form.bank_account_number,
    ];
    const extras = [
      selDirs.length > 0,
      !!previews.doc_state_registry,
      !!previews.doc_company_intro,
    ].filter(Boolean).length;
    return Math.round(
      ((fields.filter(Boolean).length + extras) / (fields.length + 3)) * 100,
    );
  })();

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <Loader2
          size={22}
          style={{ color: "#6366f1", animation: "spin .8s linear infinite" }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingBottom: 32,
      }}
    >
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Sticky save bar ─────────────────────────────────────── */}
      {editing && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            animation: "fadeIn .2s ease",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(12px)",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            boxShadow: "0 4px 20px rgba(99,102,241,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#f59e0b",
                animation: "pulse 1.5s infinite",
              }}
            />
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                {isNewUser ? "Мэдээлэл бөглөх" : "Засварлаж байна"}
              </span>
              {isNewUser && (
                <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>
                  · Доорх талбаруудыг бөглөөд хадгална уу
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {/* ✅ Шинэ хэрэглэгч бол Болих товч харуулахгүй */}
            {!isNewUser && (
              <button
                onClick={cancelEdit}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "8px 16px",
                  borderRadius: 9,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <X size={13} /> Болих
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "8px 20px",
                borderRadius: 9,
                border: "none",
                background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
                fontFamily: "inherit",
              }}
            >
              {saving ? (
                <>
                  <Loader2
                    size={13}
                    style={{ animation: "spin .8s linear infinite" }}
                  />{" "}
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <Check size={13} /> Хадгалах
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <HeroCard
        profile={profile}
        previews={previews}
        editing={editing}
        onFile={onFile}
        startEdit={startEdit}
        pct={pct}
        isNewUser={isNewUser}
      />

      {/* Буцаагдсан шалтгаан */}
      {profile?.status === "returned" && (
        <div
          style={{
            borderRadius: 14,
            border: "1.5px solid #fecaca",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: profile?.return_reason
                ? "1px solid #fecaca"
                : "none",
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
                Бүртгэл буцаагдсан байна
              </div>
              <div style={{ fontSize: 11, color: "#ef4444", marginTop: 1 }}>
                Доорх шалтгааныг уншаад мэдээллээ засаад хадгална уу
              </div>
            </div>
          </div>
          {profile?.return_reason && (
            <div style={{ padding: "14px 16px", background: "#fff5f5" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "#dc2626",
                  marginBottom: 8,
                }}
              >
                Буцаасан шалтгаан
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#7f1d1d",
                  lineHeight: 1.7,
                  background: "white",
                  borderRadius: 10,
                  padding: "10px 14px",
                  border: "1px solid #fecaca",
                  whiteSpace: "pre-wrap" as const,
                }}
              >
                {profile.return_reason}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#b91c1c",
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>→</span>
                <span>
                  Мэдээллээ засаад <strong>"Хадгалах"</strong> товчийг дарна уу
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <Alert type="error" msg={error} />}
      {saved && <Alert type="success" msg="Амжилттай хадгаллаа" />}

      {/* 1. Байгааллагын мэдээлэл */}
      <Section icon={Building2} title="БАЙГУУЛЛАГЫН ҮНДСЭН МЭДЭЭЛЭЛ">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <FInput
            label="Байгууллагын нэр *"
            value={form.company_name}
            editing={editing}
            onChange={(v: string) => F("company_name", v)}
          />
          <FInput
            label="Байгууллагын нэр англи"
            value={form.company_name_en}
            editing={editing}
            onChange={(v: string) => F("company_name_en", v)}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <FInput
            label="Регистрийн дугаар *"
            value={form.register_number}
            editing={editing}
            onChange={(v: string) => F("register_number", v)}
            mono
          />
          <FInput
            label="Улсын бүртгэлийн дугаар"
            value={form.state_registry_number}
            editing={editing}
            onChange={(v: string) => F("state_registry_number", v)}
            mono
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <FSelect
            label="Байгааллагын хэлбэр"
            value={form.company_type}
            editing={editing}
            onChange={(v: string) => F("company_type", v)}
            options={["ХХК", "ХК", "ТББ", "Бусад"]}
          />
          <FInput
            label="Байгуулагдсан огноо"
            value={form.established_date}
            editing={editing}
            onChange={(v: string) => F("established_date", v)}
            type="date"
          />
          <FInput
            label="Ажилчдын тоо"
            value={form.employee_count}
            editing={editing}
            onChange={(v: string) => F("employee_count", v)}
            placeholder="0"
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
          }}
        >
          <FInput
            label="Утас"
            value={form.phone}
            editing={editing}
            onChange={(v: string) => F("phone", v)}
          />
          <RadioGroup
            label="НӨАТ төлөгч"
            value={form.is_vat_payer}
            editing={editing}
            onChange={(v: any) => F("is_vat_payer", v)}
            options={[
              { value: true, label: "Тийм" },
              { value: false, label: "Үгүй" },
            ]}
          />
          <RadioGroup
            label="ISO гэрчилгээ"
            value={form.is_iso_certified}
            editing={editing}
            onChange={(v: any) => F("is_iso_certified", v)}
            options={[
              { value: true, label: "Тийм" },
              { value: false, label: "Үгүй" },
            ]}
          />
        </div>
      </Section>

      {/* 2. Хаяг */}
      <Section icon={MapPin} title="ХАЯГИЙН МЭДЭЭЛЭЛ">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <FSelect
            label="Аймаг / Нийслэл"
            value={form.aimag_niislel}
            editing={editing}
            onChange={(v: string) => F("aimag_niislel", v)}
            options={AIMAG}
            placeholder="Сонгох"
          />
          <FInput
            label="Сум / Дүүрэг"
            value={form.sum_duureg}
            editing={editing}
            onChange={(v: string) => F("sum_duureg", v)}
          />
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}
        >
          <FInput
            label="Баг / Хороо"
            value={form.bag_horoo}
            editing={editing}
            onChange={(v: string) => F("bag_horoo", v)}
          />
          <FInput
            label="Дэлгэрэнгүй хаяг"
            value={form.address}
            editing={editing}
            onChange={(v: string) => F("address", v)}
          />
        </div>
      </Section>

      {/* 3. Үйл ажиллагаа */}
      <Section icon={Briefcase} title="ҮЙЛ АЖИЛЛАГААНЫ МЭДЭЭЛЭЛ">
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              display: "block",
              marginBottom: 8,
            }}
          >
            Үйл ажиллагааны чиглэл
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {dirs.map(({ id, label }) => {
              const on = selDirs.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    editing &&
                    setSelDirs((p) =>
                      p.includes(id) ? p.filter((d) => d !== id) : [...p, id],
                    )
                  }
                  style={{
                    padding: "5px 14px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 500,
                    border: on ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
                    background: on ? "#eef2ff" : "white",
                    color: on ? "#4f46e5" : "#64748b",
                    cursor: editing ? "pointer" : "default",
                    transition: "all .12s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ marginBottom: form.has_special_permission ? 14 : 0 }}>
          <RadioGroup
            label="Тусгай зөвшөөрөлтэй эсэх"
            value={form.has_special_permission}
            editing={editing}
            onChange={(v: any) => F("has_special_permission", v)}
            options={[
              { value: true, label: "Тийм" },
              { value: false, label: "Үгүй" },
            ]}
          />
        </div>
        {form.has_special_permission && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              padding: 14,
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
            }}
          >
            <FInput
              label="Тусгай зөвшөөрлийн дугаар"
              value={form.special_permission_number}
              editing={editing}
              onChange={(v: string) => F("special_permission_number", v)}
            />
            <FInput
              label="Хүчинтэй хугацаа"
              type="date"
              value={form.special_permission_expiry}
              editing={editing}
              onChange={(v: string) => F("special_permission_expiry", v)}
            />
          </div>
        )}
      </Section>

      {/* 4 & 5. Эзэмшигч / Эцсийн өмчлөгч */}
      <OwnersSection owners={owners} setOwners={setOwners} editing={editing} />
      <FinalOwnersSection
        finalOwners={finalOwners}
        setFinalOwners={setFinalOwners}
        editing={editing}
      />

      {/* 6. Баримт бичиг */}
      <Section icon={FileText} title="КОМПАНИЙН БАРИМТ БИЧИГ">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 14,
          }}
        >
          <DocUpload
            label="Улсын бүртгэлийн гэрчилгээ"
            fieldKey="doc_state_registry"
            preview={previews.doc_state_registry}
            onFile={onFile}
            editing={editing}
            accept=".pdf,image/*"
            required
          />
          <DocUpload
            label="НӨАТ-ын гэрчилгээ"
            fieldKey="doc_vat_certificate"
            preview={previews.doc_vat_certificate}
            onFile={onFile}
            editing={editing}
            accept=".pdf,image/*"
          />
          <DocUpload
            label="Тусгай зөвшөөрөл"
            fieldKey="doc_special_permission"
            preview={previews.doc_special_permission}
            onFile={onFile}
            editing={editing}
            accept=".pdf,image/*"
          />
          <DocUpload
            label="Гэрээ"
            fieldKey="doc_contract"
            preview={previews.doc_contract}
            onFile={onFile}
            editing={editing}
            accept=".pdf,image/*"
          />
          <DocUpload
            label="Танилцуулга"
            fieldKey="doc_company_intro"
            preview={previews.doc_company_intro}
            onFile={onFile}
            editing={editing}
            accept=".pdf,.doc,.docx,image/*"
          />
        </div>
      </Section>

      {/* 7. Банкны мэдээлэл */}
      <Section icon={CreditCard} title="САНХҮҮГИЙН МЭДЭЭЛЭЛ">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <FInput
            label="Банкны нэр"
            value={form.bank_name}
            editing={editing}
            onChange={(v: string) => F("bank_name", v)}
          />
          <FInput
            label="Дансны дугаар"
            value={form.bank_account_number}
            editing={editing}
            onChange={(v: string) => F("bank_account_number", v)}
            mono
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 14,
          }}
        >
          <FInput
            label="НӨАТ дугаар"
            value={form.vat_number}
            editing={editing}
            onChange={(v: string) => F("vat_number", v)}
            mono
          />
          <FInput
            label="SWIFT код"
            value={form.swift_code}
            editing={editing}
            onChange={(v: string) => F("swift_code", v)}
            mono
          />
          <FInput
            label="IBAN"
            value={form.iban}
            editing={editing}
            onChange={(v: string) => F("iban", v)}
            mono
          />
          <FSelect
            label="Валют"
            value={form.currency}
            editing={editing}
            onChange={(v: string) => F("currency", v)}
            options={[
              { value: "MNT", label: "₮ Төгрөг" },
              { value: "USD", label: "$ Доллар" },
              { value: "EUR", label: "€ Евро" },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
