import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  BarChart3,
  Zap,
  Handshake,
  Scale,
} from "lucide-react";

const features = [
  {
    title: "Хууль, журмын нийцэл",
    description:
      "Худалдан авалтын үйл ажиллагаа нь Монгол Улсын хууль тогтоомж, компанийн дотоод журам, холбогдох стандартуудтай бүрэн нийцсэн байна.",
    icon: <Scale className="w-6 h-6" />,
  },
  {
    title: "Ашиг сонирхлын зөрчлөөс ангид байх",
    description:
      "Хувийн ашиг сонирхол нь худалдан авалтын шийдвэрт нөлөөлөхөөс сэргийлж, хараат бус, шударга байдлыг хангана.",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    title: "Шударга өрсөлдөөнийг дэмжих",
    description:
      "Нийлүүлэгч бүрт тэгш боломж олгож, өрсөлдөөнт сонгон шалгаруулалтыг нээлттэй явуулна.",
    icon: <Users className="w-6 h-6" />,
  },
  {
    title: "Тэгш, ил тод оролцоо",
    description:
      "Бүх оролцогчдод ижил мэдээлэл, ижил шалгуур үйлчилж, үнэлгээний үйл явц ил тод байна.",
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    title: "Ёс зүй, хариуцлагатай хамтын ажиллагаа",
    description:
      "Ёс зүйн дүрмийг баримталж, авлига, хээл хахууль, хууль бус аливаа үйлдлийг үл зөвшөөрнө.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: "Үр ашиг ба урт хугацааны түншлэл",
    description:
      "Чанар, үнэ, найдвартай байдлыг оновчтой хослуулж, урт хугацаанд хамтран ажиллах түншлэлийг эрхэмлэнэ.",
    icon: <Handshake className="w-6 h-6" />,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground text-balance mb-4 text-slate-700">
          Худалдан авалтын бодлого
        </h2>
        <p className="text-center text-muted-foreground max-w-5xl mx-auto leading-relaxed mb-16">
          Бодь Групп нь худалдан авалтын үйл ажиллагааг компанийн{" "}
          <span className="text-[#F58220] font-medium">
            урт хугацааны стратеги
          </span>
          , хууль эрх зүйн орчин болон ёс зүйн зарчимд нийцүүлэн ил тод, үр
          ашигтайгаар хэрэгжүүлдэг.
        </p>

        {/* Feature grid — FeaturesSectionDemo layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  // 3-column grid: border-r every col except last in row
  // border-b for first row (index 0,1,2), border-l for first col each row
  const isFirstCol = index % 3 === 0;
  const isTopRow = index < 3;

  return (
    <div
      className={cn(
        "flex flex-col py-10 relative group/feature border-neutral-200 dark:border-neutral-800 cursor-pointer",
        "lg:border-r",
        isFirstCol && "lg:border-l",
        isTopRow && "lg:border-b",
      )}
    >
      {/* Hover gradient — top row flows down, bottom row flows up */}
      {isTopRow ? (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      ) : (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}

      {/* Icon */}
      <div className="mb-4 relative z-10 px-10 text-[#0C72BA]">{icon}</div>

      {/* Title with left accent bar */}
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-[#F58220] transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-slate-700 dark:text-neutral-100">
          {title}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
