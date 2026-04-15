export type Category = {
  id: string;
  category_prefix?: string;  // ✅ нэмэх
  category_number: number;
  category_name: string;
  parent_id: string | null;
  status: string;
  created_at?: string;
  children?: Category[];
};