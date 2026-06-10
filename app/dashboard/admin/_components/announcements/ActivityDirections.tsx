"use client";
// ════════════════════════════════════════════════════════════════
//  Үйл ажиллагааны чиглэл — accordion (үндсэн → дэд)
//  Өөрийн дотоод state (expandedMains) болон helper-үүдтэй
// ════════════════════════════════════════════════════════════════
import { useState } from "react";
import { ChevronDown, CheckCircle2, Layers } from "lucide-react";
import { Field } from "./annModal.ui";
import type { AnnForm } from "./annModal.config";

export function ActivityDirections({
  form,
  setForm,
  dirs,
  accentColor,
}: {
  form: AnnForm;
  setForm: React.Dispatch<React.SetStateAction<AnnForm>>;
  dirs: any[];
  accentColor: string;
}) {
  const [expandedMains, setExpandedMains] = useState<Set<number>>(new Set());

  if (!dirs || dirs.length === 0) return null;

  const toggleExpand = (mainId: number) => {
    setExpandedMains((prev) => {
      const next = new Set(prev);
      if (next.has(mainId)) next.delete(mainId);
      else next.add(mainId);
      return next;
    });
  };

  const toggleSub = (mainId: number, subId: number) => {
    setForm((p) => {
      const dd: Array<{ main_id: number; sub_ids: number[] }> = [
        ...(p.activity_directions as any),
      ];
      const idx = dd.findIndex((d) => d.main_id === mainId);
      if (idx === -1) {
        dd.push({ main_id: mainId, sub_ids: [subId] });
      } else {
        const cur = dd[idx];
        const subIds = cur.sub_ids ?? [];
        if (subIds.includes(subId)) {
          const next = subIds.filter((s) => s !== subId);
          if (next.length === 0) dd.splice(idx, 1);
          else dd[idx] = { ...cur, sub_ids: next };
        } else {
          dd[idx] = { ...cur, sub_ids: [...subIds, subId] };
        }
      }
      return { ...p, activity_directions: dd as any };
    });
  };

  const toggleAllSubs = (main: any) => {
    setForm((p) => {
      const dd: Array<{ main_id: number; sub_ids: number[] }> = [
        ...(p.activity_directions as any),
      ];
      const idx = dd.findIndex((d) => d.main_id === main.id);
      const allChildIds = (main.children ?? []).map((c: any) => c.id);
      const cur = idx === -1 ? null : dd[idx];
      const allSelected =
        cur && allChildIds.every((id: number) => cur.sub_ids?.includes(id));

      if (allSelected) {
        if (idx !== -1) dd.splice(idx, 1);
      } else {
        if (idx === -1) {
          dd.push({ main_id: main.id, sub_ids: allChildIds });
        } else {
          dd[idx] = { ...cur!, sub_ids: allChildIds };
        }
      }
      return { ...p, activity_directions: dd as any };
    });
  };

  const getMainSelection = (mainId: number) =>
    (form.activity_directions as any[]).find(
      (d: any) => d.main_id === mainId,
    ) as { main_id: number; sub_ids: number[] } | undefined;

  return (
    <Field
      label="Үйл ажиллагааны чиглэл"
      icon={Layers}
      hint="үндсэн дээр дарж дэд чиглэл сонгоно"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          padding: 10,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {dirs.map((main: any) => {
          const expanded = expandedMains.has(main.id);
          const selection = getMainSelection(main.id);
          const selectedCount = selection?.sub_ids?.length ?? 0;
          const childCount = main.children?.length ?? 0;
          const allSelected = childCount > 0 && selectedCount === childCount;
          const someSelected = selectedCount > 0;

          return (
            <div
              key={main.id}
              style={{
                borderRadius: 10,
                background: someSelected
                  ? `${accentColor}10`
                  : "rgba(255,255,255,0.03)",
                border: someSelected
                  ? `1px solid ${accentColor}40`
                  : "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
                transition: "all 0.15s",
              }}
            >
              {/* Үндсэн чиглэл (clickable header) */}
              <button
                type="button"
                onClick={() => toggleExpand(main.id)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: someSelected ? accentColor : "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: "left",
                }}
              >
                <ChevronDown
                  size={14}
                  style={{
                    transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.15s",
                    color: "#94a3b8",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1 }}>{main.label}</span>
                {someSelected && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 10px",
                      borderRadius: 30,
                      background: `${accentColor}25`,
                      color: accentColor,
                    }}
                  >
                    {selectedCount} / {childCount}
                  </span>
                )}
                {childCount === 0 && (
                  <span style={{ fontSize: 10, color: "#64748b" }}>
                    Дэд чиглэлгүй
                  </span>
                )}
              </button>

              {/* Дэд чиглэлүүд (expanded) */}
              {expanded && childCount > 0 && (
                <div
                  style={{
                    padding: "0 14px 12px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    paddingTop: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleAllSubs(main)}
                    style={{
                      fontSize: 10,
                      padding: "4px 12px",
                      borderRadius: 30,
                      background: allSelected
                        ? `${accentColor}25`
                        : "rgba(255,255,255,0.05)",
                      border: allSelected
                        ? `1px solid ${accentColor}50`
                        : "1px solid rgba(255,255,255,0.1)",
                      color: allSelected ? accentColor : "#94a3b8",
                      cursor: "pointer",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    {allSelected ? "✓ Бүгдийг арилгах" : "Бүгдийг сонгох"}
                  </button>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {main.children.map((child: any) => {
                      const sel =
                        selection?.sub_ids?.includes(child.id) ?? false;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => toggleSub(main.id, child.id)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: "pointer",
                            border: sel
                              ? `1px solid ${accentColor}`
                              : "1px solid rgba(255,255,255,0.12)",
                            background: sel
                              ? `${accentColor}25`
                              : "rgba(255,255,255,0.05)",
                            color: sel ? accentColor : "#cbd5e1",
                            transition: "all 0.15s",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {sel && <CheckCircle2 size={11} />}
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Сонгосон чиглэлийн дүгнэлт */}
      {form.activity_directions.length > 0 && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            background: `${accentColor}10`,
            border: `1px solid ${accentColor}30`,
            borderRadius: 8,
            fontSize: 11,
            color: accentColor,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CheckCircle2 size={12} />
          Нийт {form.activity_directions.length} үндсэн чиглэл /{" "}
          {(form.activity_directions as any[]).reduce(
            (acc: number, d: any) => acc + (d.sub_ids?.length ?? 0),
            0,
          )}{" "}
          дэд чиглэл сонгогдсон
        </div>
      )}
    </Field>
  );
}