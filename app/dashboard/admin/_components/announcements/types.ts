export type AnnType = "open" | "targeted" | "rfq";

export type ProcurementKind = "goods" | "service";

export type Ann = {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  ann_type: AnnType;
  status: string;
  is_urgent?: boolean;
  is_mine?: boolean;
  category_id?: string;
  category_name?: string;
  activity_directions?: string[];
  budget_from?: number;
  budget_to?: number;
  currency?: string;
  deadline?: string;
  published_at?: string;
  created_at: string;
  created_by_name?: string;
  created_by_role?: string;
  view_count?: number;
  rfq_quantity?: number;
  rfq_unit?: string;
  rfq_delivery_place?: string;
  rfq_delivery_date?: string;
  rfq_specs?: string;
  attachments?: AttachedFile[];

  // ── Шинэ талбарууд ────────────────────────────────────────
  client_company?: string;
  responsible_person_name?: string;
  responsible_position?: string;
  contact_phone?: string;
  start_date?: string;
  end_date?: string;
  procurement_kind?: ProcurementKind;
  supply_start_date?: string;
  supply_end_date?: string;
  central_location?: string;
  branch_location?: string;
  address_details?: string;
  buyer_doc_info?: string;
  buyer_attachments?: AttachedFile[];
  supplier_doc_info?: string;
  supplier_required_docs?: AttachedFile[];
};

export type AttachedFile = {
  name: string;
  size: number;
  type: string;
  url: string;
  isImage: boolean;
};