"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronDown, Database, FileText, FilterX, LayoutDashboard, PlayCircle, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type DocumentationType = "SOP" | "Training Video" | "Report" | "Data Source" | "Dashboard";

type DocumentationItem = {
  title: string;
  deliverable: string;
  deliverableId: string;
  type: DocumentationType;
  link: string;
};

const documentationTypes: DocumentationType[] = ["SOP", "Training Video", "Report", "Data Source", "Dashboard"];

const documentation: DocumentationItem[] = [
  { title: "Import Reporting Standard Operating Procedure", deliverable: "Weekly Import Report", deliverableId: "weekly-import-report", type: "SOP", link: "/deliverables/weekly-import-report" },
  { title: "Monthly Market Report Walkthrough", deliverable: "EB Monthly Market Report", deliverableId: "eb-monthly-market-report", type: "Training Video", link: "/deliverables/eb-monthly-market-report" },
  { title: "Weekly Import Report", deliverable: "Weekly Import Report", deliverableId: "weekly-import-report", type: "Report", link: "/deliverables/weekly-import-report" },
  { title: "StatCan Imports and Exports Reference", deliverable: "StatCan Imports and Exports", deliverableId: "statcan-imports-exports", type: "Data Source", link: "/deliverables/statcan-imports-exports" },
  { title: "MI Dashboard Guide", deliverable: "Dashboard Updates: Nielsen, HPAI, Imports, Processed Egg Demand, IP Declaration and Hen Matrix", deliverableId: "tableau-dashboard-updates", type: "Dashboard", link: "/deliverables/tableau-dashboard-updates" },
  { title: "HHT Reporting Procedure", deliverable: "HHT Report", deliverableId: "hht-report", type: "SOP", link: "/deliverables/hht-report" },
  { title: "Nielsen Data Reference", deliverable: "Nielsen Data", deliverableId: "nielsen-data", type: "Data Source", link: "/deliverables/nielsen-data" },
  { title: "MI Scorecard Overview", deliverable: "MI Scorecard to COO", deliverableId: "mi-scorecard-to-coo", type: "Training Video", link: "/deliverables/mi-scorecard-to-coo" },
];

const typeIcons: Record<DocumentationType, LucideIcon> = {
  SOP: BookOpen,
  "Training Video": PlayCircle,
  Report: FileText,
  "Data Source": Database,
  Dashboard: LayoutDashboard,
};

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
  return (
    <label className="relative min-w-0 flex-1">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#69766d]">{label}</span>
      <select
        aria-label={`Filter by ${label.toLowerCase()}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-[#e2e8e3] bg-white py-2 pl-3 pr-9 text-xs text-[#39473e] outline-none transition focus:border-[#6a9b78] focus:ring-2 focus:ring-[#287b4f]/15"
      >
        <option value="all">All {label.toLowerCase()}s</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute bottom-[13px] right-3 text-[#89948c]" />
    </label>
  );
}

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [deliverable, setDeliverable] = useState("all");
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredDocumentation = documentation.filter((item) => {
    const matchesQuery = !normalizedQuery || [item.title, item.deliverable, item.type]
      .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
    return matchesQuery
      && (type === "all" || item.type === type)
      && (deliverable === "all" || item.deliverableId === deliverable);
  });

  const hasActiveFilters = Boolean(normalizedQuery) || type !== "all" || deliverable !== "all";
  const deliverableOptions = [...new Map(documentation.map((item) => [item.deliverableId, item.deliverable])).entries()]
    .sort((first, second) => first[1].localeCompare(second[1]));
  const clearFilters = () => {
    setQuery("");
    setType("all");
    setDeliverable("all");
  };

  return (
    <div className="page-enter space-y-6">
      <section>
        <h2 className="page-title">Documentation library</h2>
        <p className="page-description mt-2">Browse procedures, reports, training, and data references.</p>
      </section>

      <section className="rounded-lg border border-[#e4e9e4] bg-white p-4 sm:p-5" aria-label="Search and filter documentation">
        <label className="flex h-10 w-full items-center gap-2.5 rounded-md border border-[#e2e8e3] bg-[#fbfcfb] px-3 text-[#89948c] focus-within:border-[#6a9b78] focus-within:ring-2 focus-within:ring-[#287b4f]/15">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles or deliverables..."
            aria-label="Search documentation"
            className="w-full bg-transparent text-sm text-[#26342b] outline-none placeholder:text-[#a0aaa3]"
          />
        </label>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FilterSelect label="Type" value={type} options={documentationTypes} onChange={setType} />
          <label className="relative min-w-0 flex-1">
            <span className="mb-1.5 block text-[11px] font-semibold text-[#69766d]">Deliverable</span>
            <select
              aria-label="Filter by deliverable"
              value={deliverable}
              onChange={(event) => setDeliverable(event.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-[#e2e8e3] bg-white py-2 pl-3 pr-9 text-xs text-[#39473e] outline-none transition focus:border-[#6a9b78] focus:ring-2 focus:ring-[#287b4f]/15"
            >
              <option value="all">All deliverables</option>
              {deliverableOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute bottom-[13px] right-3 text-[#89948c]" />
          </label>
        </div>
      </section>

      <section aria-label="Documentation items">
        <div className="mb-3 flex min-h-8 items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#354339]" aria-live="polite">{filteredDocumentation.length} resources</p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-[#5f6d63] hover:bg-[#edf4ee] hover:text-[#287b4f]">
              <FilterX size={14} /> Clear filters
            </button>
          )}
        </div>
        {filteredDocumentation.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDocumentation.map((item) => {
              const Icon = typeIcons[item.type];
              return (
                <article key={item.title} className="flex min-h-[220px] flex-col rounded-lg border border-[#e4e9e4] bg-white p-5 shadow-[0_1px_2px_rgba(24,35,29,.03)] transition hover:border-[#cbd9cd] hover:shadow-[0_5px_18px_rgba(24,35,29,.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#e7f3eb] text-[#287b4f]"><Icon size={18} /></span>
                    <span className="rounded-full bg-[#f0f4f0] px-2.5 py-1 text-[10px] font-semibold text-[#59665d]">{item.type}</span>
                  </div>
                  <h2 className="display-font mt-4 text-[15px] font-bold leading-5 text-[#243128]">{item.title}</h2>
                  <div className="mt-4 border-t border-[#eef1ee] pt-3">
                    <p className="text-[10px] font-medium text-[#89948c]">Deliverable</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-4 text-[#59665d]">{item.deliverable}</p>
                  </div>
                  <Link href={item.link} className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-semibold text-[#287b4f] hover:text-[#1d5c3a]">
                    Open deliverable <ArrowUpRight size={14} />
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#cfd9d0] bg-white px-5 py-14 text-center">
            <div className="mx-auto grid size-10 place-items-center rounded-full bg-[#edf4ee] text-[#53705c]"><Search size={18} /></div>
            <h2 className="display-font mt-4 text-sm font-bold text-[#354339]">No documentation found</h2>
            <p className="mt-1 text-xs text-[#78847c]">Try a different search or clear the selected filters.</p>
            {hasActiveFilters && <button type="button" onClick={clearFilters} className="mt-4 rounded-md bg-[#287b4f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d5c3a]">Clear filters</button>}
          </div>
        )}
      </section>
    </div>
  );
}
