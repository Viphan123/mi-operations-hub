import { ArrowRight, CalendarClock, ChartNoAxesCombined, CircleCheck, Clock3, FileStack, Layers3 } from "lucide-react";
import Link from "next/link";
import { deliverableCategories, deliverables, type Deliverable } from "@/data/deliverables";

const chartColors = ["#287b4f", "#6a9b63", "#d38b47", "#5d8aa8", "#4e8b83", "#c66e59", "#8d9d58"];

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function frequencyGroup(frequency: string) {
  const value = frequency.toLowerCase();
  if (value.includes("weekly")) return "Weekly";
  if (value.includes("monthly")) return "Monthly";
  if (value.includes("quarterly")) return "Quarterly";
  if (value.includes("annual") || value.includes("year") || value.includes("twice a year")) return "Annual / semiannual";
  if (value.includes("period") || value.includes("as needed")) return "Per period / as needed";
  if (value.includes("meeting")) return "Meeting schedule";
  return "To be determined / variable";
}

function getDueThisWeekCount(items: Deliverable[]) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return items.filter((item) => {
    if (!item.nextDueDate) return false;
    const dueDate = new Date(`${item.nextDueDate}T00:00:00`);
    return dueDate >= startOfWeek && dueDate < endOfWeek;
  }).length;
}

function ChartCard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: { label: string; value: number; color: string }[];
}) {
  const maxValue = Math.max(1, ...rows.map((row) => row.value));
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <section className="rounded-lg border border-[#e4e9e4] bg-white p-5 sm:p-6" aria-label={title}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="display-font text-[15px] font-bold">{title}</h3>
          <p className="mt-1 text-xs text-[#78847c]">{subtitle}</p>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#f0f5f0] text-[#53705c]"><ChartNoAxesCombined size={16} /></span>
      </div>
      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-[#536057]">{row.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-[#26342b]">{row.value}<span className="ml-1 font-normal text-[#89948c]">{total ? `${Math.round((row.value / total) * 100)}%` : ""}</span></span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eef2ee]" role="meter" aria-label={`${row.label}: ${row.value}`} aria-valuemin={0} aria-valuemax={maxValue} aria-valuenow={row.value}>
              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(row.value / maxValue) * 100}%`, backgroundColor: row.color }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-[#eef1ee] pt-3 text-[11px] text-[#89948c]">{total} deliverables in sample</p>
    </section>
  );
}

export default function DashboardPage() {
  const categoryCounts = countBy(deliverables.map((item) => item.category));
  const frequencyCounts = countBy(deliverables.map((item) => frequencyGroup(item.frequency)));
  const statusCounts = countBy(deliverables.map((item) => item.status));
  const dueThisWeek = getDueThisWeekCount(deliverables);
  const monthlyCount = deliverables.filter((item) => item.frequency.toLowerCase().includes("monthly")).length;
  const activeCount = deliverables.filter((item) => item.status === "In progress").length;

  const metrics = [
    { label: "Total Deliverables", value: deliverables.length, detail: "Across seven MI categories", icon: FileStack, tone: "green" },
    { label: "Due This Week", value: dueThisWeek, detail: dueThisWeek ? "Scheduled this week" : "No due dates scheduled", icon: CalendarClock, tone: "orange" },
    { label: "Monthly Deliverables", value: monthlyCount, detail: "Includes monthly data updates", icon: Clock3, tone: "blue" },
    { label: "Active Deliverables", value: activeCount, detail: "Currently in progress", icon: CircleCheck, tone: "teal" },
  ];

  const categoryRows = deliverableCategories.map((category, index) => ({
    label: category,
    value: categoryCounts[category] ?? 0,
    color: chartColors[index % chartColors.length],
  }));
  const frequencyRows = Object.entries(frequencyCounts)
    .sort(([, first], [, second]) => second - first)
    .map(([label, value], index) => ({ label, value, color: chartColors[index % chartColors.length] }));
  const statusRows = ["In progress", "Needs scheduling", "Not started"].map((status, index) => ({
    label: status,
    value: statusCounts[status] ?? 0,
    color: ["#287b4f", "#d38b47", "#7d8c82"][index],
  }));

  return (
    <div className="page-enter space-y-7">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-[#78847c]">Operations overview</p>
          <h2 className="page-title">Deliverables at a glance</h2>
          <p className="page-description mt-2">A snapshot of Market Intelligence work, cadence, and scheduling.</p>
        </div>
        <Link href="/deliverables" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#287b4f] px-4 text-sm font-semibold text-white transition hover:bg-[#1d5c3a]">
          View deliverables <ArrowRight size={16} />
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Deliverable KPIs">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label} className="rounded-lg border border-[#e4e9e4] bg-white p-5 shadow-[0_1px_2px_rgba(24,35,29,.03)]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] font-medium text-[#78847c]">{label}</p>
              <span className={`grid size-9 place-items-center rounded-md ${tone === "green" ? "bg-[#e7f3eb] text-[#287b4f]" : tone === "orange" ? "bg-[#fff2e5] text-[#b0783b]" : tone === "blue" ? "bg-[#e9f1f7] text-[#557e98]" : "bg-[#e7f2f0] text-[#3e7b70]"}`}><Icon size={17} /></span>
            </div>
            <p className="display-font mt-5 text-[32px] font-bold leading-none tabular-nums text-[#18231d]">{value}</p>
            <p className="mt-3 text-xs text-[#89948c]">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Deliverables by Category" subtitle="Distribution across MI work categories" rows={categoryRows} />
        <ChartCard title="Deliverables by Frequency" subtitle="Grouped by recurring cadence" rows={frequencyRows} />
        <div className="xl:col-span-2">
          <ChartCard title="Deliverables by Status" subtitle="Current status across the deliverable register" rows={statusRows} />
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-lg border border-[#e4e9e4] bg-[#edf4ee] px-5 py-4 text-xs text-[#536057]">
        <Layers3 size={16} className="text-[#287b4f]" />
        <p>Figures reflect the current deliverable register. Items without a scheduled next due date are excluded from “Due This Week.”</p>
      </section>
    </div>
  );
}
