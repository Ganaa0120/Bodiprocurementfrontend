"use client";
import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { DirItem, SelDir, useBreakpoint } from "./useW";

interface Props {
  dirs: DirItem[];
  selDirs: SelDir[];
  editing: boolean;
  toggleMain: (id: number) => void;
  toggleSub: (mainId: number, subId: number) => void;
}

export function DirectionPicker({
  dirs,
  selDirs,
  editing,
  toggleMain,
  toggleSub,
}: Props) {
  const { w } = useBreakpoint();
  const useAccordion = w > 0 && w < 1024; // mobile + tablet

  // Desktop 2-pane state
  const [activeMain, setActiveMain] = useState<number | null>(
    selDirs.length > 0 ? selDirs[0].main_id : null,
  );
  const [search, setSearch] = useState("");

  // Accordion state — which main direction is expanded
  const [expandedId, setExpandedId] = useState<number | null>(
    selDirs.length > 0 ? Number(selDirs[0].main_id) : null,
  );

  const activeDir = dirs.find((d) => d.id === activeMain);
  const filteredSubs =
    activeDir?.children.filter((c) =>
      c.label.toLowerCase().includes(search.toLowerCase()),
    ) || [];
  const activeSel = selDirs.find(
    (s) => Number(s.main_id) === Number(activeMain),
  );

  // ── Read-only ──────────────────────────────────────────────
  if (!editing) {
    if (selDirs.length === 0)
      return <div style={{ fontSize: 13, color: "#cbd5e1" }}>—</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {selDirs.map((sel) => {
          const main = dirs.find((d) => Number(d.id) === Number(sel.main_id));
          if (!main) return null;
          return (
            <div
              key={sel.main_id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0072BC",
                  background: "#e6f2fa",
                  border: "1px solid #bae0f3",
                  padding: "3px 10px",
                  borderRadius: 99,
                  whiteSpace: "nowrap" as const,
                }}
              >
                {main.label}
              </span>
              {sel.sub_ids.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {sel.sub_ids.map((sid) => {
                    const sub = main.children?.find(
                      (c: any) => Number(c.id) === Number(sid),
                    );
                    return sub ? (
                      <span
                        key={sid}
                        style={{
                          fontSize: 11,
                          color: "#64748b",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          padding: "3px 8px",
                          borderRadius: 99,
                        }}
                      >
                        {sub.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // ── Edit mode: ACCORDION (mobile + tablet < 1024px) ──────────
  // ═════════════════════════════════════════════════════════════
  if (useAccordion) {
    return (
      <div
        style={{
          border: "1.5px solid #e2e8f0",
          borderRadius: 14,
          overflow: "hidden",
          background: "white",
        }}
      >
        {dirs.length === 0 ? (
          <div
            style={{
              padding: 24,
              fontSize: 12,
              color: "#94a3b8",
              textAlign: "center" as const,
            }}
          >
            Ачаалж байна...
          </div>
        ) : (
          dirs.map((d, idx) => {
            const isOn = selDirs.some(
              (s) => Number(s.main_id) === Number(d.id),
            );
            const isExpanded = expandedId === d.id;
            const sel = selDirs.find((s) => Number(s.main_id) === Number(d.id));
            const filtered = (d.children || []).filter((c) =>
              c.label.toLowerCase().includes(search.toLowerCase()),
            );
            const showSearch = (d.children?.length || 0) > 5;

            return (
              <div
                key={d.id}
                style={{
                  borderBottom:
                    idx < dirs.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div
                  onClick={() => {
                    setExpandedId(isExpanded ? null : d.id);
                    setSearch("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 14px",
                    background: isExpanded ? "#fafafa" : "white",
                    cursor: "pointer",
                    transition: "background .15s",
                    minHeight: 52,
                  }}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMain(d.id);
                      if (!isOn) {
                        setExpandedId(d.id);
                        setSearch("");
                      }
                    }}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      flexShrink: 0,
                      cursor: "pointer",
                      border: isOn ? "2px solid #0072BC" : "2px solid #d1d5db",
                      background: isOn ? "#0072BC" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .12s",
                    }}
                  >
                    {isOn && <Check size={12} color="white" strokeWidth={3} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: isOn ? 600 : 500,
                        color: isOn ? "#1e293b" : "#374151",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {d.label}
                    </div>
                    {isOn && sel && sel.sub_ids.length > 0 && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#0072BC",
                          marginTop: 2,
                          fontWeight: 600,
                        }}
                      >
                        {sel.sub_ids.length} дэд чиглэл сонгосон
                      </div>
                    )}
                  </div>

                  <ChevronDown
                    size={16}
                    style={{
                      color: "#94a3b8",
                      flexShrink: 0,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform .2s",
                    }}
                  />
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: "12px 14px 14px",
                      background: "#fafafa",
                      borderTop: "1px solid #f1f5f9",
                      animation: "fadeIn .2s ease",
                    }}
                  >
                    {!isOn ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#f59e0b",
                          fontWeight: 500,
                          padding: "4px 0",
                        }}
                      >
                        ⚠️ Эхлээд үндсэн чиглэлийг сонгоно уу (зүүн талын
                        checkbox)
                      </div>
                    ) : (d.children?.length || 0) === 0 ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          padding: "4px 0",
                        }}
                      >
                        Дэд чиглэл байхгүй
                      </div>
                    ) : (
                      <>
                        {showSearch && (
                          <div
                            style={{ position: "relative", marginBottom: 10 }}
                          >
                            <Search
                              size={13}
                              style={{
                                position: "absolute",
                                left: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#94a3b8",
                                pointerEvents: "none",
                              }}
                            />
                            <input
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Дэд чиглэл хайх..."
                              style={{
                                width: "100%",
                                padding: "8px 10px 8px 30px",
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                fontSize: 12,
                                outline: "none",
                                background: "white",
                                boxSizing: "border-box" as const,
                                fontFamily: "inherit",
                              }}
                              onFocus={(e) =>
                                ((e.target as HTMLElement).style.borderColor =
                                  "#0072BC")
                              }
                              onBlur={(e) =>
                                ((e.target as HTMLElement).style.borderColor =
                                  "#e2e8f0")
                              }
                            />
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginBottom: 10,
                            flexWrap: "wrap" as const,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              (d.children || []).forEach((c) => {
                                if (sel && !sel.sub_ids.includes(c.id))
                                  toggleSub(d.id, c.id);
                              });
                            }}
                            style={{
                              fontSize: 11,
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #bae0f3",
                              background: "#e6f2fa",
                              color: "#0072BC",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              fontWeight: 600,
                            }}
                          >
                            Бүгдийг сонгох
                          </button>
                          {sel && sel.sub_ids.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                sel.sub_ids
                                  .slice()
                                  .forEach((id) => toggleSub(d.id, id))
                              }
                              style={{
                                fontSize: 11,
                                padding: "5px 10px",
                                borderRadius: 6,
                                border: "1px solid #fecaca",
                                background: "#fef2f2",
                                color: "#dc2626",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontWeight: 600,
                              }}
                            >
                              Цэвэрлэх
                            </button>
                          )}
                        </div>

                        {filtered.length === 0 ? (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#94a3b8",
                              padding: "8px 0",
                            }}
                          >
                            "{search}" олдсонгүй
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap" as const,
                              gap: 6,
                            }}
                          >
                            {filtered.map((sub) => {
                              const isSubOn = sel?.sub_ids.some(
                                (id) => Number(id) === Number(sub.id),
                              );
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => toggleSub(d.id, sub.id)}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: 99,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    border: isSubOn
                                      ? "1.5px solid #0072BC"
                                      : "1.5px solid #e2e8f0",
                                    background: isSubOn ? "#e6f2fa" : "white",
                                    color: isSubOn ? "#0072BC" : "#64748b",
                                    cursor: "pointer",
                                    transition: "all .12s",
                                    fontFamily: "inherit",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                  }}
                                >
                                  {isSubOn && (
                                    <Check size={10} strokeWidth={3} />
                                  )}
                                  {sub.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {sel && sel.sub_ids.length > 0 && (
                          <div
                            style={{
                              marginTop: 10,
                              paddingTop: 10,
                              borderTop: "1px solid #e2e8f0",
                              fontSize: 11,
                              color: "#0072BC",
                              fontWeight: 600,
                            }}
                          >
                            ✓ {sel.sub_ids.length} дэд чиглэл сонгогдсон
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid #f1f5f9",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap" as const,
          }}
        >
          {selDirs.length === 0 ? (
            <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 500 }}>
              ⚠️ Нэг буюу хэд хэдэн чиглэл сонгоно уу
            </span>
          ) : (
            <>
              <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>
                ✓ {selDirs.length} үндсэн чиглэл сонгогдсон
              </span>
              <button
                type="button"
                onClick={() => selDirs.forEach((s) => toggleMain(s.main_id))}
                style={{
                  fontSize: 11,
                  color: "#ef4444",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                  padding: "3px 9px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  marginLeft: "auto",
                  fontWeight: 600,
                }}
              >
                Бүгдийг цэвэрлэх
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // ── Edit mode: DESKTOP 2-pane (≥ 1024px) ─────────────────────
  // ═════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        border: "1.5px solid #e2e8f0",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          minHeight: 360,
        }}
      >
        <div
          style={{
            borderRight: "1px solid #f1f5f9",
            background: "#fafafa",
            overflowY: "auto",
            maxHeight: 400,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              fontSize: 10,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Үндсэн чиглэл
          </div>
          {dirs.length === 0 ? (
            <div
              style={{
                padding: 16,
                fontSize: 12,
                color: "#94a3b8",
                textAlign: "center" as const,
              }}
            >
              Ачаалж байна...
            </div>
          ) : (
            dirs.map((d) => {
              const isOn = selDirs.some(
                (s) => Number(s.main_id) === Number(d.id),
              );
              const isActive = activeMain === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => {
                    setActiveMain(d.id);
                    setSearch("");
                  }}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: isActive ? "#e6f2fa" : "transparent",
                    borderLeft: isActive
                      ? "3px solid #0072BC"
                      : "3px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all .12s",
                  }}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMain(d.id);
                      if (!isOn) setActiveMain(d.id);
                    }}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      flexShrink: 0,
                      cursor: "pointer",
                      border: isOn ? "2px solid #0072BC" : "2px solid #d1d5db",
                      background: isOn ? "#0072BC" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .12s",
                    }}
                  >
                    {isOn && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: isOn ? 600 : 400,
                        color: isActive
                          ? "#0072BC"
                          : isOn
                            ? "#1e293b"
                            : "#374151",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {d.label}
                    </div>
                    {isOn &&
                      (selDirs.find((s) => Number(s.main_id) === Number(d.id))
                        ?.sub_ids.length ?? 0) > 0 && (
                        <div style={{ fontSize: 10, color: "#0072BC" }}>
                          {
                            selDirs.find(
                              (s) => Number(s.main_id) === Number(d.id),
                            )?.sub_ids.length
                          }{" "}
                          сонгосон
                        </div>
                      )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const }}>
          {activeMain === null ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column" as const,
                gap: 8,
                color: "#94a3b8",
              }}
            >
              <span style={{ fontSize: 28 }}>👈</span>
              <span style={{ fontSize: 13 }}>Үндсэн чиглэл сонгоно уу</span>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}
                  >
                    {activeDir?.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {activeDir?.children.length || 0} дэд чиглэл
                  </div>
                </div>
                {activeSel && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => {
                        activeDir?.children.forEach((c) => {
                          if (!activeSel.sub_ids.includes(c.id))
                            toggleSub(activeMain, c.id);
                        });
                      }}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid #bae0f3",
                        background: "#e6f2fa",
                        color: "#0072BC",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Бүгдийг сонгох
                    </button>
                    {activeSel.sub_ids.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          activeSel.sub_ids
                            .slice()
                            .forEach((id) => toggleSub(activeMain, id))
                        }
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 6,
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Цэвэрлэх
                      </button>
                    )}
                  </div>
                )}
              </div>

              {(activeDir?.children.length || 0) > 5 && (
                <div
                  style={{
                    padding: "8px 14px",
                    borderBottom: "1px solid #f1f5f9",
                    position: "relative",
                  }}
                >
                  <Search
                    size={13}
                    style={{
                      position: "absolute",
                      left: 26,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94a3b8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Дэд чиглэл хайх..."
                    style={{
                      width: "100%",
                      padding: "7px 10px 7px 30px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                      outline: "none",
                      background: "white",
                      boxSizing: "border-box" as const,
                    }}
                    onFocus={(e) =>
                      ((e.target as HTMLElement).style.borderColor = "#0072BC")
                    }
                    onBlur={(e) =>
                      ((e.target as HTMLElement).style.borderColor = "#e2e8f0")
                    }
                  />
                </div>
              )}

              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
                {!activeSel ? (
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: 12,
                      color: "#f59e0b",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ Эхлээд үндсэн чиглэлийг сонгоно уу (зүүн талын checkbox)
                  </div>
                ) : filteredSubs.length === 0 ? (
                  <div
                    style={{
                      padding: "12px 0",
                      fontSize: 12,
                      color: "#94a3b8",
                    }}
                  >
                    {search ? `"${search}" олдсонгүй` : "Дэд чиглэл байхгүй"}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {filteredSubs.map((sub) => {
                      const isSubOn = activeSel.sub_ids.some(
                        (id) => Number(id) === Number(sub.id),
                      );
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSub(activeMain, sub.id)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 500,
                            border: isSubOn
                              ? "1.5px solid #0072BC"
                              : "1.5px solid #e2e8f0",
                            background: isSubOn ? "#e6f2fa" : "white",
                            color: isSubOn ? "#0072BC" : "#64748b",
                            cursor: "pointer",
                            transition: "all .12s",
                            fontFamily: "inherit",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {isSubOn && <Check size={10} strokeWidth={3} />}
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {activeSel && activeSel.sub_ids.length > 0 && (
                <div
                  style={{
                    padding: "8px 14px",
                    borderTop: "1px solid #f1f5f9",
                    fontSize: 11,
                    color: "#0072BC",
                    fontWeight: 600,
                  }}
                >
                  ✓ {activeSel.sub_ids.length} дэд чиглэл сонгогдсон
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #f1f5f9",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap" as const,
        }}
      >
        {selDirs.length === 0 ? (
          <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 500 }}>
            ⚠️ Нэг буюу хэд хэдэн чиглэл сонгоно уу
          </span>
        ) : (
          <>
            <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>
              ✓ {selDirs.length} үндсэн чиглэл сонгогдсон
            </span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
              {selDirs.map((sel) => {
                const main = dirs.find(
                  (d) => Number(d.id) === Number(sel.main_id),
                );
                return main ? (
                  <span
                    key={sel.main_id}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: "#e6f2fa",
                      border: "1px solid #bae0f3",
                      color: "#0072BC",
                      fontWeight: 600,
                    }}
                  >
                    {main.label}
                  </span>
                ) : null;
              })}
            </div>
            <button
              type="button"
              onClick={() => selDirs.forEach((s) => toggleMain(s.main_id))}
              style={{
                fontSize: 11,
                color: "#ef4444",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
                padding: "2px 8px",
                cursor: "pointer",
                fontFamily: "inherit",
                marginLeft: "auto",
              }}
            >
              Бүгдийг цэвэрлэх
            </button>
          </>
        )}
      </div>
    </div>
  );
}
