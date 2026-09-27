"use client";
import { useState } from "react";
import SearchBar from "@/components/ui/SearchBar";
import { mockSupport } from "@/data/mockSupport";
import { useLanguage } from "@/hooks/useLanguage";
export default function FAQAccordion() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const items = mockSupport.filter((f) =>
    t(f.q).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="faq">
      <h2>{t("Frequently asked questions")}</h2>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder={t("Search help articles")}
      />
      {items.map((f) => (
        <details key={f.q}>
          <summary>{t(f.q)}</summary>
          <p>{t(f.a)}</p>
        </details>
      ))}
      {!items.length && <p>{t("No results found")}</p>}
    </section>
  );
}
