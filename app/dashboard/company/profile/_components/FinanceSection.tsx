"use client";
import { CreditCard } from "lucide-react";
import { Section } from "./Section";
import { FInput, FSelect } from "./FormFields";
import { useBreakpoint } from "./useW";

export function FinanceSection({ form, F, editing }: any) {
  const { isMobile, isTablet } = useBreakpoint();
  const g2 = isMobile ? "1fr" : "1fr 1fr";
  const g4 = isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr 1fr";

  return (
    <Section icon={CreditCard} title="САНХҮҮГИЙН МЭДЭЭЛЭЛ">
      <div style={{ display: "grid", gridTemplateColumns: g2, gap: 14, marginBottom: 14 }}>
        <FInput
          label="Банкны нэр"
          value={form.bank_name}
          editing={editing}
          onChange={(v: string) => F("bank_name", v)}
        />
        <FInput
          label="Дансны дугаар"
          value={form.bank_account_number}
          editing={editing}
          onChange={(v: string) => F("bank_account_number", v)}
          mono
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: g4, gap: 14 }}>
        <FInput
          label="НӨАТ дугаар"
          value={form.vat_number}
          editing={editing}
          onChange={(v: string) => F("vat_number", v)}
          mono
        />
        <FInput
          label="SWIFT код"
          value={form.swift_code}
          editing={editing}
          onChange={(v: string) => F("swift_code", v)}
          mono
        />
        <FInput
          label="IBAN"
          value={form.iban}
          editing={editing}
          onChange={(v: string) => F("iban", v)}
          mono
        />
        <FSelect
          label="Валют"
          value={form.currency}
          editing={editing}
          onChange={(v: string) => F("currency", v)}
          options={[
            { value: "MNT", label: "₮ Төгрөг" },
            { value: "USD", label: "$ Доллар" },
            { value: "EUR", label: "€ Евро" },
          ]}
        />
      </div>
    </Section>
  );
}