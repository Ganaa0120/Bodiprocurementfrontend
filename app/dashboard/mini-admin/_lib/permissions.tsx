import {
  BarChart3, Bell, Building2, Users, FileText,
  ShieldCheck, FolderTree, Activity,
} from "lucide-react";
import { ReactNode } from "react";

export type NavId =
  | "dashboard" | "individuals" | "companies"
  | "notifications" | "announcements"
  | "sub-admins" | "categories" | "directions";

export type NavItem = {
  id: NavId | string;
  label: string;
  icon: ReactNode;
};

export const NAV_PERMS: NavItem[] = [
  { id: "dashboard", label: "Хянах самбар", icon: <BarChart3 size={18} /> },
  { id: "notifications", label: "Мэдэгдэл", icon: <Bell size={18} /> },
  { id: "companies", label: "Компаниуд", icon: <Building2 size={18} /> },
  { id: "individuals", label: "Хувь хүн", icon: <Users size={18} /> },
  { id: "announcements", label: "Зарлалууд", icon: <FileText size={18} /> },
  { id: "sub-admins", label: "Брокерууд", icon: <ShieldCheck size={18} /> },
  { id: "categories", label: "Ангилалууд", icon: <FolderTree size={18} /> },
  { id: "directions", label: "Үйл ажиллагааны чиглэл", icon: <Activity size={18} /> },
];

export const SUB_PERMS: Record<string, { id: string; label: string; desc: string }[]> = {
  notifications: [
    { id: "notifications.view", label: "Харах", desc: "Мэдэгдлийн жагсаалт" },
    { id: "notifications.send", label: "Илгээх", desc: "Мэдэгдэл илгээх" },
  ],
  companies: [
    { id: "companies.view", label: "Харах", desc: "Компанийн жагсаалт" },
    { id: "companies.edit_status", label: "Статус солих", desc: "Компанийн статус" },
    { id: "companies.edit", label: "Засах", desc: "Мэдээлэл засах" },
    { id: "companies.delete", label: "Устгах", desc: "Компани устгах" },
  ],
  individuals: [
    { id: "individuals.view", label: "Харах", desc: "Хувь хүний жагсаалт" },
    { id: "individuals.edit_status", label: "Статус солих", desc: "Статус өөрчлөх" },
    { id: "individuals.edit", label: "Засах", desc: "Мэдээлэл засах" },
    { id: "individuals.delete", label: "Устгах", desc: "Хувь хүн устгах" },
  ],
  announcements: [
    { id: "announcements.view", label: "Харах", desc: "Зарлалууд харах" },
    { id: "announcements.create", label: "Үүсгэх", desc: "Шинэ зарлал" },
    { id: "announcements.edit", label: "Засах", desc: "Зарлал засах" },
    { id: "announcements.publish", label: "Нийтлэх", desc: "Статус солих" },
    { id: "announcements.delete", label: "Устгах", desc: "Зарлал устгах" },
  ],
  categories: [
    { id: "categories.view", label: "Харах", desc: "Ангилалууд харах" },
    { id: "categories.manage", label: "Удирдах", desc: "Ангилал нэмэх/засах" },
  ],
  directions: [
    { id: "directions.view", label: "Харах", desc: "Чиглэлүүд харах" },
    { id: "directions.manage", label: "Удирдах", desc: "Чиглэл нэмэх/засах" },
  ],
};

const OLD_FORMAT_MAP: Record<string, string[]> = {
  dashboard: ["dashboard.view"],
  notifications: ["notifications.view", "notifications.send"],
  companies: ["companies.view", "companies.edit_status", "companies.edit", "companies.delete"],
  individuals: ["individuals.view", "individuals.edit_status", "individuals.edit", "individuals.delete"],
  categories: ["categories.view", "categories.manage"],
  directions: ["directions.view", "directions.manage"],
  announcements: ["announcements.view", "announcements.create", "announcements.edit", "announcements.publish", "announcements.delete"],
  admins: ["admins.view", "admins.manage"],
};

export function parsePerms(raw: any): string[] {
  if (!raw) return ["dashboard", "dashboard.view"];
  let arr: string[] = [];
  if (Array.isArray(raw)) arr = raw;
  else {
    try { arr = JSON.parse(raw); } 
    catch { arr = ["dashboard", "dashboard.view"]; }
  }
  if (arr.length === 0) return ["dashboard", "dashboard.view"];
  const isOldFormat = arr.every((p: string) => !p.includes("."));
  if (isOldFormat) {
    return [...new Set(arr.flatMap((id: string) => OLD_FORMAT_MAP[id] ?? [id]))];
  }
  return arr;
}