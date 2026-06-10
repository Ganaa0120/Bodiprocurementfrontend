// ════════════════════════════════════════════════════════════════
//  AnnModal — тогтмол өгөгдөл, default form, styling
//  Энэ файлд логик байхгүй — зөвхөн дата, төрөл, style
// ════════════════════════════════════════════════════════════════
import type { CSSProperties } from "react";
import { inp } from "./constants";
import type { Ann, AttachedFile } from "./types";

// ── Монгол: Аймаг / Улаанбаатарын дүүрэг ──
export const MN_LOCATIONS = [
  "Улаанбаатар",
  "Архангай",
  "Баян-Өлгий",
  "Баянхонгор",
  "Булган",
  "Говь-Алтай",
  "Говьсүмбэр",
  "Дархан-Уул",
  "Дорноговь",
  "Дорнод",
  "Дундговь",
  "Завхан",
  "Орхон",
  "Өвөрхангай",
  "Өмнөговь",
  "Сэлэнгэ",
  "Сүхбаатар",
  "Төв",
  "Увс",
  "Ховд",
  "Хөвсгөл",
  "Хэнтий",
];

export const UB_DISTRICTS = [
  "Багануур дүүрэг",
  "Багахангай дүүрэг",
  "Баянгол дүүрэг",
  "Баянзүрх дүүрэг",
  "Налайх дүүрэг",
  "Сонгинохайрхан дүүрэг",
  "Сүхбаатар дүүрэг",
  "Хан-Уул дүүрэг",
  "Чингэлтэй дүүрэг",
];

// ── Default form values ──
export const defaultForm = (ann?: Ann | null) => ({
  title: ann?.title ?? "",
  description: ann?.description ?? "",
  requirements: ann?.requirements ?? "",
  category_id: ann?.category_id ?? "",
  budget_from: ann?.budget_from?.toString() ?? "",
  budget_to: ann?.budget_to?.toString() ?? "",
  currency: ann?.currency ?? "MNT",
  deadline: ann?.deadline?.slice(0, 10) ?? "",
  status: ann?.status ?? "draft",
  is_urgent: ann?.is_urgent ?? false,
  activity_directions:
    ann?.activity_directions ??
    ([] as Array<{ main_id: number; sub_ids: number[] }>),
  rfq_quantity: ann?.rfq_quantity?.toString() ?? "",
  rfq_unit: ann?.rfq_unit ?? "",
  rfq_delivery_place: ann?.rfq_delivery_place ?? "",
  rfq_delivery_date: ann?.rfq_delivery_date?.slice(0, 10) ?? "",
  rfq_specs: ann?.rfq_specs ?? "",
  recipient_type: "individual" as "individual" | "company",
  attachments: ann?.attachments ?? ([] as AttachedFile[]),
  recipient_ids: [] as string[],

  // Шинэ талбарууд
  client_company: ann?.client_company ?? "",
  responsible_person_name: ann?.responsible_person_name ?? "",
  responsible_position: ann?.responsible_position ?? "",
  contact_phone: ann?.contact_phone ?? "",
  start_date: ann?.start_date?.slice(0, 10) ?? "",
  end_date: ann?.end_date?.slice(0, 10) ?? "",
  procurement_kind: (ann?.procurement_kind ?? "goods") as "goods" | "service",
  supply_start_date: ann?.supply_start_date?.slice(0, 10) ?? "",
  supply_end_date: ann?.supply_end_date?.slice(0, 10) ?? "",
  central_location: ann?.central_location ?? "",
  branch_location: ann?.branch_location ?? "",
  address_details: ann?.address_details ?? "",
  buyer_doc_info: ann?.buyer_doc_info ?? "",
  buyer_attachments: ann?.buyer_attachments ?? ([] as AttachedFile[]),
  supplier_doc_info: ann?.supplier_doc_info ?? "",
  supplier_required_docs: ann?.supplier_required_docs ?? ([] as AttachedFile[]),
  invitation_permission_types:
    ann?.invitation_permission_types ?? ([] as string[]),

  // ⭐ Гар аргаар сонгосон урилгын хүлээн авагчид
  invitation_company_ids:
    (ann as any)?.invitation_company_ids ?? ([] as string[]),
  invitation_person_ids:
    (ann as any)?.invitation_person_ids ?? ([] as string[]),
});

// Бүх section энэ төрлийг ашиглана
export type AnnForm = ReturnType<typeof defaultForm>;

// ── Input styling shortcuts ──
export const inputStyle: CSSProperties = {
  ...inp,
  height: 44,
  background: "#334155",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "white",
};

export const innerInputStyle: CSSProperties = {
  ...inp,
  height: 40,
  background: "#1e293b",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "white",
};