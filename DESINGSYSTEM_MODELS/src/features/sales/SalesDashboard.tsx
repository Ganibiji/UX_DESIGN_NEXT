import { useState } from "react";
import { Person, Status } from "@ui/index";
import { BarList, DashboardFilters, DashboardGrid, Kpi, KpiRow, Panel } from "@patterns/index";
import { PageLayout } from "@layouts/index";

const STAGES = [
  { label: "Prospecting", value: 1.92, part: 0.19, display: "1.92", sub: "31 deals" },
  { label: "Qualification", value: 1.64, part: 0.41, display: "1.64", sub: "22 deals" },
  { label: "Proposal", value: 1.71, part: 0.86, display: "1.71", sub: "14 deals" },
  { label: "Negotiation", value: 1.57, part: 1.18, display: "1.57", sub: "9 deals" },
];

const OPPS = [
  { name: "Cold-chain expansion", account: "Kaveri Agro Foods", stage: "Negotiation", amount: "₹48,50,000", close: "31 Oct 2026", owner: "Anjali Nair" },
  { name: "Plant 4 automation package", account: "Pinnacle Infra Projects", stage: "Proposal", amount: "₹62,00,000", close: "15 Nov 2026", owner: "Rohit Kulkarni" },
  { name: "Hospital wing HVAC controls", account: "Lumina Healthcare Systems", stage: "Negotiation", amount: "₹36,80,000", close: "07 Nov 2026", owner: "Priya Deshmukh" },
];

/**
 * Decision-ordered dashboard: KPIs → trend → operational → detail.
 * See site/dashboard.html for the full chart implementation (SVG + tooltip + table view).
 */
export function SalesDashboard() {
  const [period, setPeriod] = useState("This quarter");
  return (
    <PageLayout title="Sales — West region" description="Good morning, Priya. You have 4 approvals and 2 overdue follow-ups.">
      <DashboardFilters periods={["This month", "This quarter", "FY 2026-27"]} period={period} onPeriodChange={setPeriod} updatedLabel="Q3 · 1 Oct – 31 Dec 2026 · updated 6 min ago" />
      <KpiRow>
        <Kpi label="Revenue, quarter to date" value="₹96.4" unit="L" meta="of ₹4.50 Cr target · On pace" progress={{ value: 21, label: "21% · day 20 of 92" }} />
        <Kpi label="Open pipeline" value="₹6.84" unit="Cr" meta="76 deals · weighted ₹2.63 Cr" comparison={{ delta: "1.9×", trend: "up-good", baseline: "coverage of remaining target" }} />
        <Kpi label="Won deals" value="9" unit="· ₹1.18 Cr" comparison={{ delta: "+2", trend: "up-good", baseline: "vs same point in Q2" }} />
        <Kpi label="Win rate, last 90 days" value="28%" comparison={{ delta: "3 pts", trend: "down-bad", baseline: "vs Q2 (31%)" }} />
      </KpiRow>
      <DashboardGrid>
        <Panel className="k-col-4" title="Pipeline by stage" meta="open · ₹ Cr">
          <BarList label="Open pipeline by stage" items={STAGES} />
        </Panel>
        <Panel className="k-col-8" title="Top opportunities closing this quarter" flush>
          <table className="k-table k-table--stack">
            <thead><tr><th>Opportunity</th><th>Stage</th><th className="is-num">Amount</th><th>Close date</th><th>Owner</th></tr></thead>
            <tbody>
              {OPPS.map((o) => (
                <tr key={o.name}>
                  <td className="k-table__primary"><div className="k-cell-stack"><a href="#">{o.name}</a><small>{o.account}</small></div></td>
                  <td data-label="Stage"><Status>{o.stage}</Status></td>
                  <td className="is-num" data-label="Amount">{o.amount}</td>
                  <td data-label="Close">{o.close}</td>
                  <td data-label="Owner"><Person name={o.owner} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </DashboardGrid>
    </PageLayout>
  );
}
