// lib/statusConfig.ts — эсвэл тухайн файлын дээр
const STATUS_CFG = {
  active:   { label:"Баталгаажсан",  color:"#10b981", bg:"rgba(16,185,129,0.12)",  dot:"#10b981"  },
  pending:  { label:"Хянагдаж байна", color:"#f59e0b", bg:"rgba(245,158,11,0.12)",  dot:"#f59e0b"  },
  returned: { label:"Буцаагдсан",    color:"#ef4444", bg:"rgba(239,68,68,0.12)",   dot:"#ef4444"  },
};
const getStatus = (s: string) => STATUS_CFG[s as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;