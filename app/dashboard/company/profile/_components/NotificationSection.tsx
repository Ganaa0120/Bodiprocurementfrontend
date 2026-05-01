"use client";
import { Bell } from "lucide-react";
import { Section } from "./Section";
import type { DirItem, SelDir } from "./useW";

export function NotificationSection({
  form,
  F,
  editing,
  dirs,
  selDirs,
  profile,
  fieldErrors,
  setFieldErrors,
}: {
  form: any;
  F: (k: string, v: any) => void;
  editing: boolean;
  dirs: DirItem[];
  selDirs: SelDir[];
  profile: any;
  fieldErrors: Record<string, string>;
  setFieldErrors: any;
}) {
  return (
    <Section icon={Bell} title="МЭДЭГДЭЛ ХҮЛЭЭН АВАХ ХЭЛБЭР">
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#64748b",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            display: "block",
            marginBottom: 12,
          }}
        >
          Худалдан авалтын зарын мэдэгдэл хүлээн авах <span style={{ color: "#ef4444" }}>*</span>
        </label>
        {fieldErrors.notification_preference && (
          <div
            data-error="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 8,
              padding: "3px 8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 10, color: "#ef4444" }}>✕</span>
            <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 500 }}>
              {fieldErrors.notification_preference}
            </span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              value: "all",
              icon: "🔔",
              label: "Бүх үйл ажиллагааны чиглэлээр хүлээн авах",
              desc: "Системд нийтлэгдсэн бүх зарын мэдэгдлийг хүлээн авна",
            },
            {
              value: "selected_dirs",
              icon: "🎯",
              label: "Сонгосон үйл ажиллагааны чиглэлээр хүлээн авах",
              desc: "Үйл ажиллагааны чиглэлтээс сонгосон зарын мэдэгдлийг л хүлээн авна",
            },
          ].map((opt) => {
            const isOn = form.notification_preference === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  if (!editing) return;
                  F("notification_preference", opt.value);
                  setFieldErrors((p: any) => ({ ...p, notification_preference: "" }));
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 12,
                  cursor: editing ? "pointer" : "default",
                  border: isOn ? "1.5px solid #0072BC" : "1.5px solid #0072BC33",
                  background: isOn ? "#0072BC1A" : "white",
                  transition: "all .15s",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: 1,
                    border: isOn ? "2px solid #0072BC" : "2px solid #e2e8f0",
                    background: isOn ? "#0072BC" : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isOn && (
                    <div
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 15 }}>{opt.icon}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isOn ? "#0072BC" : "#0f172a",
                      }}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{opt.desc}</div>
                  {opt.value === "selected_dirs" && isOn && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {selDirs.length === 0 ? (
                        <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 500 }}>
                          ⚠️ Үйл ажиллагааны чиглэл сонгоогүй байна
                        </span>
                      ) : (
                        selDirs.map((sel) => {
                          const main = dirs.find(
                            (d) => Number(d.id) === Number(sel.main_id),
                          );
                          return main ? (
                            <span
                              key={sel.main_id}
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#0072BC",
                                background: "#e6f2fa",
                                border: "1px solid #bae0f3",
                                padding: "2px 8px",
                                borderRadius: 99,
                              }}
                            >
                              {main.label}
                            </span>
                          ) : null;
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>📧</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              И-мэйл мэдэгдэл
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              {profile?.email || "И-мэйл хаяг байхгүй"}
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 99,
            background: "#dcfce7",
            color: "#166534",
          }}
        >
          Идэвхтэй
        </div>
      </div>
    </Section>
  );
}