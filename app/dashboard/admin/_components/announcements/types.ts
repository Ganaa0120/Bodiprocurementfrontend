export type AnnType = "open" | "targeted" | "rfq";

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
};

export type AttachedFile = {
  name: string;
  size: number;
  type: string;
  url: string;
  isImage: boolean;
};
