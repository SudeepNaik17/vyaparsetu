"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import BusinessSummary from "@/components/dashboard/BusinessSummary";
import SalesChart from "@/components/reports/SalesChart";
import ProfitChart from "@/components/reports/ProfitChart";
import TopProducts from "@/components/reports/TopProducts";
import PaymentBreakdown from "@/components/reports/PaymentBreakdown";
import { list } from "@/services/reportsApi";
import { useApp } from "@/context/AppContext";
export default function Reports() {
  const [range, setRange] = useState(7);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const { data } = useApp();
  useEffect(() => {
    let active = true;
    setError("");
    list(range)
      .then((r) => {
        if (active) setReport(r);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [range, data]);
  function download() {
    const csv =
      "Date,Sales,Profit\n" +
      report.chart
        .map((r) => r.date.slice(0, 10) + "," + r.sales + "," + r.profit)
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "vyaparsetu-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Simple insights for a growing business."
      >
        <select
          aria-label="Date range"
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
        <Button
          variant="secondary"
          icon="Download"
          onClick={download}
          disabled={!report}
        >
          Export CSV
        </Button>
      </PageHeader>
      <BusinessSummary />
      {error && <p className="error">{error}</p>}
      {report && (
        <div className="report-grid" style={{ marginTop: 22 }}>
          <SalesChart
            values={report.chart.map((r) => r.sales)}
            days={report.chart.map((r) =>
              new Date(r.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              }),
            )}
          />
          <ProfitChart
            values={report.chart.map((r) => r.profit)}
            days={report.chart.map((r) => new Date(r.date).getDate())}
          />
          <TopProducts rows={report.topProducts} />
          <PaymentBreakdown payments={report.payments} />
        </div>
      )}
    </>
  );
}
