"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { DeliverableCategory } from "@/data/deliverable-types";

export const taskStatuses = ["Not Started", "In Progress", "On Hold", "Completed"] as const;
export type TaskStatus = (typeof taskStatuses)[number];
export type WorkflowState = "Active" | "Draft" | "Archived";
export type CycleState = "Active" | "Archived";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export const linkTypes = ["SharePoint Folder", "SOP", "Current Workbook", "Previous Deliverable", "Tableau Workbook", "Tableau Flow", "Training Material", "External Source"] as const;
export type FileLinkType = (typeof linkTypes)[number];

export type FileLink = { id: string; displayName: string; type: FileLinkType; url: string; description: string; relatedRecord: string };
export type Check = { id: string; description: string; required: boolean; completed: boolean; completedBy: string; completionDate: string; notes: string };
export type WorkflowTask = { id: string; name: string; province?: string; market?: string; owner: string; reviewer: string; startDate: string; dueDate: string; priority: Priority; status: TaskStatus; completedAt?: string; dependencies: string[]; blockedReason: string; notes: string; checks: Check[]; links: FileLink[] };
export type Phase = { id: string; name: string; owner: string; startDate: string; dueDate: string; status: TaskStatus; notes: string; tasks: WorkflowTask[]; links: FileLink[] };
export type Cycle = { id: string; name: string; startDate: string; dueDate: string; state: CycleState; phases: Phase[]; links: FileLink[] };
export type WorkflowDeliverable = { id: string; name: string; category: DeliverableCategory; description: string; frequency: string; owner: string; backupOwner: string; status: TaskStatus; priority: Priority; nextDueDate: string | null; reportingSchedule: string; notes: string; state: WorkflowState; cycles: Cycle[]; links: FileLink[]; activity: string[] };

export function createDefaultTask(id: string, name = "Initial Task"): WorkflowTask {
  return { id, name, owner: "Unassigned", reviewer: "Unassigned", startDate: "", dueDate: "", priority: "Medium", status: "Not Started", dependencies: [], blockedReason: "", notes: "", checks: [], links: [] };
}

export function createDefaultPhase(id: string, name = "Initial Phase"): Phase {
  return { id, name, owner: "Unassigned", startDate: "", dueDate: "", status: "Not Started", notes: "", links: [], tasks: [createDefaultTask(`${id}-task-1`)] };
}

export function createDefaultCycle(deliverableId: string, name = "Initial Cycle"): Cycle {
  const cycleId = `${deliverableId}-cycle-1`;
  return { id: cycleId, name, startDate: "", dueDate: "", state: "Active", links: [], phases: [createDefaultPhase(`${cycleId}-phase-1`)] };
}

function normalizeStoredItems(value: unknown): WorkflowDeliverable[] | null {
  if (!Array.isArray(value)) return null;
  return value.map((stored) => {
    const item = stored as WorkflowDeliverable;
    return {
      ...item,
      status: normalizeStatus(item.status),
      notes: item.notes ?? "",
      links: normalizeLinks(item.links),
      cycles: normalizeCycles(item.cycles, item.id),
    };
  });
}

function normalizeStatus(value: unknown): TaskStatus {
  const status = String(value ?? "").toLowerCase();
  if (status === "in progress") return "In Progress";
  if (status === "completed") return "Completed";
  if (["on hold", "needs scheduling", "blocked", "ready for review"].includes(status)) return "On Hold";
  return "Not Started";
}

function normalizeLinks(value: FileLink[] | undefined): FileLink[] {
  const legacyTypes: Record<string, FileLinkType> = {
    "Previous Cycle": "Previous Deliverable",
    "Training Video": "Training Material",
    "Source Data": "External Source",
    "Final Report": "External Source",
  };
  return (value ?? []).map((link) => ({
    ...link,
    type: linkTypes.includes(link.type) ? link.type : legacyTypes[link.type] ?? "External Source",
  }));
}

export function ensureCycleHierarchy(cycles: Cycle[], deliverableId: string): Cycle[] {
  const normalized = (cycles.length ? cycles : [createDefaultCycle(deliverableId)]).map((cycle) => {
    const phases = cycle.phases.length ? cycle.phases : [createDefaultPhase(`${cycle.id}-phase-1`)];
    return { ...cycle, phases: phases.map((phase) => ({ ...phase, tasks: phase.tasks.length ? phase.tasks : [createDefaultTask(`${phase.id}-task-1`)] })) };
  });
  if (!normalized.some((cycle) => cycle.state === "Active")) normalized[normalized.length - 1].state = "Active";
  return normalized;
}

function normalizeCycles(value: Cycle[] | undefined, deliverableId: string): Cycle[] {
  if (!value?.length) return [createDefaultCycle(deliverableId)];
  const cycles = value.map((storedCycle, cycleIndex) => {
    const legacyCycle = storedCycle as Cycle & { status?: string };
    const cycleId = storedCycle.id || `${deliverableId}-cycle-${cycleIndex + 1}`;
    const phases = (storedCycle.phases ?? []).map((storedPhase, phaseIndex) => {
      const phaseId = storedPhase.id || `${cycleId}-phase-${phaseIndex + 1}`;
      const tasks = (storedPhase.tasks ?? []).map((task) => ({
        ...task,
        status: normalizeStatus(task.status),
        checks: (task.checks ?? []).map((entry) => ({ ...entry, required: entry.required ?? false, completedBy: entry.completedBy ?? "", completionDate: entry.completionDate ?? "", notes: entry.notes ?? "" })),
        links: normalizeLinks(task.links),
      }));
      return { ...storedPhase, id: phaseId, status: normalizeStatus(storedPhase.status), tasks: tasks.length ? tasks : [createDefaultTask(`${phaseId}-task-1`)], links: normalizeLinks(storedPhase.links) };
    });
    return {
      ...storedCycle,
      id: cycleId,
      state: storedCycle.state ?? (legacyCycle.status === "Archived" ? "Archived" : "Active"),
      phases: phases.length ? phases : [createDefaultPhase(`${cycleId}-phase-1`)],
      links: normalizeLinks(storedCycle.links),
    };
  });
  return ensureCycleHierarchy(cycles, deliverableId);
}

type Store = {
  items: WorkflowDeliverable[];
  hydrated: boolean;
  canEdit: boolean;
  error: string | null;
  createItem: (item: WorkflowDeliverable) => Promise<void>;
  saveItemNow: (item: WorkflowDeliverable) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
};
const WorkflowContext = createContext<Store | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WorkflowDeliverable[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveQueue = useRef(Promise.resolve());

  const persistItem = (item: WorkflowDeliverable) => {
    const request = saveQueue.current.then(async () => {
      const response = await fetch(`/api/deliverables/${encodeURIComponent(item.id)}/`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save deliverable.");
    });
    saveQueue.current = request.catch(() => undefined);
    return request;
  };

  useEffect(() => {
    let active = true;
    fetch("/api/deliverables/", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { items?: unknown; canEdit?: boolean; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Unable to load deliverables.");
        if (!active) return;
        const normalized = normalizeStoredItems(result.items);
        if (!normalized) throw new Error("The server returned invalid deliverable data.");
        setItems(normalized);
        setCanEdit(result.canEdit === true);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load deliverables.");
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const createItem = async (item: WorkflowDeliverable) => {
    if (!canEdit) throw new Error("Your account is not authorized to edit this workspace.");
    const request = saveQueue.current.then(async () => {
      const response = await fetch("/api/deliverables/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to add deliverable.");
    });
    saveQueue.current = request.catch(() => undefined);
    await request;
    setItems((current) => [item, ...current]);
    setError(null);
  };

  const saveItemNow = async (item: WorkflowDeliverable) => {
    if (!canEdit) throw new Error("Your account is not authorized to edit this workspace.");
    await persistItem(item);
    setItems((current) => current.map((entry) => entry.id === item.id ? item : entry));
    setError(null);
  };

  const deleteItem = async (id: string) => {
    if (!canEdit) throw new Error("Your account is not authorized to edit this workspace.");
    const request = saveQueue.current.then(async () => {
      const response = await fetch(`/api/deliverables/${encodeURIComponent(id)}/`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to delete deliverable.");
    });
    saveQueue.current = request.catch(() => undefined);
    await request;
    setItems((current) => current.filter((item) => item.id !== id));
    setError(null);
  };

  return <WorkflowContext.Provider value={{ items, hydrated, canEdit, error, createItem, saveItemNow, deleteItem }}>{error && <div role="alert" className="fixed bottom-4 right-4 z-50 max-w-lg rounded-md border border-[#e7c8be] bg-white px-4 py-3 text-sm text-[#9a4934] shadow-lg">{error}</div>}{children}</WorkflowContext.Provider>;
}

export function useWorkflows() {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error("useWorkflows must be used inside WorkflowProvider");
  return context;
}

export function applicableTasks(phases: Phase[]) {
  return phases.flatMap((phase) => phase.tasks);
}
export function progressForPhases(phases: Phase[]) {
  const tasks = applicableTasks(phases);
  return tasks.length ? Math.round((tasks.filter((task) => task.status === "Completed").length / tasks.length) * 100) : 0;
}
export function progressForDeliverable(item: WorkflowDeliverable) {
  const cycle = item.cycles.find((candidate) => candidate.state === "Active") ?? item.cycles[0];
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
