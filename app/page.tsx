"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, CircleCheck, Clock3, FileStack, Layers3, Users } from "lucide-react";
import { useWorkflows, progressForDeliverable, type WorkflowDeliverable } from "@/data/workflows";

const cardClass = "rounded-lg border border-[#e4e9e4] bg-white p-5 sm:p-6";
const chartColors = ["#287b4f", "#5d8aa8", "#d38b47", "#6a9b63", "#c66e59", "#4e8b83", "#8d9d58"];
const statusColors: Record<string, string> = {
  "In Progress": "#5d8aa8",
  "Not Started": "#89948c",
  "Needs Scheduling": "#d38b47",
  Blocked: "#c66e59",
  Completed: "#287b4f",
  "Ready for Review": "#8d78a7",
};

type Deadline = { item: WorkflowDeliverable; date: string; label: string };

function itemDeadline(item: WorkflowDeliverable): Deadline | null {
  if (item.state !== "Active" || statusLabel(item) === "Completed") return null;
  const cycle = item.cycles.find((entry) => entry.status === "Active") ?? item.cycles[0];
  const taskDeadlines = cycle?.phases.flatMap((phase) => phase.tasks
    .filter((task) => task.dueDate && !["Completed", "Not Applicable"].includes(task.status))
    .map((task) => ({ date: task.dueDate, label: task.name }))) ?? [];
  const candidates: Deadline[] = taskDeadlines.map((deadline) => ({ ...deadline, item }));
  if (item.nextDueDate) candidates.push({ item, date: item.nextDueDate, label: "Deliverable due" });
  return candidates.sort((first, second) => dateValue(first.date) - dateValue(second.date))[0] ?? null;
}

function dateValue(value: string) {
  return new Date(`${value}T00:00:00`).getTime();
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function currentPhase(item: WorkflowDeliverable) {
  const cycle = item.cycles.find((entry) => entry.status === "Active") ?? item.cycles[0];
  return cycle?.phases.find((phase) => phase.tasks.some((task) => !["Completed", "Not Applicable"].includes(task.status)))?.name ?? (cycle ? "Complete" : "No active cycle");
}

function statusLabel(item: WorkflowDeliverable) {
  const tasks = (item.cycles.find((cycle) => cycle.status === "Active") ?? item.cycles[0])?.phases.flatMap((phase) => phase.tasks) ?? [];
  if (tasks.some((task) => task.status === "Blocked")) return "Blocked";
  if (tasks.some((task) => task.status === "Ready for Review")) return "Ready for Review";
  if (tasks.some((task) => task.status === "In Progress")) return "In Progress";
  const applicable = tasks.filter((task) => task.status !== "Not Applicable");
  if (applicable.length && applicable.every((task) => task.status === "Completed")) return "Completed";
  const value = item.status.toLowerCase();
  if (value.includes("progress")) return "In Progress";
  if (value.includes("schedul")) return "Needs Scheduling";
  if (value.includes("complet")) return "Completed";
  if (value.includes("review")) return "Ready for Review";
  return "Not Started";
}

function BarChart({ title, subtitle, rows, emptyLabel }: { title: string; subtitle: string; rows: { label: string; value: number; color?: string }[]; emptyLabel: string }) {
  const maxValue = Math.max(1, ...rows.map((row) => row.value));
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return <section className={cardClass} aria-label={title}>
    <div className="flex items-start justify-between gap-3"><div><h3 className="display-font text-[15px] font-bold">{title}</h3><p className="mt-1 text-xs text-[#78847c]">{subtitle}</p></div><span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#f0f5f0] text-[#53705c]"><ChartNoAxesCombinedIcon /></span></div>
    {total ? <div className="mt-5 space-y-4">{rows.filter((row) => row.value > 0).map((row, index) => <div key={row.label}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="truncate text-[#536057]">{row.label}</span><span className="shrink-0 font-semibold tabular-nums text-[#26342b]">{row.value}<span className="ml-1 font-normal text-[#89948c]">{Math.round((row.value / total) * 100)}%</span></span></div><div className="h-2 overflow-hidden rounded-full bg-[#eef2ee]" role="meter" aria-label={`${row.label}: ${row.value} deliverables`} aria-valuemin={0} aria-valuemax={maxValue} aria-valuenow={row.value}><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(row.value / maxValue) * 100}%`, backgroundColor: row.color ?? chartColors[index % chartColors.length] }} /></div></div>)}</div> : <p className="mt-6 border-t border-[#eef1ee] pt-4 text-xs text-[#89948c]">{emptyLabel}</p>}
    <p className="mt-5 border-t border-[#eef1ee] pt-3 text-[11px] text-[#89948c]">{total} deliverables</p>
  </section>;
}

function ChartNoAxesCombinedIcon() {
  return <Layers3 size={16} aria-hidden="true" />;
}

export default function DashboardPage() {
  const { items } = useWorkflows();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const todayValue = now.getTime();
  const deadlines = items.map(itemDeadline).filter((entry): entry is Deadline => Boolean(entry)).sort((first, second) => dateValue(first.date) - dateValue(second.date));
  const overdue = deadlines.filter((entry) => dateValue(entry.date) < todayValue);
  const dueThisWeek = deadlines.filter((entry) => dateValue(entry.date) >= todayValue && dateValue(entry.date) < weekEnd.getTime());
  const upcoming = deadlines.filter((entry) => dateValue(entry.date) >= todayValue);
  const blocked = items.filter((item) => item.state !== "Archived" && statusLabel(item) === "Blocked");
  const activeWork = items.filter((item) => item.state === "Active" && (item.cycles.some((cycle) => cycle.status === "Active") || statusLabel(item) === "In Progress" || statusLabel(item) === "Blocked"));
  const categories = [...new Set(items.map((item) => item.category))].map((category, index) => ({ label: category, value: items.filter((item) => item.category === category).length, color: chartColors[index % chartColors.length] })).sort((first, second) => second.value - first.value);
  const owners = [...new Set(items.map((item) => item.owner.trim() || "Unassigned"))].map((owner, index) => ({ label: owner, value: items.filter((item) => (item.owner.trim() || "Unassigned") === owner).length, color: chartColors[index % chartColors.length] })).sort((first, second) => second.value - first.value);
  const statusOrder = ["In Progress", "Not Started", "Needs Scheduling", "Ready for Review", "Blocked", "Completed"];
  const statuses = statusOrder.map((status) => ({ label: status, value: items.filter((item) => statusLabel(item) === status).length, color: statusColors[status] }));
  const metrics = [
    { label: "Total Deliverables", value: items.length, note: "Across all MI categories", icon: FileStack, tone: "green" },
    { label: "Due This Week", value: dueThisWeek.length, note: "Open deliverables", icon: CalendarClock, tone: "orange" },
    { label: "Overdue Deliverables", value: overdue.length, note: "Past their next open deadline", icon: Clock3, tone: "red" },
    { label: "Blocked Deliverables", value: blocked.length, note: "Require attention", icon: AlertTriangle, tone: "blue" },
  ];

  return <div className="page-enter space-y-7">
    <section className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-sm text-[#78847c]">Executive operations overview</p><h2 className="page-title">MI Operations Dashboard</h2><p className="page-description mt-2">What the MI team is working on and where delivery stands.</p></div><Link href="/deliverables" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#287b4f] px-4 text-sm font-semibold text-white transition hover:bg-[#1d5c3a]">Deliverable register <ArrowRight size={16} /></Link></section>

    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Deliverable KPIs">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article key={label} className="rounded-lg border border-[#e4e9e4] bg-white p-5 shadow-[0_1px_2px_rgba(24,35,29,.03)]"><div className="flex items-start justify-between gap-3"><p className="text-[13px] font-medium text-[#78847c]">{label}</p><span className={`grid size-9 place-items-center rounded-md ${tone === "green" ? "bg-[#e7f3eb] text-[#287b4f]" : tone === "orange" ? "bg-[#fff2e5] text-[#b0783b]" : tone === "red" ? "bg-[#fbece8] text-[#b65c43]" : "bg-[#e9f1f7] text-[#557e98]"}`}><Icon size={17} /></span></div><p className="display-font mt-5 text-[32px] font-bold leading-none tabular-nums text-[#18231d]">{value}</p><p className="mt-3 text-xs text-[#89948c]">{note}</p></article>)}</section>

    <section className={cardClass} aria-label="Current work"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h3 className="display-font text-[15px] font-bold">Current Work</h3><p className="mt-1 text-xs text-[#78847c]">Active deliverables, their current phase, and progress.</p></div><span className="text-xs text-[#89948c]">{activeWork.length} active workstreams</span></div><div className="overflow-x-auto"><table className="w-full min-w-[740px] text-left text-xs"><thead className="text-[#89948c]"><tr>{["Deliverable", "Current phase", "Owner", "Next deadline", "Progress", "Status"].map((label) => <th key={label} className="border-b border-[#eef1ee] px-3 py-2 font-medium">{label}</th>)}</tr></thead><tbody>{activeWork.map((item) => { const deadline = itemDeadline(item); const progress = progressForDeliverable(item); const status = statusLabel(item); return <tr key={item.id} className="border-b border-[#f0f3f0] last:border-0"><td className="px-3 py-3 font-semibold"><Link className="hover:text-[#287b4f]" href={`/deliverables/${item.id}`}>{item.name}</Link></td><td className="px-3 py-3">{currentPhase(item)}</td><td className="px-3 py-3">{item.owner}</td><td className="px-3 py-3">{deadline ? <span>{deadline.label}<time className="ml-2 text-[#89948c]">{formatDate(deadline.date)}</time></span> : "Not scheduled"}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 rounded-full bg-[#eef2ee]"><div className="h-full rounded-full bg-[#287b4f]" style={{ width: `${progress}%` }} /></div><span className="tabular-nums">{progress}%</span></div></td><td className="px-3 py-3"><span className="rounded-full px-2 py-1 text-[10px] font-semibold" style={{ backgroundColor: `${statusColors[status] ?? "#89948c"}18`, color: statusColors[status] ?? "#68756c" }}>{status}</span></td></tr>; })}</tbody></table></div>{!activeWork.length && <p className="py-8 text-center text-sm text-[#89948c]">No active deliverables to report.</p>}</section>

    <section className="grid gap-4 xl:grid-cols-2">
      <article className={cardClass}><div className="flex items-start justify-between gap-3"><div><h3 className="display-font text-[15px] font-bold">Upcoming Deadlines</h3><p className="mt-1 text-xs text-[#78847c]">Next open deadline for each deliverable</p></div><span className="grid size-8 place-items-center rounded-md bg-[#fff2e5] text-[#b0783b]"><CalendarClock size={16} /></span></div><div className="mt-4 space-y-1">{upcoming.slice(0, 8).map((entry) => <Link key={`${entry.item.id}-${entry.date}`} href={`/deliverables/${entry.item.id}`} className="flex items-center gap-3 border-t border-[#f0f3f0] py-3 text-xs hover:text-[#287b4f]"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#f7f9f7] text-[#68756c]"><Clock3 size={14} /></span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{entry.item.name}</span><span className="mt-0.5 block truncate text-[#89948c]">{entry.label}</span></span><time className="shrink-0 font-semibold tabular-nums">{formatDate(entry.date)}</time></Link>)}{!upcoming.length && <p className="border-t border-[#f0f3f0] py-5 text-xs text-[#89948c]">No upcoming deadlines scheduled.</p>}</div></article>
      <BarChart title="Deliverables by Category" subtitle="Portfolio distribution by work type" rows={categories} emptyLabel="No deliverables available." />
      <BarChart title="Deliverables by Owner" subtitle="Primary ownership across the portfolio" rows={owners} emptyLabel="No owners assigned." />
      <BarChart title="Status Overview" subtitle="Current status across all deliverables" rows={statuses} emptyLabel="No status data available." />
    </section>

    <section className="flex flex-wrap items-center gap-3 rounded-lg border border-[#e4e9e4] bg-[#edf4ee] px-5 py-4 text-xs text-[#536057]"><span className="grid size-8 place-items-center rounded-md bg-white text-[#287b4f]"><CircleCheck size={16} /></span><p className="flex-1">{items.length} deliverables tracked across {categories.length} categories, with {activeWork.length} active workstreams.</p><span className="inline-flex items-center gap-1.5 text-[#68756c]"><Users size={14} /> {owners.filter((owner) => owner.label !== "Unassigned").length} assigned owners</span><span className="inline-flex items-center gap-1.5 text-[#68756c]"><Layers3 size={14} /> {items.filter((item) => item.state === "Active").length} active processes</span></section>
  </div>;
}
