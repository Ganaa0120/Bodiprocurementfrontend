import { Check } from "lucide-react";

const plans = [
  {
    name: "Давуу тал 1",
    description:
      "Бага хэмжээний нийлүүлэгчид болон шинэ оролцогчдод тохиромжтой. Системд бүртгүүлснээр дараах давуу талуудыг эдлэх боломжтой:",
    features: [
      "Тендер, үнийн саналд оролцох боломж",
      "Цахим баримт бичгийг хурдан илгээх",
      "Сонгон шалгаруулалтын явцыг хянах",
      "Нэг багийн гишүүн оролцуулах",
      "Үндсэн тайлан, хяналт",
    ],
    highlighted: false,
  },
  {
    name: "Давуу тал 2",
    description:
      "Илүү өргөн боломж, үр ашгийг нэмэгдүүлэхэд зориулагдсан хувилбар. Бүртгүүлснээр нийлүүлэгч та:",
    features: [
      "Хязгааргүй тендерт оролцох",
      "Цахим системээр бүх баримт бичгийг удирдах",
      "Сонгон шалгаруулалтын явцыг бодитоор хянах",
      "Багт 10 хүртэл гишүүн оролцуулах",
      "Нарийвчилсан тайлан, үзүүлэлт харах",
      "Үр ашгийг нэмэгдүүлэх автомат AI дүгнэлт",
    ],
    highlighted: true,
  },
  {
    name: "Давуу тал 3",
    description:
      "Томоохон байгууллагуудад зориулсан хувилбар. Бүртгүүлснээр нийлүүлэгч та:",
    features: [
      "Pro хувилбарын бүх давуу талуудыг эдлэх",
      "Хамгийн өндөр түвшний дэмжлэг, хяналт",
      "Custom интеграц, SSO/SAML нэвтрэлт",
      "Үр ашиг, найдвартай түншлэлийг урт хугацаанд хангах",
      "Audit log, SLA баталгаатай үйлчилгээ",
    ],
    highlighted: false,
  },
];

export function SupplierBenefits() {
  return (
    <section id="benefits" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1.5 rounded-full border border-border text-sm text-muted-foreground font-medium">
            Үр ашиг
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground text-balance mb-4 text-slate-700">
          Нийлүүлэгчдэд олдох давуу тал
        </h2>
        <p className="text-center text-muted-foreground max-w-5xl mx-auto leading-relaxed mb-16">
          Манай системд бүртгүүлснээр нийлүүлэгч та тендерт оролцох, баримт
          бичгийг илгээх, сонгон шалгаруулалтын явцыг хянах зэрэг үйл явцад
          хурдан, ил тод, үр ашигтай оролцох боломжтой.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-7 flex flex-col ${
                plan.highlighted
                  ? "bg-[#0C72BA] text-primary-foreground border-[#0C72BA] shadow-xl scale-[1.02]"
                  : "bg-card border-border"
              }`}
            >
              <div className="mb-6">
                <p
                  className={`text-sm font-semibold mb-1 ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                >
                  {plan.name}
                </p>
                <p
                  className={`text-sm mt-2 leading-relaxed ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`}
                    />
                    <span
                      className={
                        plan.highlighted
                          ? "text-primary-foreground"
                          : "text-foreground"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
