const steps = [
  {
    step: "01",
    title:
      "Монгол Улсын хууль тогтоомжийн дагуу бүртгэлтэй хуулийн этгээд байх",
    description:
      "Нийлүүлэгч нь албан ёсны бүртгэлтэй, хууль ёсны эрх бүхий байгууллага байх. Бүртгэлгүй, хувийн этгээд болон хууль бус ажиллагаа оролцож болохгүй",
  },
  {
    step: "02",
    title: "Татвар, нийгмийн даатгалын өр төлбөргүй байх",
    description:
      "Нийлүүлэгч нь төрийн байгууллагуудад төлөх татвар, нийгмийн даатгалын өргүй байх. Санхүүгийн болон хууль ёсны асуудалгүй байх",
  },
  {
    step: "03",
    title: "Үйл ажиллагааны туршлага, мэргэжлийн чадавхтай байх",
    description:
      "Тухайн бүтээгдэхүүн, үйлчилгээний салбарт хангалттай туршлагатай, Үйл ажиллагааны баг, тоног төхөөрөмж, мэргэжлийн ур чадвартай байх",
  },
  {
    step: "04",
    title: "Чанар, аюулгүй байдлын шаардлагыг хангах",
    description:
      "Хүргэлт, үйлчилгээ, барааны чанарын стандарттай байх. Аюулгүй ажиллагааны дүрэм, эрсдэлээс сэргийлэх арга хэмжээг мөрдөх. Компанийн шаардлагад нийцсэн чанар, найдвартай байдлыг хангах",
  },
];

export function HowItWorks() {
  return (
    <section id="HowItWorks" className="py-24 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1.5 rounded-full border border-border text-sm text-muted-foreground font-medium bg-card">
            Шаардлага
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground text-balance mb-4 text-slate-700">
          Нийлүүлэгчдэд тавигдах ерөнхий шаардлага
        </h2>
        <p className="text-center text-muted-foreground max-w-xl mx-auto leading-relaxed mb-16">
          Манай худалдан авалтын үйл ажиллагаанд оролцох нийлүүлэгч нь дараах
          ерөнхий шаардлагуудыг хангаж байх ёстой
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-card rounded-2xl border border-border p-7 flex gap-5"
            >
              <div className="text-3xl font-bold text-primary/20 font-mono shrink-0 leading-none mt-0.5">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2 text-slate-700">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
