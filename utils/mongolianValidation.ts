export const isMongolian = (v: string) =>
  !v || /^[А-ЯӨҮЁа-яөүё\s\-\.]+$/.test(v.trim());

// ✅ Тоо, тэмдэг зөвшөөрдөг — баг/хороо, хаяг зэрэгт
export const isMongolianWithDigits = (v: string) =>
  !v || /^[А-ЯӨҮЁа-яөүё\s\d\-\/\.,"'()]+$/.test(v.trim());

export const mongolianFields: Record<string, string> = {
  company_name: "Байгууллагын нэр",
  sum_duureg:   "Сум / Дүүрэг",
  address:      "Дэлгэрэнгүй хаяг",
  family_name:  "Ургийн овог",
  last_name:    "Овог",
  first_name:   "Нэр",
  bag_horoo:    "Баг / Хороо",
};

export function validateMongolianForm(
  form: Record<string, any>,
  fields: string[]
): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const key of fields) {
    if (!form[key]) continue;
    // ✅ bag_horoo болон address-д тоо, тэмдэг зөвшөөрнө
    const allowDigits = ["bag_horoo", "address"].includes(key);
    const valid = allowDigits
      ? isMongolianWithDigits(form[key])
      : isMongolian(form[key]);
    if (!valid) {
      errs[key] = `${mongolianFields[key] || key} монгол үсгээр бичнэ үү`;
    }
  }
  return errs;
}

export function validateOwnersMongolian(owners: any[]): Record<string, string> {
  const errs: Record<string, string> = {};
  for (let i = 0; i < owners.length; i++) {
    const o = owners[i];
    for (const key of ["last_name", "first_name"]) {
      if (o[key] && !isMongolian(o[key])) {
        errs[`owner_${i}_${key}`] = "Крилл үсгээр бичнэ үү";
      }
    }
  }
  return errs;
}