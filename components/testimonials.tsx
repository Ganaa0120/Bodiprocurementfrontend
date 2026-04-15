const testimonials = [
  {
    quote:
      "Bodi Group-тэй хамтран ажиллах нь үнэхээр амар, ил тод, үр ашигтай байлаа. Тендерийн мэдээлэл цаг тухайд нь ирдэг, бүх баримт бичгийг цахимаар илгээх боломжтой нь маш хялбар юм.",
    author: "Нийлүүлэгч А",
    role: "Head of Product, Verve",
    initials: "SC",
    color: "bg-primary",
  },
  {
    quote:
      "Бид дэлхийн хаанаас ч оролцож болно гэдэг нь үнэхээр давуу тал. Хугацаа, процесс ил тод тул ажиллахад найдвартай санагддаг.",
    author: "Нийлүүлэгч B",
    role: "Engineering Manager, Folio",
    initials: "ML",
    color: "bg-emerald-500",
  },
  {
    quote:
      "Чанар, аюулгүй байдал, ёс зүйтэй ажилладаг компани гэдгийг тэдний систем, процесс харуулж байна. Бид урт хугацааны түншлэлтэй хамтран ажиллахад итгэлтэй боллоо.",
    author: "Нийлүүлэгч C",
    role: "Talent Lead, Luminary",
    initials: "PN",
    color: "bg-teal-500",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1.5 rounded-full border border-border text-sm text-muted-foreground font-medium bg-card">
            Сэтгэгдэлүүд
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground text-balance mb-16 text-slate-700">
          Харилцагчдын сэтгэгдэл
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="bg-card rounded-2xl border border-border p-7 flex flex-col gap-5"
            >
              <p className="text-sm text-foreground leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center shrink-0`}
                >
                  <span className="text-xs font-bold text-white">
                    {t.initials}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
