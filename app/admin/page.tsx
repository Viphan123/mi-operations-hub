"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CalendarClock, Layers3, ListChecks, PencilLine, Plus, Save, Trash2 } from "lucide-react";
import { deliverableCategories, type DeliverableCategory } from "@/data/deliverable-types";
import { createDefaultCycle, useWorkflows, type Priority, type WorkflowDeliverable } from "@/data/workflows";

const fieldClassName = "mt-1.5 h-10 w-full rounded-md border border-[#e2e8e3] bg-white px-3 text-sm text-[#354339] outline-none transition placeholder:text-[#a0aaa3] focus:border-[#6a9b78] focus:ring-2 focus:ring-[#287b4f]/15";

export default function AdminPage() {
  const { items, createItem, deleteItem, hydrated, canEdit } = useWorkflows();
  const [feedback, setFeedback] = useState("");
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const frequencyCount = new Set(items.map((item) => item.frequency)).size;

  async function addDeliverable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const id = crypto.randomUUID();
    const item: WorkflowDeliverable = {
      id, name: String(values.get("name")).trim(), category: String(values.get("category")) as DeliverableCategory,
      frequency: String(values.get("frequency")).trim(), owner: String(values.get("owner")).trim() || "Unassigned", backupOwner: String(values.get("backupOwner")).trim() || "Unassigned",
      status: "Not Started", priority: String(values.get("priority")) as Priority, nextDueDate: String(values.get("nextDueDate")) || null,
      description: String(values.get("description")).trim(), reportingSchedule: String(values.get("reportingSchedule")).trim(), notes: "", state: "Active", cycles: [createDefaultCycle(id)], links: [], activity: ["Deliverable created"],
    };
    setSaving(true);
    try {
      await createItem(item);
      setFeedback(`${item.name} added and saved to the shared workspace.`);
      setFeedbackIsError(false);
      form.reset();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to add deliverable.");
      setFeedbackIsError(true);
    } finally {
      setSaving(false);
    }
  }

  async function removeDeliverable(item: WorkflowDeliverable) {
    if (!window.confirm(`Delete "${item.name}" and its workflow details? This cannot be undone.`)) return;
    setSaving(true);
    setFeedback("");
    try {
      await deleteItem(item.id);
      setFeedback(`${item.name} was deleted from the shared workspace.`);
      setFeedbackIsError(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to delete deliverable.");
      setFeedbackIsError(true);
    } finally {
      setSaving(false);
    }
  }

  return <div className="page-enter mx-auto max-w-[1120px] space-y-7">
    <section className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="page-title">Workspace administration</h2><p className="page-description mt-2">Manage the shared Market Intelligence deliverable register.</p></div></section>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Deliverable summary">{[
      { label: "Total Deliverables", value: items.length, detail: "In this workspace", icon: ListChecks, color: "green" },
      { label: "Categories", value: deliverableCategories.length, detail: "MI work classifications", icon: Layers3, color: "blue" },
      { label: "Frequencies", value: frequencyCount, detail: "Distinct schedules in use", icon: CalendarClock, color: "orange" },
    ].map(({ label, value, detail, icon: Icon, color }) => <article key={label} className="rounded-lg border border-[#e4e9e4] bg-white p-5 shadow-[0_1px_2px_rgba(24,35,29,.03)]"><div className="flex items-start justify-between"><p className="text-[13px] font-medium text-[#78847c]">{label}</p><span className={`grid size-9 place-items-center rounded-md ${color === "green" ? "bg-[#e7f3eb] text-[#287b4f]" : color === "blue" ? "bg-[#e9f1f7] text-[#557e98]" : "bg-[#fff2e5] text-[#b0783b]"}`}><Icon size={17} /></span></div><p className="display-font mt-5 text-[30px] font-bold leading-none tabular-nums text-[#18231d]">{value}</p><p className="mt-2.5 text-xs text-[#89948c]">{detail}</p></article>)}</section>
    {canEdit && <section className="overflow-hidden rounded-lg border border-[#e4e9e4] bg-white"><div className="border-b border-[#e9eeea] px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-[#e7f3eb] text-[#287b4f]"><Plus size={18} /></span><div><h2 className="display-font text-base font-bold">Add Deliverable</h2><p className="mt-0.5 text-xs text-[#78847c]">New processes are saved to the shared workspace.</p></div></div></div>
      <form onSubmit={addDeliverable} onChange={() => { setFeedback(""); setFeedbackIsError(false); }} className="space-y-5 p-5 sm:p-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-[#59665d]">Name<input name="name" required maxLength={120} placeholder="e.g. Monthly market update" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Category<select name="category" required defaultValue="" className={fieldClassName}><option value="" disabled>Select a category</option>{deliverableCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="text-xs font-semibold text-[#59665d]">Frequency<input name="frequency" required maxLength={100} placeholder="e.g. Monthly or per period" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Primary owner<input name="owner" maxLength={100} placeholder="Unassigned" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Backup owner<input name="backupOwner" maxLength={100} placeholder="Unassigned" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Priority<select name="priority" className={fieldClassName}><option>Medium</option><option>Low</option><option>High</option><option>Urgent</option></select></label><label className="text-xs font-semibold text-[#59665d]">Next due date<input name="nextDueDate" type="date" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d]">Reporting schedule<input name="reportingSchedule" placeholder="e.g. Monthly board reporting" className={fieldClassName} /></label><label className="text-xs font-semibold text-[#59665d] sm:col-span-2">Description<textarea name="description" required maxLength={500} rows={4} placeholder="What does this deliverable include?" className="mt-1.5 w-full resize-y rounded-md border border-[#e2e8e3] bg-white px-3 py-2.5 text-sm text-[#354339] outline-none focus:border-[#6a9b78] focus:ring-2 focus:ring-[#287b4f]/15" /></label></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef1ee] pt-4"><p aria-live="polite" className={`min-h-5 text-xs ${feedbackIsError ? "text-[#9a4934]" : "text-[#287b4f]"}`}>{feedback}</p><button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#287b4f] px-4 text-sm font-semibold text-white transition hover:bg-[#1d5c3a] disabled:opacity-60"><Save size={15} /> {saving ? "Saving..." : "Add deliverable"}</button></div></form>
    </section>}
    <section className="rounded-lg border border-[#e4e9e4] bg-white p-5">
      <h2 className="display-font text-sm font-bold">Manage records</h2>
      {!hydrated ? <p className="py-8 text-center text-sm text-[#78847c]">Loading deliverables...</p> : items.length ? <div className="mt-3 divide-y divide-[#eef1ee]">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 py-3 text-xs">
        <Link href={`/deliverables/${encodeURIComponent(item.id)}`} className="min-w-0 flex-1 hover:text-[#287b4f]"><span className="block truncate font-semibold">{item.name}</span><span className="mt-1 block text-[#89948c]">{item.state} · {item.cycles.length} cycles</span></Link>
        <Link href={`/deliverables/${encodeURIComponent(item.id)}`} aria-label={`Edit ${item.name}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#dbe5dc] px-2.5 font-semibold text-[#287b4f] hover:bg-[#edf4ee]"><PencilLine size={13} /> Edit</Link>
        {canEdit && <button type="button" onClick={() => void removeDeliverable(item)} disabled={saving} aria-label={`Delete ${item.name}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e7c8be] px-2.5 font-semibold text-[#9a4934] hover:bg-[#fff8f5] disabled:opacity-60"><Trash2 size={13} /> Delete</button>}
      </div>)}</div> : <p className="py-8 text-center text-sm text-[#78847c]">No deliverables found.</p>}
    </section>
  </div>;
}
