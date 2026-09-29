"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarClock, Layers3, ListChecks, Plus, RotateCcw, Save } from "lucide-react";
import { deliverableCategories, type DeliverableCategory } from "@/data/deliverables";
import { useWorkflows, type Priority, type WorkflowDeliverable } from "@/data/workflows";

const fieldClassName = "mt-1.5 h-10 w-full rounded-md border border-[#e2e8e3] bg-white px-3 text-sm text-[#354339] outline-none transition placeholder:text-[#a0aaa3] focus:border-[#6a9b78] focus:ring-2 focus:ring-[#287b4f]/15";

export default function AdminPage() {
  const { items, setItems, reset } = useWorkflows();
  const [feedback, setFeedback] = useState("");
  const frequencyCount = new Set(items.map((item) => item.frequency)).size;

  function addDeliverable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const item: WorkflowDeliverable = {
      id: crypto.randomUUID(), name: String(values.get("name")).trim(), category: String(values.get("category")) as DeliverableCategory,
      frequency: String(values.get("frequency")).trim(), owner: String(values.get("owner")).trim() || "Unassigned", backupOwner: String(values.get("backupOwner")).trim() || "Unassigned",
      status: "Not started", priority: String(values.get("priority")) as Priority, nextDueDate: String(values.get("nextDueDate")) || null,
      description: String(values.get("description")).trim(), reportingSchedule: String(values.get("reportingSchedule")).trim(), state: "Active", cycles: [], links: [], activity: ["Deliverable created"],
    };
    setItems((current) => [item, ...current]);
    setFeedback(`${item.name} added and saved.`);
    form.reset();
  }

  function resetDemo() {
    if (!window.confirm("Reset all workflow edits and restore the original demo data? This cannot be undone.")) return;
    reset(); setFeedback("Demo data restored.");
  }

  return <div className="page-enter mx-auto max-w-[1120px] space-y-7">
    <section className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="page-title">Workspace administration</h2><p className="page-description mt-2">Manage the Market Intelligence deliverable register.</p></div><button type="button" onClick={resetDemo} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#e2e8e3] bg-white px-4 text-sm font-semibold text-[#68756c] hover:border-[#d8a18e] hover:text-[#9a4934]"><RotateCcw size={15} /> Reset demo data</button></section>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Deliverable summary">{[
      { label: "Total Deliverables", value: items.length, detail: "In this workspace", icon: ListChecks, color: "green" },
      { label: "Categories", value: deliverableCategories.length, detail: "MI work classifications", icon: Layers3, color: "blue" },
      { label: "Frequencies", value: frequencyCount, detail: "Distinct schedules in use", icon: CalendarClock, color: "orange" },
    ].map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="rounded-lg border border-[#e4e9e4] bg-white p-5 shadow-[0_1px_2px_rgba(24,35,29,.03)]"><div className="flex items-start justify-between"><p className="text-[13px] font-medium text-[#78847c]">{label}</p><span className={`grid size-9 place-items-center rounded-md ${color === "green" ? "bg-[#e7f3eb] text-[#287b4f]" : color === "blue" ? "bg-[#e9f1f7] text-[#557e98]" : "bg-[#fff2e5] text-[#b0783b]"}`}><Icon size={17} /></span></div><p className="display-font mt-5 text-[30px] font-bold leading-none tabular-nums text-[#18231d]">{value}</p><p className="mt-2.5 text-xs text-[#89948c]">{detail}</p></article>)}</section>
    <section className="overflow-hidden rounded-lg border border-[#e4e9e4] bg-white"><div className="border-b border-[#e9eeea] px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-[#e7f3eb] text-[#287b4f]"><Plus size={18} /></span><div><h2 className="display-font text-base font-bold">Add Deliverable</h2><p className="mt-0.5 text-xs text-[#78847c]">New processes are saved in this browser.</p></div></div></div>
      <form onSubmit={addDeliverable} onChange={() => setFeedback("")} className="space-y-5 p-5 sm:p-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-[#59665d]">Name<input name="name" required maxLength={120} placeholder="e.g. Monthly market update" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Category<select name="category" required defaultValue="" className={fieldClassName}><option value="" disabled>Select a category</option>{deliverableCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="text-xs font-semibold text-[#59665d]">Frequency<input name="frequency" required maxLength={100} placeholder="e.g. Monthly or per period" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Primary owner<input name="owner" maxLength={100} placeholder="Unassigned" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Backup owner<input name="backupOwner" maxLength={100} placeholder="Unassigned" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Priority<select name="priority" className={fieldClassName}><option>Medium</option><option>Low</option><option>High</option><option>Urgent</option></select></label><label className="text-xs font-semibold text-[#59665d]">Next due date<input name="nextDueDate" type="date" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Reporting schedule<input name="reportingSchedule" placeholder="e.g. Monthly board reporting" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d] sm:col-span-2">Description<textarea name="description" required maxLength={500} rows={4} placeholder="What does this deliverable include?" className="mt-1.5 w-full resize-y rounded-md border border-[#e2e8e3] bg-white px-3 py-2.5 text-sm text-[#354339] outline-none focus:border-[#6a9b78] focus:ring-2 focus:ring-[#287b4f]/15" /></label></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef1ee] pt-4"><p aria-live="polite" className="min-h-5 text-xs text-[#287b4f]">{feedback}</p><button type="submit" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#287b4f] px-4 text-sm font-semibold text-white transition hover:bg-[#1d5c3a]"><Save size={15} /> Add deliverable</button></div></form>
    </section>
    <section className="rounded-lg border border-[#e4e9e4] bg-white p-5"><h2 className="display-font text-sm font-bold">Manage records</h2><div className="mt-3 divide-y divide-[#eef1ee]">{items.slice(0, 12).map((item) => <Link key={item.id} href={`/deliverables/${item.id}`} className="flex items-center justify-between gap-3 py-3 text-xs hover:text-[#287b4f]"><span className="font-semibold">{item.name}</span><span className="text-[#89948c]">{item.state} · {item.cycles.length} cycles</span></Link>)}</div></section>
  </div>;
}
