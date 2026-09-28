import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, FileText, History, MessageSquareText } from "lucide-react";
import { deliverables, type DeliverableStatus } from "@/data/deliverables";

const statusStyles: Record<DeliverableStatus, string> = {
  "Not started": "bg-[#eef2ee] text-[#5f6d63]",
  "In progress": "bg-[#e9f1f7] text-[#456f8b]",
  "Needs scheduling": "bg-[#fff2e5] text-[#a36a2e]",
};

function formatDueDate(date: string | null) {
  if (!date) return "Not scheduled";
  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium text-[#89948c]">{label}</dt>
      <dd className="mt-1.5 break-words text-sm font-semibold text-[#354339]">{children}</dd>
    </div>
  );
}

function EmptySection({ children }: { children: React.ReactNode }) {
  return <p className="min-h-[88px] rounded-md border border-dashed border-[#d9e2da] bg-[#f8faf8] px-4 py-5 text-sm leading-5 text-[#78847c]">{children}</p>;
}

export default async function DeliverableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deliverable = deliverables.find((item) => item.id === id);

  if (!deliverable) notFound();

  return (
    <div className="page-enter mx-auto max-w-[1000px] space-y-6">
      <Link href="/deliverables" className="inline-flex items-center gap-2 text-xs font-semibold text-[#68756c] hover:text-[#287b4f]">
        <ArrowLeft size={15} /> Back to deliverables
      </Link>

      <section className="rounded-lg border border-[#e4e9e4] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-[#edf4ee] px-2.5 py-1 text-[10px] font-semibold leading-4 text-[#287b4f]">{deliverable.category}</span>
            <h2 className="page-title mt-4">{deliverable.name}</h2>
            <p className="page-description mt-2 max-w-[680px]">{deliverable.description}</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[deliverable.status]}`}>{deliverable.status}</span>
        </div>

        <dl className="mt-7 grid grid-cols-1 gap-5 border-t border-[#eef1ee] pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Category">{deliverable.category}</DetailField>
          <DetailField label="Frequency"><span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-[#89948c]" />{deliverable.frequency}</span></DetailField>
          <DetailField label="Owner">{deliverable.owner}</DetailField>
          <DetailField label="Status"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[deliverable.status]}`}>{deliverable.status}</span></DetailField>
          <DetailField label="Next Due Date"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-[#89948c]" />{formatDueDate(deliverable.nextDueDate)}</span></DetailField>
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-[#e4e9e4] bg-white p-5">
          <div className="mb-4 flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-md bg-[#e9f1f7] text-[#557e98]"><FileText size={16} /></span><h3 className="display-font text-sm font-bold">Documentation</h3></div>
          <EmptySection>No documentation has been added yet.</EmptySection>
        </article>
        <article className="rounded-lg border border-[#e4e9e4] bg-white p-5">
          <div className="mb-4 flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-md bg-[#fff2e5] text-[#b0783b]"><MessageSquareText size={16} /></span><h3 className="display-font text-sm font-bold">Notes</h3></div>
          <EmptySection>No notes have been added yet.</EmptySection>
        </article>
        <article className="rounded-lg border border-[#e4e9e4] bg-white p-5">
          <div className="mb-4 flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-md bg-[#e7f3eb] text-[#287b4f]"><History size={16} /></span><h3 className="display-font text-sm font-bold">History</h3></div>
          <EmptySection>No activity has been recorded yet.</EmptySection>
        </article>
      </section>
    </div>
  );
}
