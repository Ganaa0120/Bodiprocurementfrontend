export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const AIMAG = [
  "Улаанбаатар","Архангай","Баян-Өлгий","Баянхонгор","Булган","Говь-Алтай",
  "Говьсүмбэр","Дархан-Уул","Дорноговь","Дорнод","Дундговь","Завхан",
  "Орхон","Өвөрхангай","Өмнөговь","Сүхбаатар","Сэлэнгэ","Төв","Увс",
  "Ховд","Хөвсгөл","Хэнтий",
];

export const BLANK: any = {
  register_number:"", state_registry_number:"",
  company_name:"", company_name_en:"", company_type:"ХХК",
  established_date:"", is_vat_payer:false, is_iso_certified:false,
  employee_count:"", has_special_permission:false,
  special_permission_number:"", special_permission_expiry:"",
  aimag_niislel:"", sum_duureg:"", bag_horoo:"", address:"",
  bank_name:"", bank_account_number:"", vat_number:"",
  swift_code:"", iban:"", currency:"MNT", phone:"",
  activity_description:"", supply_direction:"",
};

export const BLANK_OWNER = {
  family_name:"", last_name:"", first_name:"",
  gender:"", position:"", phone:"", email:"",
};

export const BLANK_EXEC = {
  position: "Гүйцэтгэх захирал",
  last_name: "",
  first_name: "",
  phone: "",
  email: "",
};

export const BLANK_FINAL = { last_name:"", first_name:"" };