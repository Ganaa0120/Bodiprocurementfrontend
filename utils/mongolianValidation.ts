export const isMongolian = (v: string) =>
  !v || /^[А-ЯӨҮЁа-яөүё\s\-\.]+$/.test(v.trim());

export const mongolianFields: Record<string, string> = {
  company_name:  "Байгууллагын нэр",
  bag_horoo:     "Баг / Хороо",
  sum_duureg:    "Сум / Дүүрэг",
  address:       "Дэлгэрэнгүй хаяг",
  family_name:   "Ургийн овог",
  last_name:     "Овог",
  first_name:    "Нэр",
};

export function validateMongolianForm(
  form: Record<string, any>,
  fields: string[]
): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const key of fields) {
    if (form[key] && !isMongolian(form[key])) {
      errs[key] = `${mongolianFields[key] || key} монгол үсгээр бичнэ үү`;
    }
  }
  return errs;
}

// ✅ Record<string, string> буцаана — string | null биш
export function validateOwnersMongolian(owners: any[]): Record<string, string> {
  const errs: Record<string, string> = {};
  for (let i = 0; i < owners.length; i++) {
    const o = owners[i];
    for (const key of ["family_name", "last_name", "first_name"]) {
      if (o[key] && !isMongolian(o[key])) {
        errs[`owner_${i}_${key}`] = "Монгол үсгээр бичнэ үү";
      }
    }
  }
  return errs;
}