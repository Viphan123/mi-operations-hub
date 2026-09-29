"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, FilterX, Search } from "lucide-react";
import { deliverableCategories } from "@/data/deliverables";
import { useWorkflows, type WorkflowDeliverable } from "@/data/workflows";

const statusStyles: Record<string, string> = {
  "Not started": "bg-[#eef2ee] text-[#5f6d63]", "In progress": "bg-[#e9f1f7] text-[#456f8b]",
  "Needs scheduling": "bg-[#fff2e5] text-[#a36a2e]", "Completed": "bg-[#e7f3eb] text-[#287b4f]",
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

function DeliverableCard({ item }: { item: WorkflowDeliverable }) {
  return (
    <article className="flex min-h-[248px] flex-col rounded-lg border border-[#e4e9e4] bg-white p-5 shadow-[0_1px_2px_rgba(24,35,29,.03)] transition hover:border-[#cbd9cd] hover:shadow-[0_5px_18px_rgba(24,35,29,.06)]">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <span className="inline-flex max-w-full rounded-full bg-[#edf4ee] px-2.5 py-1 text-[10px] font-semibold leading-4 text-[#287b4f]">{item.category}</span>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[item.status] ?? "bg-[#eef2ee] text-[#5f6d63]"}`}>{item.status}</span>
      </div>
      <h2 className="display-font mt-4 text-[15px] font-bold leading-5 text-[#243128]"><Link href={`/deliverables/${item.id}`} className="hover:text-[#287b4f]">{item.name}</Link></h2>
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
  const { items: deliverables } = useWorkflows();
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

  return (
    <div className="page-enter space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="page-title">Deliverable register</h2>
          <p className="page-description mt-2">Track ownership, progress, and due dates across Market Intelligence.</p>
          <p className="mt-1.5 text-xs tabular-nums text-[#89948c]">{deliverables.length} deliverables in the workspace</p>
        </div>
        <Link href="/admin" className="inline-flex h-10 items-center rounded-md border border-[#dbe5dc] bg-white px-4 text-sm font-semibold text-[#287b4f] hover:bg-[#edf4ee]">Add deliverable</Link>
      </section>

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
        {filteredDeliverables.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDeliverables.map((item) => <DeliverableCard key={item.id} item={item} />)}
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
