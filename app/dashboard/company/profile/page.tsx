"use client";
import { useEffect, useState } from "react";
import {
  Loader2,
  Building2,
  MapPin,
  Briefcase,
  Send,
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
import { Section } from "./_components/Section";
import {
  OwnersSection,
  ExecutiveDirectorsSection,
} from "./_components/OwnersSection";
import {
  validateMongolianForm,
  isMongolian,
  validateOwnersMongolian,
} from "@/utils/mongolianValidation";
import { UB_DUUREG, AIMAG_SUM } from "@/constants/addressData";

// ── Extracted components ─────────────────────────────────────
import { useBreakpoint, type DirItem, type SelDir, type PermType } from "./_components/useW";
import { SubmitModal } from "./_components/SubmitModal";
import { SuccessModal } from "./_components/SuccessModal";
import { SaveBar } from "./_components/SaveBar";
import { DirectionPicker } from "./_components/DirectionPicker";
import { SpecialPermissionsSection } from "./_components/SpecialPermissionsSection";
import { FinanceSection } from "./_components/FinanceSection";
import { NotificationSection } from "./_components/NotificationSection";
import { DocumentsSection } from "./_components/DocumentsSection";

const BLANK_EXEC = {
  position: "Гүйцэтгэх захирал",
  last_name: "",
  first_name: "",
  phone: "",
  email: "",
};
const BLANK_PERM = {
  _key: Date.now(),
  type_id: null,
  type_label: "",
  number: "",
  expiry: "",
};

const REQUIRED_FIELDS = [
  { key: "company_name", label: "Байгууллагын нэр" },
  { key: "company_name_en", label: "Байгууллагын нэр (англи)" },
  { key: "register_number", label: "Регистрийн дугаар" },
  { key: "established_date", label: "Үүсгэн байгуулагдсан огноо" },
  { key: "aimag_niislel", label: "Аймаг / Нийслэл" },
  { key: "sum_duureg", label: "Сум / Дүүрэг" },
  { key: "bag_horoo", label: "Баг / Хороо" },
  { key: "address", label: "Дэлгэрэнгүй хаяг" },
];

function buildForm(u: any) {
  return {
    register_number: u.register_number || "",
    state_registry_number: u.state_registry_number || "",
    company_name: u.company_name || "",
    company_name_en: u.company_name_en || "",
    company_type: u.company_type || "ХХК",
    established_date: u.established_date?.slice(0, 10) || "",
    is_vat_payer:
      u.is_vat_payer === true || u.is_vat_payer === false
        ? u.is_vat_payer
        : undefined,
    is_iso_certified: u.is_iso_certified || false,
    employee_count: u.employee_count?.toString() || "",
    has_special_permission: u.has_special_permission || false,
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
    notification_preference: u.notification_preference || "selected_dirs",
  };
}

// ═════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════
export default function CompanyProfilePage() {
  const { isMobile, isTablet } = useBreakpoint();

  const [profile, setProfile] = useState<any>(null);
  const [dirs, setDirs] = useState<DirItem[]>([]);
  const [permTypes, setPermTypes] = useState<PermType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selDirs, setSelDirs] = useState<SelDir[]>([]);
  const [selDirSnap, setSelDirSnap] = useState<SelDir[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraFileUrls, setExtraFileUrls] = useState<string[]>([]);
  const [extraSnap, setExtraSnap] = useState<File[]>([]);
  const [extraUrlSnap, setExtraUrlSnap] = useState<string[]>([]);
  const [form, setForm] = useState<any>(BLANK);
  const [snapshot, setSnapshot] = useState<any>(BLANK);
  const [owners, setOwners] = useState<any[]>([{ ...BLANK_OWNER }]);
  const [ownerSnap, setOwnerSnap] = useState<any[]>([{ ...BLANK_OWNER }]);
  const [finalOwners, setFinalOwners] = useState<any[]>([{ ...BLANK_FINAL }]);
  const [finalOwnerSnap, setFinalOwnerSnap] = useState<any[]>([{ ...BLANK_FINAL }]);
  const [directors, setDirectors] = useState<any[]>([{ ...BLANK_EXEC }]);
  const [directorSnap, setDirectorSnap] = useState<any[]>([{ ...BLANK_EXEC }]);
  const [specPerms, setSpecPerms] = useState<any[]>([{ ...BLANK_PERM }]);
  const [specPermSnap, setSpecPermSnap] = useState<any[]>([{ ...BLANK_PERM }]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [ownerFieldErrors, setOwnerFieldErrors] = useState<Record<string, string>>({});
  const [directorFieldErrors, setDirectorFieldErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // ── Initial fetch ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/activity-directions`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const source = d.directions || d.flat || [];
          setDirs(
            source
              .filter((dir: any) => !dir.parent_id)
              .map((dir: any) => ({
                id: Number(dir.id),
                label: dir.label,
                children: (
                  dir.children ||
                  source.filter(
                    (c: any) => Number(c.parent_id) === Number(dir.id),
                  )
                ).map((c: any) => ({ id: Number(c.id), label: c.label })),
              })),
          );
        }
      })
      .catch(() => {});

    fetch(`${API}/api/special-permission-types`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPermTypes(d.types || []);
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

          const rawDirs = u.activity_directions || [];
          const parsedDirs: SelDir[] =
            Array.isArray(rawDirs) && rawDirs.length > 0 && typeof rawDirs[0] === "object"
              ? rawDirs.map((d: any) => ({
                  main_id: Number(d.main_id),
                  sub_ids: (d.sub_ids || []).map(Number),
                }))
              : rawDirs.map((id: number) => ({ main_id: Number(id), sub_ids: [] }));
          setSelDirs(parsedDirs);
          setSelDirSnap(parsedDirs);

          setOwners(u.beneficial_owners?.length ? u.beneficial_owners : [{ ...BLANK_OWNER }]);
          setOwnerSnap(u.beneficial_owners?.length ? u.beneficial_owners : [{ ...BLANK_OWNER }]);
          setFinalOwners(u.final_beneficial_owners?.length ? u.final_beneficial_owners : [{ ...BLANK_FINAL }]);
          setFinalOwnerSnap(u.final_beneficial_owners?.length ? u.final_beneficial_owners : [{ ...BLANK_FINAL }]);
          setDirectors(u.executive_directors?.length ? u.executive_directors : [{ ...BLANK_EXEC }]);
          setDirectorSnap(u.executive_directors?.length ? u.executive_directors : [{ ...BLANK_EXEC }]);

          setSpecPerms(
            u.special_permissions?.length
              ? u.special_permissions.map((p: any, i: number) => ({
                  ...p,
                  _key: i,
                  type_label: p.type_label || "",
                }))
              : [{ ...BLANK_PERM }],
          );
          setSpecPermSnap(
            u.special_permissions?.length
              ? u.special_permissions.map((p: any, i: number) => ({
                  ...p,
                  _key: i,
                  type_label: p.type_label || "",
                }))
              : [{ ...BLANK_PERM }],
          );

          const savedUrls = Array.isArray(u.extra_documents) ? u.extra_documents : [];
          setExtraFileUrls(savedUrls);
          setExtraUrlSnap(savedUrls);

          const p: Record<string, string> = {};
          if (u.company_logo_url) p.company_logo = u.company_logo_url;
          if (u.doc_state_registry_url) p.doc_state_registry = u.doc_state_registry_url;
          if (u.doc_vat_certificate_url) p.doc_vat_certificate = u.doc_vat_certificate_url;
          if (u.doc_special_permission_url) p.doc_special_permission = u.doc_special_permission_url;
          if (u.doc_contract_url) p.doc_contract = u.doc_contract_url;
          if (u.doc_company_intro_url) p.doc_company_intro = u.doc_company_intro_url;
          setPreviews(p);
          setEditing(!u.aimag_niislel && !u.address && !u.bank_name);
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
              p ? { ...p, status: fresh.status, return_reason: fresh.return_reason } : p,
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
    window.addEventListener("user-updated", refreshStatus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshStatus);
      window.removeEventListener("user-updated", refreshStatus);
    };
  }, []);

  // ── Sync type_label after permTypes load ──────────────────
  useEffect(() => {
    if (permTypes.length === 0) return;
    setSpecPerms((prev) =>
      prev.map((perm) => ({
        ...perm,
        type_label:
          perm.type_label ||
          permTypes.find((t) => Number(t.id) === Number(perm.type_id))?.label ||
          "",
      })),
    );
  }, [permTypes]);

  // ── Helpers ────────────────────────────────────────────────
  const F = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const onFile = (field: string, file: File) => {
    setFiles((p) => ({ ...p, [field]: file }));
    setPreviews((p) => ({ ...p, [field]: URL.createObjectURL(file) }));
  };

  const getMissingFields = () => {
    const missing = REQUIRED_FIELDS.filter((f) => !form[f.key]);

    // НӨАТ төлөгч (true/false хоёрын аль нэг сонгогдсон байх)
    if (form.is_vat_payer !== true && form.is_vat_payer !== false)
      missing.push({ key: "is_vat_payer", label: "НӨАТ төлөгч эсэх" });

    // Үйл ажиллагааны чиглэл
    if (selDirs.length === 0)
      missing.push({ key: "activity_directions", label: "Үйл ажиллагааны чиглэл" });
    if (!form.supply_direction)
      missing.push({ key: "supply_direction", label: "Нийлүүлэх төрөл" });

    // Гүйцэтгэх захирал
    const d0 = directors[0];
    if (!d0?.last_name?.trim() || !d0?.first_name?.trim() || !d0?.phone?.trim())
      missing.push({ key: "directors", label: "Гүйцэтгэх захирлын мэдээлэл" });

    // Эзэмшигч (1-р буюу үндсэн)
    const o0 = owners[0];
    if (
      !o0?.last_name?.trim() ||
      !o0?.first_name?.trim() ||
      !o0?.gender ||
      !o0?.position?.trim() ||
      !o0?.phone?.trim()
    )
      missing.push({ key: "owners", label: "Эзэмшигчийн мэдээлэл" });

    // Баримт бичиг (3 заавал)
    if (!previews.doc_state_registry)
      missing.push({ key: "doc_state_registry", label: "Улсын бүртгэлийн гэрчилгээ" });
    if (!previews.doc_vat_certificate)
      missing.push({ key: "doc_vat_certificate", label: "НӨАТ-ын гэрчилгээ" });
    if (form.has_special_permission && !previews.doc_special_permission)
      missing.push({ key: "doc_special_permission", label: "Тусгай зөвшөөрлийн файл" });

    // Санхүү — заавал биш

    // Мэдэгдэл
    if (!form.notification_preference)
      missing.push({ key: "notification_preference", label: "Мэдэгдэл хүлээн авах хэлбэр" });

    return missing;
  };

  const toggleMain = (mainId: number) => {
    setSelDirs((p) => {
      const exists = p.find((d) => Number(d.main_id) === Number(mainId));
      if (exists) return p.filter((d) => Number(d.main_id) !== Number(mainId));
      const main = dirs.find((d) => Number(d.id) === Number(mainId));
      return [
        ...p,
        {
          main_id: Number(mainId),
          sub_ids: (main?.children || []).map((c) => Number(c.id)),
        },
      ];
    });
  };

  const toggleSub = (mainId: number, subId: number) => {
    setSelDirs((p) =>
      p.map((d) =>
        d.main_id !== mainId
          ? d
          : {
              ...d,
              sub_ids: d.sub_ids.some((id) => Number(id) === Number(subId))
                ? d.sub_ids.filter((id) => Number(id) !== Number(subId))
                : [...d.sub_ids, subId],
            },
      ),
    );
  };

  const startEdit = () => {
    setSnapshot({ ...form });
    setOwnerSnap(owners.map((o) => ({ ...o })));
    setFinalOwnerSnap(finalOwners.map((o) => ({ ...o })));
    setDirectorSnap(directors.map((o) => ({ ...o })));
    setSpecPermSnap(specPerms.map((o) => ({ ...o })));
    setSelDirSnap(selDirs.map((d) => ({ ...d, sub_ids: [...d.sub_ids] })));
    setExtraSnap([...extraFiles]);
    setExtraUrlSnap([...extraFileUrls]);
    setEditing(true);
    setError("");
    setFieldErrors({});
  };

  const cancelEdit = () => {
    setForm({ ...snapshot });
    setOwners(ownerSnap.map((o) => ({ ...o })));
    setFinalOwners(finalOwnerSnap.map((o) => ({ ...o })));
    setDirectors(directorSnap.map((o) => ({ ...o })));
    setSpecPerms(specPermSnap.map((o) => ({ ...o })));
    setSelDirs(selDirSnap.map((d) => ({ ...d, sub_ids: [...d.sub_ids] })));
    setExtraFiles([...extraSnap]);
    setExtraFileUrls([...extraUrlSnap]);
    setEditing(false);
    setError("");
    setFieldErrors({});
  };

  // ── Save ──────────────────────────────────────────────────
  const doSave = async (extraFormFields?: Record<string, string>) => {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setSaving(false);
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("activity_directions", JSON.stringify(selDirs));
    fd.append("beneficial_owners", JSON.stringify(owners));
    fd.append("final_beneficial_owners", JSON.stringify(finalOwners));
    fd.append("executive_directors", JSON.stringify(directors));
    fd.append("special_permissions", JSON.stringify(specPerms));
    Object.entries(files).forEach(([k, f]) => fd.append(k, f as File));
    fd.append("existing_extra_docs", JSON.stringify(extraFileUrls));
    extraFiles.forEach((f, i) => fd.append(`extra_doc_${i}`, f as File));
    fd.append("extra_doc_count", String(extraFiles.length));
    if (extraFormFields)
      Object.entries(extraFormFields).forEach(([k, v]) => fd.append(k, v));

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
      const withId = (arr: any[]) =>
        arr.map((p) => ({ ...p, id: p.id || Math.random().toString(36).slice(2) }));

      const rawDirs = updated.activity_directions || [];
      const parsedDirs: SelDir[] =
        Array.isArray(rawDirs) && rawDirs.length > 0 && typeof rawDirs[0] === "object"
          ? rawDirs.map((d: any) => ({
              main_id: Number(d.main_id),
              sub_ids: (d.sub_ids || []).map(Number),
            }))
          : rawDirs.map((id: number) => ({ main_id: Number(id), sub_ids: [] }));
      setSelDirs(parsedDirs);
      setSelDirSnap(parsedDirs);

      setOwners(updated.beneficial_owners?.length ? updated.beneficial_owners : [{ ...BLANK_OWNER }]);
      setOwnerSnap(updated.beneficial_owners?.length ? updated.beneficial_owners : [{ ...BLANK_OWNER }]);
      setFinalOwners(updated.final_beneficial_owners?.length ? updated.final_beneficial_owners : [{ ...BLANK_FINAL }]);
      setFinalOwnerSnap(updated.final_beneficial_owners?.length ? updated.final_beneficial_owners : [{ ...BLANK_FINAL }]);
      setDirectors(updated.executive_directors?.length ? updated.executive_directors : [{ ...BLANK_EXEC }]);
      setDirectorSnap(updated.executive_directors?.length ? updated.executive_directors : [{ ...BLANK_EXEC }]);
      setSpecPerms(
        updated.special_permissions?.length
          ? withId(updated.special_permissions)
          : [{ ...BLANK_PERM, id: Math.random().toString(36).slice(2) }],
      );
      setSpecPermSnap(
        updated.special_permissions?.length
          ? withId(updated.special_permissions)
          : [{ ...BLANK_PERM, id: Math.random().toString(36).slice(2) }],
      );

      const newUrls = Array.isArray(updated.extra_documents)
        ? updated.extra_documents
        : extraFileUrls;
      setExtraFileUrls(newUrls);
      setExtraUrlSnap(newUrls);
      setExtraFiles([]);
      setExtraSnap([]);

      const p: Record<string, string> = { ...previews };
      if (updated.company_logo_url) p.company_logo = updated.company_logo_url;
      if (updated.doc_state_registry_url) p.doc_state_registry = updated.doc_state_registry_url;
      if (updated.doc_vat_certificate_url) p.doc_vat_certificate = updated.doc_vat_certificate_url;
      if (updated.doc_special_permission_url) p.doc_special_permission = updated.doc_special_permission_url;
      if (updated.doc_contract_url) p.doc_contract = updated.doc_contract_url;
      if (updated.doc_company_intro_url) p.doc_company_intro = updated.doc_company_intro_url;
      setPreviews(p);

      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, ...updated }));
        window.dispatchEvent(new Event("user-updated"));
      } catch {}

      setSaved(true);
      setEditing(false);
      setShowSubmitModal(false);
      setFiles({});
      if (!profile?.company_name && !extraFormFields?.status) setShowSuccessModal(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Validation ────────────────────────────────────────────
  // Returns the first error message (or "" if everything is valid).
  // Sets all field-level errors so the user can see them inline.
  const runValidation = (): string => {
    const newFieldErrors: Record<string, string> = {};
    const newDirErrors: Record<string, string> = {};
    let firstError = "";

    // ── 1. Үндсэн мэдээлэл ────────────────────────────────
    if (!form.company_name?.trim()) {
      newFieldErrors.company_name = "Заавал бөглөх";
      firstError ||= "Байгууллагын нэр заавал";
    } else if (
      form.company_name !== snapshot.company_name &&
      !isMongolian(form.company_name)
    ) {
      newFieldErrors.company_name = "Крилл үсгээр бичнэ үү";
      firstError ||= "Байгууллагын нэр монгол үсгээр бичнэ үү";
    }
    if (!form.register_number?.trim()) {
      newFieldErrors.register_number = "Заавал бөглөх";
      firstError ||= "Регистрийн дугаар заавал";
    } else if (form.register_number.length !== 7) {
      newFieldErrors.register_number = "7 оронтой тоо оруулна уу";
      firstError ||= "Регистрийн дугаар 7 оронтой байх ёстой";
    }

    // Байгууллагын нэр (англи) — заавал + латин үсэг + тоо/тэмдэгт
    if (!form.company_name_en?.trim()) {
      newFieldErrors.company_name_en = "Заавал бөглөх";
      firstError ||= "Англи нэр оруулаагүй";
    } else if (!/^[A-Za-z0-9\s\-\.,&/()'"]+$/.test(form.company_name_en)) {
      newFieldErrors.company_name_en = "Латин үсгээр бичнэ үү";
      firstError ||= "Англи нэр латин үсгээр байх ёстой";
    }

    // НӨАТ төлөгч — заавал сонгох (true/false хоёрын аль нэг)
    if (form.is_vat_payer !== true && form.is_vat_payer !== false) {
      newFieldErrors.is_vat_payer = "Заавал сонгох";
      firstError ||= "НӨАТ төлөгч эсэхийг сонгоно уу";
    }

    // Үүсгэн байгуулагдсан огноо — заавал + ирээдүйн огноо байж болохгүй
    if (!form.established_date?.trim()) {
      newFieldErrors.established_date = "Заавал бөглөх";
      firstError ||= "Үүсгэн байгуулагдсан огноо оруулаагүй";
    } else {
      const d = new Date(form.established_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (Number.isNaN(d.getTime())) {
        newFieldErrors.established_date = "Огноо буруу байна";
        firstError ||= "Үүсгэн байгуулагдсан огноо буруу";
      } else if (d > today) {
        newFieldErrors.established_date = "Ирээдүйн огноо байж болохгүй";
        firstError ||= "Үүсгэн байгуулагдсан огноо ирээдүйнх байх ёсгүй";
      }
    }

    // General Mongolian validator (for other Mongolian-text fields)
    const errs = validateMongolianForm(form, [
      "sum_duureg",
      ...(form.aimag_niislel !== "Улаанбаатар" ? ["bag_horoo" as const] : []),
    ]);
    Object.assign(newFieldErrors, errs);
    if (Object.keys(errs).length > 0) firstError ||= Object.values(errs)[0];

    // ── 2. Гүйцэтгэх захирал (заавал) ────────────────────
    directors.forEach((d: any, idx: number) => {
      // Position
      if (idx === 0 && !d.position?.trim())
        newDirErrors[`${idx}_position`] = "Албан тушаал заавал";
      else if (d.position && !/^[\u0400-\u04FF\s\-]+$/.test(d.position))
        newDirErrors[`${idx}_position`] = "Крилл үсгээр бичнэ үү";

      // Last name — required
      if (!d.last_name?.trim())
        newDirErrors[`${idx}_last_name`] = "Овог заавал";
      else if (!/^[\u0400-\u04FF\s\-]+$/.test(d.last_name))
        newDirErrors[`${idx}_last_name`] = "Крилл үсгээр бичнэ үү";

      // First name — required
      if (!d.first_name?.trim())
        newDirErrors[`${idx}_first_name`] = "Нэр заавал";
      else if (!/^[\u0400-\u04FF\s\-]+$/.test(d.first_name))
        newDirErrors[`${idx}_first_name`] = "Крилл үсгээр бичнэ үү";

      // Phone — required + 8 digits
      if (!d.phone?.trim())
        newDirErrors[`${idx}_phone`] = "Утас заавал";
      else if (!/^\d+$/.test(d.phone) || d.phone.length !== 8)
        newDirErrors[`${idx}_phone`] = "8 оронтой тоо оруулна уу";

      // Email — optional but if filled, must be valid
      if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
        newDirErrors[`${idx}_email`] = "И-мэйл хаяг буруу байна";
    });
    if (Object.keys(newDirErrors).length > 0)
      firstError ||= "Гүйцэтгэх захирлын мэдээлэл буруу байна";

    // ── 3. Үйл ажиллагааны чиглэл (заавал) ───────────────
    if (selDirs.length === 0) {
      newFieldErrors.activity_directions = "Дор хаяж нэг чиглэл сонгоно уу";
      firstError ||= "Үйл ажиллагааны чиглэл сонгогдоогүй";
    }
    if (!form.supply_direction) {
      newFieldErrors.supply_direction = "Заавал сонгох";
      firstError ||= "Нийлүүлэх төрөл сонгогдоогүй";
    }

    // ── 4. Хаяг (заавал) ─────────────────────────────────
    if (!form.aimag_niislel?.trim()) {
      newFieldErrors.aimag_niislel = "Заавал сонгох";
      firstError ||= "Аймаг / Нийслэл сонгогдоогүй";
    }
    if (!form.sum_duureg?.trim()) {
      newFieldErrors.sum_duureg = "Заавал сонгох";
      firstError ||=
        form.aimag_niislel === "Улаанбаатар"
          ? "Дүүрэг сонгогдоогүй"
          : "Сум сонгогдоогүй";
    }
    if (!form.bag_horoo?.trim()) {
      newFieldErrors.bag_horoo = "Заавал бөглөх";
      firstError ||=
        form.aimag_niislel === "Улаанбаатар"
          ? "Хороо сонгогдоогүй"
          : "Баг / Хороо оруулаагүй";
    }
    if (!form.address?.trim()) {
      newFieldErrors.address = "Заавал бөглөх";
      firstError ||= "Дэлгэрэнгүй хаяг оруулаагүй";
    }

    // ── 5. Эзэмшигч (1-р эзэмшигч заавал) ────────────────
    const newOwnerErrs: Record<string, string> = {};
    const o0 = owners[0];
    if (!o0?.last_name?.trim())
      newOwnerErrs[`0_last_name`] = "Овог заавал";
    else if (!/^[\u0400-\u04FF\s\-]+$/.test(o0.last_name))
      newOwnerErrs[`0_last_name`] = "Крилл үсгээр бичнэ үү";

    if (!o0?.first_name?.trim())
      newOwnerErrs[`0_first_name`] = "Нэр заавал";
    else if (!/^[\u0400-\u04FF\s\-]+$/.test(o0.first_name))
      newOwnerErrs[`0_first_name`] = "Крилл үсгээр бичнэ үү";

    if (!o0?.gender)
      newOwnerErrs[`0_gender`] = "Хүйс заавал";

    if (!o0?.position?.trim())
      newOwnerErrs[`0_position`] = "Албан тушаал заавал";
    else if (!/^[\u0400-\u04FF\s\-]+$/.test(o0.position))
      newOwnerErrs[`0_position`] = "Крилл үсгээр бичнэ үү";

    if (!o0?.phone?.trim())
      newOwnerErrs[`0_phone`] = "Утас заавал";
    else if (!/^\d+$/.test(o0.phone) || o0.phone.length !== 8)
      newOwnerErrs[`0_phone`] = "8 оронтой тоо оруулна уу";

    // Бусад эзэмшигчид (2-оос эхлэн): зөвхөн овог/нэр шалгана
    owners.slice(1).forEach((o: any, i: number) => {
      const idx = i + 1;
      if (o.last_name && !/^[\u0400-\u04FF\s\-]+$/.test(o.last_name))
        newOwnerErrs[`${idx}_last_name`] = "Крилл үсгээр бичнэ үү";
      if (o.first_name && !/^[\u0400-\u04FF\s\-]+$/.test(o.first_name))
        newOwnerErrs[`${idx}_first_name`] = "Крилл үсгээр бичнэ үү";
    });

    // Merge with existing Mongolian-text validator (validateOwnersMongolian)
    const extraOwnerErrs = validateOwnersMongolian(owners);
    Object.entries(extraOwnerErrs).forEach(([k, v]) => {
      if (!newOwnerErrs[k]) newOwnerErrs[k] = v;
    });

    setOwnerFieldErrors(newOwnerErrs);
    if (Object.keys(newOwnerErrs).length > 0)
      firstError ||= "Эзэмшигчийн мэдээлэл буруу байна";

    // ── 6. Баримт бичиг (заавал) ─────────────────────────
    if (!previews.doc_state_registry) {
      newFieldErrors.doc_state_registry = "Файл оруулна уу";
      firstError ||= "Улсын бүртгэлийн гэрчилгээ оруулаагүй";
    }
    if (!previews.doc_vat_certificate) {
      newFieldErrors.doc_vat_certificate = "Файл оруулна уу";
      firstError ||= "НӨАТ-ын гэрчилгээ оруулаагүй";
    }
    if (form.has_special_permission && !previews.doc_special_permission) {
      newFieldErrors.doc_special_permission = "Файл оруулна уу";
      firstError ||= "Тусгай зөвшөөрлийн файл оруулаагүй";
    }

    // ── 6. Санхүү — validation байхгүй (заавал биш) ─────

    // ── 7. Мэдэгдлийн тохиргоо ───────────────────────────
    if (!form.notification_preference) {
      newFieldErrors.notification_preference = "Заавал сонгох";
      firstError ||= "Мэдэгдэл хүлээн авах хэлбэр сонгогдоогүй";
    }

    // Apply errors
    setFieldErrors(newFieldErrors);
    setDirectorFieldErrors(newDirErrors);
    // NOTE: we no longer set the top-level `error` banner for validation —
    // validation messages live next to their fields. `error` is reserved for
    // network / server-level errors only.

    // Scroll to the first invalid field (instead of top of page)
    if (firstError && typeof window !== "undefined") {
      setTimeout(() => {
        const el =
          document.querySelector<HTMLElement>("[data-error='true']") ||
          document.querySelector<HTMLElement>(".has-error");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);
    }

    return firstError;
  };

  // "Хадгалах" — validation + save (NOT submit)
  const handleSaveDraft = async () => {
    const err = runValidation();
    if (err) return;
    await doSave();
  };

  // "Илгээх" — validation first, then open confirm modal
  const handleSubmitClick = () => {
    const err = runValidation();
    if (err) return;
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => doSave({ status: "pending" });

  const isNewUser = !profile?.company_name;
  const pct = (() => {
    const fields = [
      form.company_name, form.register_number, form.company_type, form.established_date,
      form.aimag_niislel, form.sum_duureg, form.address,
      owners[0]?.last_name, owners[0]?.first_name, owners[0]?.phone,
      form.bank_name, form.bank_account_number,
    ];
    const extras = [selDirs.length > 0, !!previews.doc_state_registry].filter(Boolean).length;
    return Math.min(
      100,
      Math.round(((fields.filter(Boolean).length + extras) / (fields.length + 2)) * 100),
    );
  })();

  if (loading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <Loader2 size={22} style={{ color: "#0072BC", animation: "spin .8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  // Responsive grids
  const g2 = isMobile ? "1fr" : "1fr 1fr";
  const g3 = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";
  const g4 = isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr 1fr";
  const gDoc = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)";
  const gAddr = isMobile ? "1fr" : "1fr 2fr";

  return (
    <div
      style={{
        maxWidth: "90%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingBottom: 32,
        paddingLeft: isMobile ? 8 : 0,
        paddingRight: isMobile ? 8 : 0,
      }}
    >
      <style>{`
        @keyframes spin   { to { transform:rotate(360deg) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#f1f5f9; border-radius:99px; }
        ::-webkit-scrollbar-thumb { background:#0072BC; border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:#005a96; }
      `}</style>

      {/* Modals */}
      {showSubmitModal && (
        <SubmitModal
          missing={getMissingFields()}
          onConfirm={handleConfirmSubmit}
          onClose={() => setShowSubmitModal(false)}
          saving={saving}
        />
      )}
      {showSuccessModal && <SuccessModal onClose={() => setShowSuccessModal(false)} />}

      {/* Top sticky save bar */}
      {editing && (
        <SaveBar
          variant="sticky"
          isNewUser={isNewUser}
          saving={saving}
          onCancel={cancelEdit}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitClick}
        />
      )}

      <HeroCard
        profile={profile}
        previews={previews}
        editing={editing}
        onFile={onFile}
        startEdit={startEdit}
        pct={pct}
        isNewUser={isNewUser}
        extraButtons={
          !editing && !isNewUser ? (
            <button
              onClick={handleSubmitClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                background: "#0072BC",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              <Send size={13} /> Илгээх
            </button>
          ) : null
        }
      />

      {profile?.status === "returned" && (
        <div style={{ borderRadius: 14, border: "1.5px solid #fecaca", overflow: "hidden" }}>
          <div
            style={{
              padding: "12px 16px",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: profile?.return_reason ? "1px solid #fecaca" : "none",
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

      {/* 1. Үндсэн мэдээлэл */}
      <Section icon={Building2} title="БАЙГУУЛЛАГЫН ҮНДСЭН МЭДЭЭЛЭЛ">
        <div style={{ display: "grid", gridTemplateColumns: g2, gap: 14, marginBottom: 14 }}>
          <FInput
            label="Байгууллагын нэр *"
            value={form.company_name}
            editing={editing}
            disabled={true}
            onChange={(v: string) => {
              F("company_name", v);
              setFieldErrors((p) => ({
                ...p,
                company_name: v && !isMongolian(v) ? "Крилл үсгээр бичнэ үү" : "",
              }));
            }}
            fieldError={fieldErrors.company_name}
          />
          <FInput
            label="Байгууллагын нэр (англи) *"
            value={form.company_name_en}
            editing={editing}
            onChange={(v: string) => {
              F("company_name_en", v);
              setFieldErrors((p) => ({
                ...p,
                company_name_en:
                  v && !/^[A-Za-z0-9\s\-\.,&/()'"]+$/.test(v)
                    ? "Латин үсгээр бичнэ үү"
                    : "",
              }));
            }}
            placeholder="Жишээ: Bodi Group LLC"
            fieldError={fieldErrors.company_name_en}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: g2, gap: 14, marginBottom: 14 }}>
          <FInput
            label="Регистрийн дугаар *"
            value={form.register_number}
            editing={editing}
            disabled={true}
            onChange={(v: string) => {
              const digits = v.replace(/\D/g, "").slice(0, 7);
              F("register_number", digits);
              setFieldErrors((p) => ({
                ...p,
                register_number: digits && digits.length < 7 ? "7 оронтой тоо оруулна уу" : "",
              }));
            }}
            fieldError={fieldErrors.register_number}
            mono
          />
          <FSelect
            label="Байгууллагын хэлбэр"
            value={form.company_type}
            editing={editing}
            onChange={(v: string) => F("company_type", v)}
            options={["ХХК", "ХХК/ГХО", "ХК", "Холбоо", "Хоршоо", "ТББ", "Сан", "Нөхөрлөл"]}
          />
          <div>
            <RadioGroup
              label="НӨАТ төлөгч *"
              value={form.is_vat_payer}
              editing={editing}
              onChange={(v: any) => {
                F("is_vat_payer", v);
                setFieldErrors((p) => ({ ...p, is_vat_payer: "" }));
              }}
              options={[
                { value: true, label: "Тийм" },
                { value: false, label: "Үгүй" },
              ]}
            />
            {fieldErrors.is_vat_payer && (
              <div
                data-error="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 5,
                  padding: "3px 8px",
                  background: "#0072BC",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 10, color: "#ef4444" }}>✕</span>
                <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 500 }}>
                  {fieldErrors.is_vat_payer}
                </span>
              </div>
            )}
          </div>
          <FInput
            label="Үүсгэн байгуулагдсан огноо *"
            value={form.established_date}
            editing={editing}
            onChange={(v: string) => {
              F("established_date", v);
              setFieldErrors((p) => ({ ...p, established_date: "" }));
            }}
            type="date"
            fieldError={fieldErrors.established_date}
          />
        </div>
      </Section>

      {/* 2. Гүйцэтгэх захирал */}
      <ExecutiveDirectorsSection
        directors={directors}
        setDirectors={setDirectors}
        editing={editing}
        fieldErrors={directorFieldErrors}
        setFieldErrors={setDirectorFieldErrors}
      />

      {/* 3. Үйл ажиллагаа */}
      <Section icon={Briefcase} title="ҮЙЛ АЖИЛЛАГААНЫ МЭДЭЭЛЭЛ">
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              display: "block",
              marginBottom: 10,
            }}
          >
            Үйл ажиллагааны чиглэл <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <DirectionPicker
            dirs={dirs}
            selDirs={selDirs}
            editing={editing}
            toggleMain={toggleMain}
            toggleSub={toggleSub}
          />
          {fieldErrors.activity_directions && (
            <div
              data-error="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
                padding: "3px 8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: 10, color: "#ef4444" }}>✕</span>
              <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 500 }}>
                {fieldErrors.activity_directions}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: g3, gap: 14, marginBottom: 14 }}>
          <div style={{ marginBottom: 14 }}>
            <FSelect
              label="Нийлүүлэх төрөл *"
              value={form.supply_direction}
              editing={editing}
              onChange={(v: string) => {
                F("supply_direction", v);
                setFieldErrors((p) => ({ ...p, supply_direction: "" }));
              }}
              options={[
                { value: "goods", label: "Бараа" },
                { value: "service", label: "Үйлчилгээ" },
                { value: "both", label: "Аль аль нь" },
              ]}
              placeholder="Сонгоно уу"
              fieldError={fieldErrors.supply_direction}
            />
          </div>
          <FInput
            label="Ажилчдын тоо"
            value={form.employee_count}
            editing={editing}
            onChange={(v: string) => F("employee_count", v)}
            placeholder="0"
          />
          <RadioGroup
            label="ISO сертификаттай эсэх"
            value={form.is_iso_certified}
            editing={editing}
            onChange={(v: any) => F("is_iso_certified", v)}
            options={[
              { value: true, label: "Тийм" },
              { value: false, label: "Үгүй" },
            ]}
          />
        </div>

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
            Үйл ажиллагааны тайлбар
          </label>
          {editing ? (
            <textarea
              value={form.activity_description}
              onChange={(e) => F("activity_description", e.target.value)}
              rows={3}
              placeholder="Байгууллагын үйл ажиллагаа, чиглэл, туршлагыг товч тайлбарлана уу..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 13,
                color: "#1e293b",
                outline: "none",
                resize: "vertical" as const,
                fontFamily: "inherit",
                lineHeight: 1.6,
                transition: "border-color .15s",
                boxSizing: "border-box" as const,
              }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = "#0072BC")}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = "#e2e8f0")}
            />
          ) : (
            <div
              style={{
                fontSize: 13,
                color: form.activity_description ? "#1e293b" : "#cbd5e1",
                padding: "10px 0",
                lineHeight: 1.6,
                borderBottom: "1px solid #f1f5f9",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {form.activity_description || "—"}
            </div>
          )}
        </div>

        <div style={{ marginBottom: form.has_special_permission ? 12 : 0 }}>
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
          <SpecialPermissionsSection
            specPerms={specPerms}
            setSpecPerms={setSpecPerms}
            permTypes={permTypes}
            editing={editing}
          />
        )}
      </Section>

      {/* 4. Хаяг */}
      <Section icon={MapPin} title="ХАЯГИЙН МЭДЭЭЛЭЛ">
        <div style={{ display: "grid", gridTemplateColumns: g2, gap: 14, marginBottom: 14 }}>
          <FSelect
            label="Аймаг / Нийслэл *"
            value={form.aimag_niislel}
            editing={editing}
            onChange={(v: string) => {
              F("aimag_niislel", v);
              F("sum_duureg", "");
              F("bag_horoo", "");
              setFieldErrors((p) => ({
                ...p,
                aimag_niislel: "",
                sum_duureg: "",
                bag_horoo: "",
              }));
            }}
            options={AIMAG}
            placeholder="Сонгох"
            fieldError={fieldErrors.aimag_niislel}
          />
          {form.aimag_niislel === "Улаанбаатар" ? (
            <FSelect
              label="Дүүрэг *"
              value={form.sum_duureg}
              editing={editing}
              onChange={(v: string) => {
                F("sum_duureg", v);
                F("bag_horoo", "");
                setFieldErrors((p) => ({ ...p, sum_duureg: "", bag_horoo: "" }));
              }}
              options={Object.keys(UB_DUUREG)}
              placeholder="Дүүрэг сонгох"
              fieldError={fieldErrors.sum_duureg}
            />
          ) : (
            <FSelect
              label="Сум *"
              value={form.sum_duureg}
              editing={editing}
              onChange={(v: string) => {
                F("sum_duureg", v);
                F("bag_horoo", "");
                setFieldErrors((p) => ({ ...p, sum_duureg: "", bag_horoo: "" }));
              }}
              options={
                form.aimag_niislel && AIMAG_SUM[form.aimag_niislel]
                  ? AIMAG_SUM[form.aimag_niislel]
                  : []
              }
              placeholder={form.aimag_niislel ? "Сум сонгох" : "Эхлээд аймаг сонгоно уу"}
              fieldError={fieldErrors.sum_duureg}
            />
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: gAddr, gap: 14 }}>
          {form.aimag_niislel === "Улаанбаатар" &&
          form.sum_duureg &&
          UB_DUUREG[form.sum_duureg] ? (
            <FSelect
              label="Хороо *"
              value={form.bag_horoo}
              editing={editing}
              onChange={(v: string) => {
                F("bag_horoo", v);
                setFieldErrors((p) => ({ ...p, bag_horoo: "" }));
              }}
              options={UB_DUUREG[form.sum_duureg]}
              placeholder="Хороо сонгох"
              fieldError={fieldErrors.bag_horoo}
            />
          ) : (
            <FInput
              label="Баг / Хороо *"
              value={form.bag_horoo}
              editing={editing}
              onChange={(v: string) => {
                F("bag_horoo", v);
                setFieldErrors((p) => ({
                  ...p,
                  bag_horoo:
                    v && !/^[\u0400-\u04FF\s\d\-\/\.]+$/.test(v)
                      ? "Крилл үсэг, тоо оруулна уу"
                      : "",
                }));
              }}
              fieldError={fieldErrors.bag_horoo}
            />
          )}
          <FInput
            label="Дэлгэрэнгүй хаяг *"
            value={form.address}
            editing={editing}
            onChange={(v: string) => {
              F("address", v);
              setFieldErrors((p) => ({ ...p, address: "" }));
            }}
            fieldError={fieldErrors.address}
          />
        </div>
      </Section>

      {/* 5. Эзэмшигч */}
      <OwnersSection
        owners={owners}
        setOwners={setOwners}
        editing={editing}
        fieldErrors={ownerFieldErrors}
        setFieldErrors={setOwnerFieldErrors}
      />

      {/* 6. Баримт бичиг */}
      <DocumentsSection
        form={form}
        previews={previews}
        onFile={onFile}
        editing={editing}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
        extraFiles={extraFiles}
        setExtraFiles={setExtraFiles}
        extraFileUrls={extraFileUrls}
        setExtraFileUrls={setExtraFileUrls}
      />

      {/* 7. Санхүү */}
      <FinanceSection form={form} F={F} editing={editing} />

      {/* 8. Мэдэгдэл */}
      <NotificationSection
        form={form}
        F={F}
        editing={editing}
        dirs={dirs}
        selDirs={selDirs}
        profile={profile}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
      />

      {/* Bottom save bar */}
      {editing && (
        <SaveBar
          variant="bottom"
          isNewUser={isNewUser}
          saving={saving}
          onCancel={cancelEdit}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitClick}
        />
      )}
    </div>
  );
}