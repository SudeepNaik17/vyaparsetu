"use client";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import SupportCard from "@/components/support/SupportCard";
import SupportCategory from "@/components/support/SupportCategory";
import SupportForm from "@/components/support/SupportForm";
import FAQAccordion from "@/components/support/FAQAccordion";
export default function Support() {
  const [category, setCategory] = useState("Voice AI");
  return (
    <>
      <PageHeader
        title="Help & Support"
        subtitle="Your questions matter. We are here to help."
      >
        <Badge tone="success">● Demo</Badge>
      </PageHeader>
      <div className="support-grid">
        <div>
          <SupportCard />
          <SupportForm category={category} />
        </div>
        <div>
          <SupportCategory value={category} onChange={setCategory} />
          <FAQAccordion />
        </div>
      </div>
    </>
  );
}
