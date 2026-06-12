"use client";
// ════════════════════════════════════════════════════════════════
//  AnnModal — энгийн form section-ууд
//  TypeSelector / BasicInfo / Schedule / Category / Rfq /
//  Recipients / Supply / Documents
// ════════════════════════════════════════════════════════════════
import {
  X,
  ChevronDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Layers,
  Zap,
  Building2,
  User,
  Briefcase,
  Phone,
  MapPin,
  Package,
  Wrench,
  FileText,
  ClipboardList,
  Truck,
  CalendarRange,
} from "lucide-react";
import { TYPE } from "./constants";
import type { AnnType } from "./types";
import {
  MN_LOCATIONS,
  UB_DISTRICTS,
  inputStyle,
  innerInputStyle,
} from "./annModal.config";
import type { AnnForm } from "./annModal.config";
import { Section, Field, FilePicker, RichTextEditor } from "./annModal.ui";
import { RecipientPicker } from "./RecipientPicker";
import { ActivityDirections } from "./ActivityDirections";

type Base = {
  form: AnnForm;
  setForm: React.Dispatch<React.SetStateAction<AnnForm>>;
  accentColor: string;
};

// ════════════════════════════════════════════════════════════════
//  TYPE SELECTOR — create flow эхэнд гарах төрөл сонгох цонх
// ════════════════════════════════════════════════════════════════
export function TypeSelector({
  onSelect,
  onClose,
}: {
  onSelect: (t: AnnType) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#1e293b",
          borderRadius: 24,
          padding: "28px 24px",
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.4)",
          animation: "fadeIn 0.2s ease",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <h2
              style={{ fontSize: 18, fontWeight: 700, color: "white", margin: 0 }}
            >
              Урилагын төрөл сонгох
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              Зорилгоос хамааран сонгоно уу
            </p>
          </div>
          <button
  onClick={onClose}
  style={{
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    width: 36,
    height: 36,
    cursor: "pointer",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
    e.currentTarget.style.color = "white";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
    e.currentTarget.style.color = "#94a3b8";
  }}
>
  <X size={18} />
</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(Object.entries(TYPE) as [AnnType, (typeof TYPE)[AnnType]][]).map(
            ([t, c]) => {
              const I = c.icon;
              return (
                <button
                  key={t}
                  onClick={() => onSelect(t)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    borderRadius: 16,
                    cursor: "pointer",
                    textAlign: "left",
                    background: "#334155",
                    border: `1px solid ${c.color}30`,
                    transition: "all 0.15s",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = c.color;
                    e.currentTarget.style.background = `${c.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${c.color}30`;
                    e.currentTarget.style.background = "#334155";
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      flexShrink: 0,
                      background: `${c.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <I size={22} style={{ color: c.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "white",
                        marginBottom: 4,
                      }}
                    >
                      {t === "open"
                        ? "Тендер нээлттэй"
                        : t === "targeted"
                          ? "Тендер хаалттай"
                          : "Үнийн санал"}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}
                    >
                      {c.desc}
                    </div>
                  </div>
                  <ChevronDown size={16} style={{ color: "#64748b" }} />
                </button>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  1. ҮНДСЭН МЭДЭЭЛЭЛ
// ════════════════════════════════════════════════════════════════
export function BasicInfoSection({ form, setForm, accentColor }: Base) {
  return (
    <Section title="Үндсэн мэдээлэл" icon={Building2} accentColor={accentColor}>
      <Field label="Захиалагч компани" required icon={Building2}>
        <input
          value={form.client_company}
          onChange={(e) =>
            setForm((p) => ({ ...p, client_company: e.target.value }))
          }
          style={innerInputStyle}
          placeholder="Захиалагч компанийн нэр"
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Хариуцах ажилтны нэр" required icon={User}>
          <input
            value={form.responsible_person_name}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                responsible_person_name: e.target.value,
              }))
            }
            style={innerInputStyle}
            placeholder="Овог нэр"
          />
        </Field>
        <Field label="Албан тушаал" required icon={Briefcase}>
          <input
            value={form.responsible_position}
            onChange={(e) =>
              setForm((p) => ({ ...p, responsible_position: e.target.value }))
            }
            style={innerInputStyle}
            placeholder="Албан тушаал"
          />
        </Field>
      </div>

      <Field label="Холбоо барих утас" required icon={Phone}>
        <input
          value={form.contact_phone}
          onChange={(e) =>
            setForm((p) => ({ ...p, contact_phone: e.target.value }))
          }
          style={innerInputStyle}
          placeholder="99000000"
          type="tel"
        />
      </Field>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════
//  2. ЗАРЛАЛЫН ХУГАЦАА
// ════════════════════════════════════════════════════════════════
export function ScheduleSection({ form, setForm, accentColor }: Base) {
  return (
    <Section
      title="Зарлалын хугацаа"
      icon={CalendarRange}
      accentColor={accentColor}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Эхлэх огноо" required icon={Calendar}>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm((p) => ({ ...p, start_date: e.target.value }))
            }
            style={innerInputStyle}
          />
        </Field>
        <Field label="Дуусах огноо" required icon={Calendar}>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) =>
              setForm((p) => ({ ...p, end_date: e.target.value }))
            }
            style={innerInputStyle}
          />
        </Field>
      </div>
      <Field label="Үнийн санал өгөх огноо" required icon={Calendar}>
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
          style={innerInputStyle}
        />
      </Field>
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════
//  3. ЗАРЫН ДЭЛГЭРЭНГҮЙ — ангилал, төрөл, чиглэл, тайлбар, төсөв
// ════════════════════════════════════════════════════════════════
export function CategorySection({
  form,
  setForm,
  accentColor,
  cats,
  dirs,
}: Base & { cats: any[]; dirs: any[] }) {
  return (
    <>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          color: "#cbd5e1",
          marginTop: 8,
          marginBottom: -4,
          letterSpacing: "0.05em",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <ClipboardList size={12} /> Зарын дэлгэрэнгүй мэдээлэл
      </div>

      {/* Ангилал */}
      <Field label="Ангилал" required icon={Layers}>
        <div style={{ position: "relative" }}>
          <select
            value={form.category_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, category_id: e.target.value }))
            }
            style={{
              ...inputStyle,
              cursor: "pointer",
              appearance: "none",
              paddingRight: 32,
            }}
          >
            <option value="" style={{ background: "#1e293b", color: "#94a3b8" }}>
              — Сонгох —
            </option>
            {cats.map((c) => (
              <option
                key={c.id}
                value={c.id}
                style={{ background: "#1e293b", color: "white" }}
              >
                {c.category_number}. {c.category_name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
        </div>
      </Field>

      {/* Худалдан авалтын төрөл + Яаралтай */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 12,
          alignItems: "end",
        }}
      >
        <Field label="Худалдан авалтын төрөл" required>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { v: "goods", label: "Бараа материал", icon: Package },
              { v: "service", label: "Ажил үйлчилгээ", icon: Wrench },
            ].map(({ v, label, icon: I }) => {
              const sel = form.procurement_kind === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, procurement_kind: v as any }))
                  }
                  style={{
                    flex: 1,
                    height: 44,
                    padding: "0 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    border: sel
                      ? `1px solid ${accentColor}`
                      : "1px solid rgba(255,255,255,0.12)",
                    background: sel ? `${accentColor}20` : "#334155",
                    color: sel ? accentColor : "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s",
                  }}
                >
                  <I size={14} />
                  {label}
                </button>
              );
            })}
          </div>
        </Field>

        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, is_urgent: !p.is_urgent }))}
          style={{
            height: 44,
            padding: "0 16px",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            border: form.is_urgent
              ? "1px solid #ef4444"
              : "1px solid rgba(255,255,255,0.15)",
            background: form.is_urgent
              ? "rgba(239,68,68,0.15)"
              : "rgba(255,255,255,0.05)",
            color: form.is_urgent ? "#f87171" : "#94a3b8",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
        >
          <Zap size={14} />
          {form.is_urgent ? "Яаралтай" : "Яаралтай биш"}
        </button>
      </div>

      {/* Үйл ажиллагааны чиглэл (accordion) */}
      <ActivityDirections
        form={form}
        setForm={setForm}
        dirs={dirs}
        accentColor={accentColor}
      />

      {/* Тайлбар */}
      <Field label="Тайлбар">
        <RichTextEditor
          value={form.description}
          onChange={(v: string) => setForm((p) => ({ ...p, description: v }))}
          placeholder="Дэлгэрэнгүй тайлбар..."
          files={form.attachments}
          onFilesChange={(files: any) =>
            setForm((p) => ({ ...p, attachments: files }))
          }
          accentColor={accentColor}
        />
      </Field>

      {/* Төсөв */}
      <Field label="Төсөв" icon={DollarSign}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 110px",
            gap: 8,
          }}
        >
          <input
            type="number"
            value={form.budget_from}
            onChange={(e) =>
              setForm((p) => ({ ...p, budget_from: e.target.value }))
            }
            style={inputStyle}
            placeholder="Доод дүн"
          />
          <input
            type="number"
            value={form.budget_to}
            onChange={(e) =>
              setForm((p) => ({ ...p, budget_to: e.target.value }))
            }
            style={inputStyle}
            placeholder="Дээд дүн"
          />
          <div style={{ position: "relative" }}>
            <select
              value={form.currency}
              onChange={(e) =>
                setForm((p) => ({ ...p, currency: e.target.value }))
              }
              style={{
                ...inputStyle,
                cursor: "pointer",
                appearance: "none",
                paddingRight: 28,
              }}
            >
              <option value="MNT" style={{ background: "#1e293b" }}>
                ₮ MNT
              </option>
              <option value="USD" style={{ background: "#1e293b" }}>
                $ USD
              </option>
              <option value="EUR" style={{ background: "#1e293b" }}>
                € EUR
              </option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </Field>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  RFQ — Үнийн санал (зөвхөн rfq төрөлд)
// ════════════════════════════════════════════════════════════════
export function RfqSection({ form, setForm, accentColor }: Base) {
  return (
    <Section title="Үнийн санал" icon={TrendingUp} accentColor={accentColor}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input
          type="number"
          value={form.rfq_quantity}
          onChange={(e) =>
            setForm((p) => ({ ...p, rfq_quantity: e.target.value }))
          }
          style={innerInputStyle}
          placeholder="Тоо хэмжээ"
        />
        <div style={{ position: "relative" }}>
          <select
            value={form.rfq_unit}
            onChange={(e) =>
              setForm((p) => ({ ...p, rfq_unit: e.target.value }))
            }
            style={{
              ...innerInputStyle,
              cursor: "pointer",
              appearance: "none",
              paddingRight: 28,
            }}
          >
            <option value="" style={{ background: "#1e293b", color: "#94a3b8" }}>
              Нэгж сонгох
            </option>
            {["Ширхэг", "Багц", "Хоног", "Боодол", "Хайрцаг", "Хос", "м3", "тонн"].map(
              (u) => (
                <option
                  key={u}
                  value={u}
                  style={{ background: "#1e293b", color: "white" }}
                >
                  {u}
                </option>
              ),
            )}
          </select>
          <ChevronDown
            size={12}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
      <input
        value={form.rfq_delivery_place}
        onChange={(e) =>
          setForm((p) => ({ ...p, rfq_delivery_place: e.target.value }))
        }
        style={innerInputStyle}
        placeholder="Хүргэлтийн газар"
      />
      <input
        type="date"
        value={form.rfq_delivery_date}
        onChange={(e) =>
          setForm((p) => ({ ...p, rfq_delivery_date: e.target.value }))
        }
        style={innerInputStyle}
      />
      <textarea
        value={form.rfq_specs}
        onChange={(e) => setForm((p) => ({ ...p, rfq_specs: e.target.value }))}
        rows={2}
        style={{
          ...innerInputStyle,
          height: "auto",
          resize: "vertical",
          padding: "10px 14px",
        }}
        placeholder="Техникийн тодорхойлолт"
      />
    </Section>
  );
}

// ════════════════════════════════════════════════════════════════
//  RECIPIENTS — Хэнд илгээх (targeted / rfq)
// ════════════════════════════════════════════════════════════════
export function RecipientsField({
  form,
  setForm,
  accentColor,
  dirs,
  annType,
}: Base & { dirs: any[]; annType: AnnType }) {
  return (
    <Field
      label="Хэнд илгээх"
      icon={User}
      hint={annType === "rfq" ? "сонгоогүй бол бүгдэд" : undefined}
    >
      <RecipientPicker
        form={form}
        setForm={setForm}
        directions={dirs}
        accentColor={accentColor}
        optional={annType === "rfq"}
      />
    </Field>
  );
}

// ════════════════════════════════════════════════════════════════
//  SUPPLY — нийлүүлэх хугацаа + байршил
// ════════════════════════════════════════════════════════════════
export function SupplySection({ form, setForm, accentColor }: Base) {
  return (
    <>
      {/* Нийлүүлэх хугацаа */}
      <Section
        title="Бараа материал / ажил үйлчилгээ нийлүүлэх хугацаа"
        icon={Truck}
        accentColor={accentColor}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <Field label="Эхлэх огноо" required icon={Calendar}>
            <input
              type="date"
              value={form.supply_start_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, supply_start_date: e.target.value }))
              }
              style={innerInputStyle}
            />
          </Field>
          <Field label="Дуусах огноо" required icon={Calendar}>
            <input
              type="date"
              value={form.supply_end_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, supply_end_date: e.target.value }))
              }
              style={innerInputStyle}
            />
          </Field>
        </div>
      </Section>

      {/* Нийлүүлэх байршил */}
      <Section
        title="Бараа материал нийлүүлэх байршил"
        icon={MapPin}
        accentColor={accentColor}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {/* Төв байршил — Аймаг/Хот */}
          <Field label="Худалдан авалтын төв байршил" required icon={MapPin}>
            <div style={{ position: "relative" }}>
              <select
                value={form.central_location}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    central_location: e.target.value,
                    branch_location: "", // хот солигдвол салбарыг арилгана
                  }))
                }
                style={{
                  ...innerInputStyle,
                  cursor: "pointer",
                  appearance: "none",
                  paddingRight: 28,
                }}
              >
                <option
                  value=""
                  style={{ background: "#1e293b", color: "#94a3b8" }}
                >
                  — Аймаг/Хот сонгох —
                </option>
                {MN_LOCATIONS.map((loc) => (
                  <option
                    key={loc}
                    value={loc}
                    style={{ background: "#1e293b", color: "white" }}
                  >
                    {loc === "Улаанбаатар" ? "🏙 " : "📍 "}
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              />
            </div>
          </Field>

          {/* Салбар — UB бол дүүрэг dropdown, бусад бол текст */}
          <Field
            label={
              form.central_location === "Улаанбаатар"
                ? "Дүүрэг"
                : "Салбар байршил"
            }
            required
            icon={MapPin}
            hint={
              form.central_location === "Улаанбаатар"
                ? undefined
                : "Сум/багийн нэр"
            }
          >
            {form.central_location === "Улаанбаатар" ? (
              <div style={{ position: "relative" }}>
                <select
                  value={form.branch_location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, branch_location: e.target.value }))
                  }
                  style={{
                    ...innerInputStyle,
                    cursor: "pointer",
                    appearance: "none",
                    paddingRight: 28,
                  }}
                >
                  <option
                    value=""
                    style={{ background: "#1e293b", color: "#94a3b8" }}
                  >
                    — Дүүрэг сонгох —
                  </option>
                  {UB_DISTRICTS.map((d) => (
                    <option
                      key={d}
                      value={d}
                      style={{ background: "#1e293b", color: "white" }}
                    >
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    pointerEvents: "none",
                  }}
                />
              </div>
            ) : (
              <input
                value={form.branch_location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, branch_location: e.target.value }))
                }
                style={innerInputStyle}
                placeholder={
                  form.central_location
                    ? `${form.central_location} аймгийн сум`
                    : "Эхлээд аймаг сонгоно уу"
                }
                disabled={!form.central_location}
              />
            )}
          </Field>
        </div>

        <Field label="Хаягийн дэлгэрэнгүй мэдээлэл">
          <textarea
            value={form.address_details}
            onChange={(e) =>
              setForm((p) => ({ ...p, address_details: e.target.value }))
            }
            rows={2}
            style={{
              ...innerInputStyle,
              height: "auto",
              resize: "vertical",
              padding: "10px 14px",
            }}
            placeholder="Дэлгэрэнгүй хаяг (байр, гудамж, хороо г.м.)"
          />
        </Field>
      </Section>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
//  DOCUMENTS — шаардлага + захиалагчийн/нийлүүлэгчийн баримт
// ════════════════════════════════════════════════════════════════
export function DocumentsSection({ form, setForm, accentColor }: Base) {
  return (
    <>
      {/* Нийлүүлэгчид тавигдах шаардлага */}
      <Field label="Нийлүүлэгчид тавигдах шаардлага">
        <RichTextEditor
          value={form.requirements}
          onChange={(v: string) => setForm((p) => ({ ...p, requirements: v }))}
          placeholder="Тусгай зөвшөөрөл, туршлага, мэргэжлийн шаардлага..."
          files={[]}
          onFilesChange={() => {}}
          accentColor={accentColor}
        />
      </Field>

      {/* Захиалагчийн баримт бичиг */}
      <Section
        title="Захиалагчийн баримт бичиг"
        icon={FileText}
        accentColor={accentColor}
      >
        <Field label="Захиалагчийн баримт бичигтэй холбоотой мэдээлэл">
          <RichTextEditor
            value={form.buyer_doc_info}
            onChange={(v: string) =>
              setForm((p) => ({ ...p, buyer_doc_info: v }))
            }
            placeholder="Захиалагчийн талаас өгөх баримт бичгийн тайлбар..."
            files={[]}
            onFilesChange={() => {}}
            accentColor={accentColor}
          />
        </Field>
        <Field label="Захиалагчийн баримт бичиг" hint="олон файл">
          <FilePicker
            files={form.buyer_attachments}
            onChange={(files) =>
              setForm((p) => ({ ...p, buyer_attachments: files }))
            }
            accentColor={accentColor}
            label="Файл хуулах"
          />
        </Field>
      </Section>

      {/* Нийлүүлэгчээс авах баримт */}
      <Section
        title="Нийлүүлэгчээс авах баримт бичиг"
        icon={ClipboardList}
        accentColor={accentColor}
      >
        <Field label="Нийлүүлэгчийн баримт бичигтэй холбоотой мэдээлэл">
          <RichTextEditor
            value={form.supplier_doc_info}
            onChange={(v: string) =>
              setForm((p) => ({ ...p, supplier_doc_info: v }))
            }
            placeholder="Нийлүүлэгчээс шаардах баримтын тайлбар..."
            files={[]}
            onFilesChange={() => {}}
            accentColor={accentColor}
          />
        </Field>
        <Field label="Нийлүүлэгчээс авах загвар бичиг баримт" hint="олон файл">
          <FilePicker
            files={form.supplier_required_docs}
            onChange={(files) =>
              setForm((p) => ({ ...p, supplier_required_docs: files }))
            }
            accentColor={accentColor}
            label="Файл хуулах"
          />
        </Field>
      </Section>
    </>
  );
}