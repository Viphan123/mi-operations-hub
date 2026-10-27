"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, FilterX, PencilLine, Plus, Search, Trash2, X } from "lucide-react";
import { deliverableCategories, type DeliverableCategory } from "@/data/deliverable-types";
import { createDefaultCycle, useWorkflows, type Priority, type TaskStatus, type WorkflowDeliverable } from "@/data/workflows";

const statusStyles: Record<string, string> = {
  "Not Started": "bg-[#eef2ee] text-[#5f6d63]", "In Progress": "bg-[#e9f1f7] text-[#456f8b]",
  "On Hold": "bg-[#fff2e5] text-[#a36a2e]", "Completed": "bg-[#e7f3eb] text-[#287b4f]",
};

function formatDueDate(date: string | null) {
  if (!date) return "Not scheduled";
  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const allLabel = label === "Category" ? "All categories" : label === "Frequency" ? "All frequencies" : `All ${label.toLowerCase()}s`;

  return (
    <label className="relative min-w-0 flex-1">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#69766d]">{label}</span>
      <select
        aria-label={`Filter by ${label.toLowerCase()}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-[#e2e8e3] bg-white py-2 pl-3 pr-9 text-xs text-[#39473e] outline-none transition focus:border-[#6a9b78] focus:ring-2 focus:ring-[#287b4f]/15"
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute bottom-[13px] right-3 text-[#89948c]" />
    </label>
  );
}

const fieldClass = "mt-1.5 h-10 w-full rounded-md border border-[#e2e8e3] bg-white px-3 text-sm text-[#354339] outline-none focus:border-[#6a9b78] focus:ring-2 focus:ring-[#287b4f]/15";

function DeliverableEditor({
  initial,
  isCreating,
  saving,
  onSave,
  onCancel,
}: {
  initial: WorkflowDeliverable;
  isCreating: boolean;
  saving: boolean;
  onSave: (item: WorkflowDeliverable) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const change = <K extends keyof WorkflowDeliverable>(field: K, value: WorkflowDeliverable[K]) => setDraft((current) => ({ ...current, [field]: value }));

  return <section className="rounded-lg border border-[#cbd9cd] bg-white p-5 shadow-sm" aria-label={isCreating ? "Add deliverable" : "Edit deliverable"}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div><h2 className="display-font text-base font-bold">{isCreating ? "Add deliverable" : "Edit deliverable"}</h2><p className="mt-1 text-xs text-[#78847c]">Changes are saved to the shared workspace.</p></div>
      <button type="button" onClick={onCancel} aria-label="Cancel editing" className="rounded p-1 text-[#78847c] hover:bg-[#f2f5f2]"><X size={18} /></button>
    </div>
    <form onSubmit={(event) => { event.preventDefault(); onSave(draft); }} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <label className="text-xs font-semibold text-[#59665d]">Name<input required maxLength={120} value={draft.name} onChange={(event) => change("name", event.target.value)} className={fieldClass} /></label>
      <label className="text-xs font-semibold text-[#59665d]">Category<select value={draft.category} onChange={(event) => change("category", event.target.value as DeliverableCategory)} className={fieldClass}>{deliverableCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#59665d]">Frequency<input required maxLength={100} value={draft.frequency} onChange={(event) => change("frequency", event.target.value)} className={fieldClass} /></label>
      <label className="text-xs font-semibold text-[#59665d]">Owner<input maxLength={100} value={draft.owner} onChange={(event) => change("owner", event.target.value)} className={fieldClass} /></label>
      <label className="text-xs font-semibold text-[#59665d]">Backup owner<input maxLength={100} value={draft.backupOwner} onChange={(event) => change("backupOwner", event.target.value)} className={fieldClass} /></label>
      <label className="text-xs font-semibold text-[#59665d]">Status<select value={draft.status} onChange={(event) => change("status", event.target.value as TaskStatus)} className={fieldClass}>{["Not Started", "In Progress", "On Hold", "Completed"].map((status) => <option key={status}>{status}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#59665d]">Priority<select value={draft.priority} onChange={(event) => change("priority", event.target.value as Priority)} className={fieldClass}>{["Low", "Medium", "High", "Urgent"].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#59665d]">Next due date<input type="date" value={draft.nextDueDate ?? ""} onChange={(event) => change("nextDueDate", event.target.value || null)} className={fieldClass} /></label>
      <label className="text-xs font-semibold text-[#59665d]">Reporting schedule<input maxLength={200} value={draft.reportingSchedule} onChange={(event) => change("reportingSchedule", event.target.value)} className={fieldClass} /></label>
      <label className="text-xs font-semibold text-[#59665d] sm:col-span-2 xl:col-span-3">Description<textarea required maxLength={2000} rows={3} value={draft.description} onChange={(event) => change("description", event.target.value)} className="mt-1.5 w-full resize-y rounded-md border border-[#e2e8e3] bg-white px-3 py-2 text-sm text-[#354339] outline-none focus:border-[#6a9b78] focus:ring-2 focus:ring-[#287b4f]/15" /></label>
      <div className="flex flex-wrap justify-end gap-2 border-t border-[#eef1ee] pt-3 sm:col-span-2 xl:col-span-3">
        <button type="button" onClick={onCancel} className="h-10 rounded-md border border-[#e2e8e3] px-4 text-sm font-semibold text-[#68756c] hover:bg-[#f7f9f7]">Cancel</button>
        <button type="submit" disabled={saving} className="h-10 rounded-md bg-[#287b4f] px-4 text-sm font-semibold text-white hover:bg-[#1d5c3a] disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
      </div>
    </form>
  </section>;
}

function DeliverableCard({ item, canEdit, onEdit, onDelete }: {
  item: WorkflowDeliverable;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex min-h-[248px] flex-col rounded-lg border border-[#e4e9e4] bg-white p-5 shadow-[0_1px_2px_rgba(24,35,29,.03)] transition hover:border-[#cbd9cd] hover:shadow-[0_5px_18px_rgba(24,35,29,.06)]">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <span className="inline-flex max-w-full rounded-full bg-[#edf4ee] px-2.5 py-1 text-[10px] font-semibold leading-4 text-[#287b4f]">{item.category}</span>
        <div className="flex items-center gap-2">
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[item.status] ?? "bg-[#eef2ee] text-[#5f6d63]"}`}>{item.status}</span>
          {canEdit && <button type="button" onClick={onEdit} aria-label={`Edit ${item.name}`} className="rounded p-1 text-[#68756c] hover:bg-[#edf4ee] hover:text-[#287b4f]"><PencilLine size={14} /></button>}
          {canEdit && <button type="button" onClick={onDelete} aria-label={`Delete ${item.name}`} className="rounded p-1 text-[#89948c] hover:bg-[#fff0ec] hover:text-[#9a4934]"><Trash2 size={14} /></button>}
        </div>
      </div>
      <h2 className="display-font mt-4 text-[15px] font-bold leading-5 text-[#243128]"><Link href={`/deliverables/${encodeURIComponent(item.id)}`} className="hover:text-[#287b4f]">{item.name}</Link></h2>
      <p className="mt-1 line-clamp-2 min-h-8 text-xs leading-4 text-[#78847c]">{item.description}</p>
      <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#eef1ee] pt-4">
        <div>
          <dt className="text-[10px] font-medium text-[#89948c]">Frequency</dt>
          <dd className="mt-1 line-clamp-2 text-xs font-semibold leading-4 text-[#4d5b51]">{item.frequency}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium text-[#89948c]">Owner</dt>
          <dd className="mt-1 truncate text-xs font-semibold leading-4 text-[#4d5b51]">{item.owner}</dd>
        </div>
        <div className="col-span-2 flex items-center gap-1.5">
          <CalendarDays size={13} className="shrink-0 text-[#89948c]" />
          <div>
            <dt className="sr-only">Next due date</dt>
            <dd className="text-xs font-semibold text-[#4d5b51]">{formatDueDate(item.nextDueDate)}</dd>
          </div>
          <span className="ml-1 text-[10px] text-[#89948c]">Next due</span>
        </div>
      </dl>
    </article>
  );
}

export default function DeliverablesPage() {
  const { items: deliverables, hydrated, canEdit, createItem, saveItemNow, deleteItem } = useWorkflows();
  const [editor, setEditor] = useState<WorkflowDeliverable | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [frequency, setFrequency] = useState("all");
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState("all");
  const frequencies = [...new Set(deliverables.map((item) => item.frequency))].sort((first, second) => first.localeCompare(second));
  const owners = [...new Set(deliverables.map((item) => item.owner))].sort((first, second) => first.localeCompare(second));
  const statuses = [...new Set(deliverables.map((item) => item.status))].sort((first, second) => first.localeCompare(second));

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredDeliverables = deliverables.filter((item) => {
    const matchesQuery = !normalizedQuery || [
      item.name,
      item.category,
      item.frequency,
      item.owner,
      item.status,
      item.description,
    ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));

    return matchesQuery
      && (category === "all" || item.category === category)
      && (frequency === "all" || item.frequency === frequency)
      && (owner === "all" || item.owner === owner)
      && (status === "all" || item.status === status);
  });

  const hasActiveFilters = Boolean(normalizedQuery) || category !== "all" || frequency !== "all" || owner !== "all" || status !== "all";
  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setFrequency("all");
    setOwner("all");
    setStatus("all");
  };

  function startNewDeliverable() {
    const id = crypto.randomUUID();
    setActionError(null);
    setIsCreating(true);
    setEditor({
      id,
      name: "",
      category: deliverableCategories[0],
      description: "",
      frequency: "",
      owner: "Unassigned",
      backupOwner: "Unassigned",
      status: "Not Started",
      priority: "Medium",
      nextDueDate: null,
      reportingSchedule: "",
      notes: "",
      state: "Active",
      cycles: [createDefaultCycle(id)],
      links: [],
      activity: ["Deliverable created"],
    });
  }

  async function saveDeliverable(item: WorkflowDeliverable) {
    setSaving(true);
    setActionError(null);
    try {
      if (isCreating) {
        const created = { ...item, activity: [`Created ${new Date().toLocaleDateString()}`, ...item.activity] };
        await createItem(created);
      } else {
        await saveItemNow({ ...item, activity: [`Updated ${new Date().toLocaleDateString()}`, ...item.activity].slice(0, 12) });
      }
      setEditor(null);
      setIsCreating(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to save deliverable.");
    } finally {
      setSaving(false);
    }
  }

  async function removeDeliverable(item: WorkflowDeliverable) {
    if (!window.confirm(`Delete "${item.name}" and its workflow details? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteItem(item.id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to delete deliverable.");
    }
  }

  return (
    <div className="page-enter space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="page-title">Deliverable register</h2>
          <p className="page-description mt-2">Track ownership, progress, and due dates across Market Intelligence.</p>
          <p className="mt-1.5 text-xs tabular-nums text-[#89948c]">{deliverables.length} deliverables in the workspace</p>
        </div>
        {canEdit && <button type="button" onClick={startNewDeliverable} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#dbe5dc] bg-white px-4 text-sm font-semibold text-[#287b4f] hover:bg-[#edf4ee]"><Plus size={15} /> Add deliverable</button>}
      </section>

      {editor && canEdit && <DeliverableEditor key={editor.id} initial={editor} isCreating={isCreating} saving={saving} onSave={(item) => void saveDeliverable(item)} onCancel={() => { setEditor(null); setIsCreating(false); }} />}
      {actionError && <p role="alert" className="rounded-md border border-[#e7c8be] bg-[#fff8f5] px-4 py-3 text-sm text-[#9a4934]">{actionError}</p>}

      <section className="rounded-lg border border-[#e4e9e4] bg-white p-4 sm:p-5" aria-label="Search and filter deliverables">
        <label className="flex h-10 w-full items-center gap-2.5 rounded-md border border-[#e2e8e3] bg-[#fbfcfb] px-3 text-[#89948c] focus-within:border-[#6a9b78] focus-within:ring-2 focus-within:ring-[#287b4f]/15">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, description, owner..."
            aria-label="Search deliverables"
            className="w-full bg-transparent text-sm text-[#26342b] outline-none placeholder:text-[#a0aaa3]"
          />
        </label>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect label="Category" value={category} options={deliverableCategories} onChange={setCategory} />
          <FilterSelect label="Frequency" value={frequency} options={frequencies} onChange={setFrequency} />
          <FilterSelect label="Owner" value={owner} options={owners} onChange={setOwner} />
          <FilterSelect label="Status" value={status} options={statuses} onChange={setStatus} />
        </div>
      </section>

      <section aria-label="Deliverables">
        <div className="mb-3 flex min-h-8 flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#354339]" aria-live="polite">{filteredDeliverables.length} results</p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-[#5f6d63] hover:bg-[#edf4ee] hover:text-[#287b4f]">
              <FilterX size={14} /> Clear filters
            </button>
          )}
        </div>
        {!hydrated ? <div className="rounded-lg border border-[#e4e9e4] bg-white px-5 py-14 text-center text-sm text-[#78847c]">Loading deliverables...</div> : filteredDeliverables.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDeliverables.map((item) => <DeliverableCard key={item.id} item={item} canEdit={canEdit} onEdit={() => { setActionError(null); setIsCreating(false); setEditor(item); }} onDelete={() => void removeDeliverable(item)} />)}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#cfd9d0] bg-white px-5 py-14 text-center">
            <div className="mx-auto grid size-10 place-items-center rounded-full bg-[#edf4ee] text-[#53705c]"><Search size={18} /></div>
            <h2 className="display-font mt-4 text-sm font-bold text-[#354339]">No deliverables found</h2>
            <p className="mt-1 text-xs text-[#78847c]">Try another search or clear the selected filters.</p>
            {hasActiveFilters && <button type="button" onClick={clearFilters} className="mt-4 rounded-md bg-[#287b4f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d5c3a]">Clear filters</button>}
          </div>
        )}
      </section>
    </div>
  );
}
