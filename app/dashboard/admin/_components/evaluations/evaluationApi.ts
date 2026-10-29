// Нийлүүлэгчийн үнэлгээний API (зөвхөн админ)
import { API, jsonH } from "../announcements/constants";

export type EvalCategory = "goods" | "service";
export type WinnerStage = "in_progress" | "to_rate" | "rated";
export type ReevalStatus = "pending" | "approved" | "rejected" | "used";

export interface ReevalRequest {
  id: number | string;
  status: ReevalStatus;
  reason: string;
  decision_note: string | null;
  created_at: string;
  decided_at: string | null;
  bid_id: string;
  current_score: number | null;
  requester_name: string | null;
  requester_company: string | null;
  announcement_title: string | null;
  supplier_name: string | null;
}

export interface ScorePart {
  score: number;
  rated_count: number;
}
export interface SupplierSummary {
  goods: ScorePart | null;
  service: ScorePart | null;
  /** Бараа + үйлчилгээ нийлсэн (хүснэгтэд) */
  overall?: ScorePart | null;
}

export interface HistoryRow {
  id: number | string;
  bid_id: string;
  category: EvalCategory;
  created_at: string;
  general_comment: string | null;
  total_pct: number;
  announcement_title: string;
  buyer_company: string | null;
  evaluator_name: string | null;
  evaluator_company: string | null;
  evaluator_role: string;
  scores: { criterion_id: number | string; criterion_name: string; score: number; comment: string | null }[];
}

export interface Winner {
  bid_id: string;
  supplier_id: string;
  supplier_type: "company" | "individual";
  supplier_name: string;
  supplier_email?: string | null;
  supplier_phone?: string | null;
  price_offer?: number | string | null;
  delivery_date?: string | null;
  awarded_at?: string | null;
  fulfilled_at?: string | null;
  announcement_id: string;
  announcement_title: string;
  category: EvalCategory;
  currency?: string | null;
  buyer_company?: string | null;
  evaluation_count: number;
  bid_score: number | null;
  my_score: number | null;
  stage: WinnerStage;
  can_mark_fulfilled: boolean;
  /** Super admin дахин үнэлэх хүсэлтийг зөвшөөрсөн үед л true */
  can_edit_my_evaluation: boolean;
  /** Миний сүүлийн дахин үнэлэх хүсэлтийн төлөв */
  my_reeval_status?: ReevalStatus | null;
  supplier_summary?: SupplierSummary | null;
}

export interface Criterion {
  id: number | string;
  code: string;
  name: string;
  weight_pct: number | string;
  comment_required_max: number;
  anchors: Record<string, string>;
}

export interface EvaluationRow {
  id: number | string;
  evaluator_id: string;
  evaluator_name: string | null;
  evaluator_company: string | null;
  evaluator_role: string;
  general_comment: string | null;
  total_pct: number;
  created_at: string;
  mine: boolean;
  scores: { criterion_id: number | string; criterion_name: string; weight_pct: number | string; score: number; comment: string | null }[];
}

export interface WinnerDetail {
  winner: Winner;
  criteria: Criterion[];
  evaluations: EvaluationRow[];
  my_evaluation: EvaluationRow | null;
  supplier_summary: SupplierSummary | null;
  my_reevaluation: { id: number | string; status: ReevalStatus; reason: string; decision_note: string | null } | null;
}

export interface SupplierJob {
  bid_id: string;
  announcement_id: string;
  announcement_title: string;
  category: EvalCategory;
  currency?: string | null;
  price_offer?: number | string | null;
  buyer_company?: string | null;
  awarded_at?: string | null;
  fulfilled_at?: string | null;
  bid_score: number | null;
  evaluations: HistoryRow[];
}

export class ApiFailure extends Error {
  fieldErrors?: Record<string, string>;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}/api/evaluations${path}`, {
    method,
    headers: jsonH(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    const err = new ApiFailure(data?.message || `Алдаа гарлаа (${res.status})`);
    err.fieldErrors = data?.fieldErrors;
    throw err;
  }
  return data as T;
}

export const evaluationApi = {
  winners: () => request<{ winners: Winner[] }>("GET", "/winners"),
  detail: (bidId: string) => request<WinnerDetail>("GET", `/bids/${encodeURIComponent(bidId)}`),
  fulfill: (bidId: string) => request<{ winner: Winner }>("POST", `/bids/${encodeURIComponent(bidId)}/fulfill`),
  save: (
    bidId: string,
    body: { scores: { criterionId: string | number; score: number; comment?: string }[]; generalComment?: string },
  ) => request<WinnerDetail>("PUT", `/bids/${encodeURIComponent(bidId)}/my`, body),
  /** Дахин үнэлэх хүсэлт илгээх */
  requestReevaluation: (bidId: string, reason: string) =>
    request<WinnerDetail>("POST", `/bids/${encodeURIComponent(bidId)}/reevaluation-request`, { reason }),
  /** Super admin: дахин үнэлэх хүсэлтүүд */
  reevalRequests: (status: "pending" | "all" = "pending") =>
    request<{ requests: ReevalRequest[] }>("GET", `/reevaluation-requests?status=${status}`),
  /** Super admin: зөвшөөрөх / татгалзах */
  decideReeval: (id: string | number, status: "approved" | "rejected", note?: string) =>
    request<{ request: unknown }>("PATCH", `/reevaluation-requests/${encodeURIComponent(String(id))}`, { status, note }),
  /** Хүснэгтийн баганад: { [supplier_id]: SupplierSummary } */
  ratings: (type: "company" | "individual") =>
    request<{ ratings: Record<string, SupplierSummary> }>("GET", `/ratings?type=${type}`),
  /** Нийлүүлэгчийн бүх ажил (ялсан бараа / үйлчилгээ) + тус бүрийн үнэлгээ */
  jobs: (type: "company" | "individual", id: string) =>
    request<{ summary: SupplierSummary; jobs: SupplierJob[] }>(
      "GET",
      `/suppliers/${type}/${encodeURIComponent(id)}/jobs`,
    ),
  /** Group-ийн бүх охин компанийн өгсөн үнэлгээ, тайлбартай */
  history: (type: "company" | "individual", id: string) =>
    request<{ history: HistoryRow[] }>("GET", `/suppliers/${type}/${encodeURIComponent(id)}/history`),
  supplier: (type: "company" | "individual", id: string, months?: number) =>
    request<{ summary: SupplierSummary }>(
      "GET",
      `/suppliers/${type}/${encodeURIComponent(id)}${months ? `?months=${months}` : ""}`,
    ),
};

export const KIND_LABEL: Record<EvalCategory, string> = { goods: "Бараа материал", service: "Ажил, үйлчилгээ" };

/** 100 онооны өнгө */
export const scoreColor = (v: number | null | undefined) =>
  v == null ? "#64748b" : v >= 85 ? "#34d399" : v >= 70 ? "#fbbf24" : "#f87171";