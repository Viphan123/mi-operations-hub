"use client";

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { deliverables as baseDeliverables, type DeliverableCategory } from "@/data/deliverables";

export const taskStatuses = ["Not Started", "In Progress", "Ready for Review", "Blocked", "Completed", "Not Applicable"] as const;
export type TaskStatus = (typeof taskStatuses)[number];
export type WorkflowState = "Active" | "Draft" | "Archived";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export const linkTypes = ["SharePoint Folder", "Current Workbook", "Source Data", "Previous Cycle", "Final Report", "SOP", "Training Video", "Tableau Workbook", "Tableau Flow", "External Source"] as const;
export type FileLinkType = (typeof linkTypes)[number];

export type FileLink = { id: string; displayName: string; type: FileLinkType; url: string; description: string; relatedRecord: string };
export type Check = { id: string; description: string; required: boolean; completed: boolean; completedBy: string; completionDate: string; notes: string };
export type WorkflowTask = { id: string; name: string; province?: string; market?: string; owner: string; reviewer: string; startDate: string; dueDate: string; priority: Priority; status: TaskStatus; completedAt?: string; dependencies: string[]; blockedReason: string; notes: string; checks: Check[]; links: FileLink[] };
export type Phase = { id: string; name: string; owner: string; startDate: string; dueDate: string; status: TaskStatus; notes: string; tasks: WorkflowTask[]; links: FileLink[] };
export type Cycle = { id: string; name: string; startDate: string; dueDate: string; status: WorkflowState; phases: Phase[]; links: FileLink[] };
export type WorkflowDeliverable = { id: string; name: string; category: DeliverableCategory; description: string; frequency: string; owner: string; backupOwner: string; status: string; priority: Priority; nextDueDate: string | null; reportingSchedule: string; state: WorkflowState; cycles: Cycle[]; links: FileLink[]; activity: string[] };

const blankTask = (id: string, name: string, province: string, dueDate: string): WorkflowTask => ({ id, name, province, owner: "Unassigned", reviewer: "Unassigned", startDate: "2026-10-01", dueDate, priority: "Medium", status: "Not Started", dependencies: [], blockedReason: "", notes: "", checks: [], links: [] });
const check = (id: string, description: string): Check => ({ id, description, required: true, completed: false, completedBy: "", completionDate: "", notes: "" });

const hht: WorkflowDeliverable = {
  id: "hen-housing-transition", name: "Hen Housing Transition", category: "External Reports", description: "Coordinate data collection, validation, and reporting for the Hen Housing Transition process.", frequency: "Twice a year", owner: "Market Intelligence", backupOwner: "Unassigned", status: "In progress", priority: "High", nextDueDate: "2026-11-30", reportingSchedule: "November 2026 reporting cycle", state: "Active", links: [], activity: ["HHT November 2026 cycle created"],
  cycles: [{ id: "hht-november-2026", name: "HHT November 2026", startDate: "2026-10-01", dueDate: "2026-11-30", status: "Active", links: [], phases: [
    { id: "hht-data-collection", name: "Data Collection", owner: "Market Intelligence", startDate: "2026-10-01", dueDate: "2026-10-30", status: "In Progress", notes: "Collect current market and provincial data.", links: [], tasks: [
      { ...blankTask("hht-task-bc", "Collect province data", "British Columbia", "2026-10-02"), owner: "Taylor Chen", status: "In Progress" }, { ...blankTask("hht-task-ab", "Collect province data", "Alberta", "2026-09-25"), owner: "Jordan Lee", status: "Blocked", blockedReason: "Awaiting the provincial producer submission." }, blankTask("hht-task-sk", "Collect province data", "Saskatchewan", "2026-10-16"), blankTask("hht-task-mb", "Collect province data", "Manitoba", "2026-10-16"), blankTask("hht-task-on", "Collect province data", "Ontario", "2026-10-20"), blankTask("hht-task-qc", "Collect province data", "Quebec", "2026-10-20"), blankTask("hht-task-atlantic", "Collect province data", "Atlantic", "2026-10-23"),
    ] },
    { id: "hht-validation", name: "Validation and Reconciliation", owner: "Market Intelligence", startDate: "2026-10-26", dueDate: "2026-11-06", status: "Not Started", notes: "Reconcile submissions and confirm required validation checks.", links: [], tasks: [
      { ...blankTask("hht-reconcile", "Reconcile provincial submissions", "", "2026-11-03"), checks: [check("hht-check-coverage", "All expected provinces submitted"), check("hht-check-outliers", "Outliers reviewed and documented"), check("hht-check-totals", "National totals reconcile to source data")] },
      { ...blankTask("hht-validate", "Validate final dataset", "", "2026-11-06"), checks: [check("hht-check-period", "Reporting period confirmed"), check("hht-check-review", "Independent review completed")] },
    ] },
    { id: "hht-reporting", name: "Report Production", owner: "Market Intelligence", startDate: "2026-11-09", dueDate: "2026-11-30", status: "Not Started", notes: "Produce final report and update dashboards.", links: [], tasks: [
      { ...blankTask("hht-report-draft", "Prepare report draft", "", "2026-11-20"), dependencies: ["hht-validate"], checks: [check("hht-check-charts", "Tables and charts reviewed"), check("hht-check-approval", "Report approved for distribution")] },
      blankTask("hht-dashboard-update", "Update dashboard", "", "2026-11-27"),
    ] },
  ] }],
};

function makeSeed(): WorkflowDeliverable[] {
  const rows = baseDeliverables.map((item) => ({ ...item, backupOwner: "Unassigned", priority: "Medium" as Priority, reportingSchedule: item.frequency, state: "Active" as WorkflowState, cycles: [] as Cycle[], links: [] as FileLink[], activity: [] as string[] }));
  return [hht, ...rows.filter((item) => item.id !== "hen-housing-transition")];
}

const STORAGE_KEY = "mi-operations-workflows-v1";
type Store = { items: WorkflowDeliverable[]; setItems: Dispatch<SetStateAction<WorkflowDeliverable[]>>; hydrated: boolean; reset: () => void };
const WorkflowContext = createContext<Store | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WorkflowDeliverable[]>(makeSeed);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as WorkflowDeliverable[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);
  const value = useMemo(() => ({ items, setItems, hydrated, reset: () => setItems(makeSeed()) }), [items, hydrated]);
  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflows() {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error("useWorkflows must be used inside WorkflowProvider");
  return context;
}

export function applicableTasks(phases: Phase[]) {
  return phases.flatMap((phase) => phase.tasks).filter((task) => task.status !== "Not Applicable");
}
export function progressForPhases(phases: Phase[]) {
  const tasks = applicableTasks(phases);
  return tasks.length ? Math.round((tasks.filter((task) => task.status === "Completed").length / tasks.length) * 100) : 0;
}
export function progressForDeliverable(item: WorkflowDeliverable) {
  const cycle = item.cycles.find((candidate) => candidate.status === "Active") ?? item.cycles[0];
  return cycle ? progressForPhases(cycle.phases) : 0;
}
export function updateItem(items: WorkflowDeliverable[], id: string, update: (item: WorkflowDeliverable) => WorkflowDeliverable) {
  return items.map((item) => item.id === id ? update(item) : item);
}
export function reorder<T>(items: T[], from: number, to: number) {
  const result = [...items];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}
