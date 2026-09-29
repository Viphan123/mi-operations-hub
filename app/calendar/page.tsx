"use client";

import Link from "next/link";
import { useWorkflows } from "@/data/workflows";
import { ArrowRight, CalendarClock, CalendarDays, CircleHelp } from "lucide-react";
import type { WorkflowDeliverable } from "@/data/workflows";

function CadenceRow({ item }: { item: WorkflowDeliverable }) {
  return (
    <Link href={`/deliverables/${item.id}`} className="flex flex-wrap items-center gap-3 border-b border-[#eef1ee] px-4 py-3.5 last:border-0 hover:bg-[#fafbfa] sm:px-5">
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#edf4ee] text-[#287b4f]"><CalendarDays size={15} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[#2b392f]">{item.name}</span>
        <span className="mt-0.5 block text-[11px] text-[#89948c]">{item.category}</span>
      </span>
      <span className="rounded-full bg-[#f0f4f0] px-2.5 py-1 text-[10px] font-semibold text-[#59665d]">{item.frequency}</span>
      <ArrowRight size={15} className="hidden shrink-0 text-[#a0aaa3] sm:block" />
    </Link>
  );
}

export default function CalendarPage() {
  const { items } = useWorkflows();
  const needsScheduling = items.filter((item) => {
    const frequency = item.frequency.toLowerCase();
    return frequency.includes("to be determined") || frequency.includes("not specified");
  });
  const scheduledCadence = items.filter((item) => !needsScheduling.includes(item));
  const scheduledCount = items.filter((item) => item.nextDueDate).length;
  return (
    <div className="page-enter space-y-6">
      <section>
        <h2 className="page-title">Schedule overview</h2>
        <p className="page-description mt-2">Review recurring work and meeting-linked reporting schedules.</p>
        <p className="mt-1 text-xs text-[#89948c]">{scheduledCount} deliverables have a next due date. See task deadlines on each deliverable.</p>
      </section>

      <section className="overflow-hidden rounded-lg border border-[#e4e9e4] bg-white">
        <div className="flex items-center justify-between border-b border-[#e9eeea] px-5 py-4">
          <div><h2 className="display-font text-[15px] font-bold">Recurring and meeting-linked deliverables</h2><p className="mt-1 text-xs text-[#78847c]">{scheduledCadence.length} items with a stated cadence</p></div>
          <CalendarClock size={18} className="text-[#53705c]" />
        </div>
        {scheduledCadence.map((item) => <CadenceRow key={item.id} item={item} />)}
      </section>

      <section className="overflow-hidden rounded-lg border border-[#e4e9e4] bg-white">
        <div className="flex items-center gap-3 border-b border-[#e9eeea] px-5 py-4">
          <span className="grid size-8 place-items-center rounded-md bg-[#fff2e5] text-[#a36a2e]"><CircleHelp size={16} /></span>
          <div><h2 className="display-font text-[15px] font-bold">Cadence to confirm</h2><p className="mt-1 text-xs text-[#78847c]">{needsScheduling.length} items need a schedule or frequency decision</p></div>
        </div>
        {needsScheduling.map((item) => <CadenceRow key={item.id} item={item} />)}
      </section>
    </div>
  );
}
