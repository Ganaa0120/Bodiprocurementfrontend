export type Notif = {
  id: string; title: string; message?: string; image_url?: string;
  recipient_type: "all" | "individual" | "company";
  is_read: boolean; is_active: boolean; is_mine?: boolean;
  status: string; created_at: string;
  sent_by_name?: string; sent_by_company?: string;
  sent_by_role?: string; sent_by_email?: string;
  announcement_title?: string;
};

export const recipientLabel = (type: string) => {
  if (type === "all")        return { l:"Бүгдэд",     color:"#10b981", bg:"rgba(16,185,129,0.12)" };
  if (type === "individual") return { l:"Хувь хүн",   color:"#3b82f6", bg:"rgba(59,130,246,0.12)" };
  return                            { l:"Байгааллага", color:"#a78bfa", bg:"rgba(167,139,250,0.12)" };
};