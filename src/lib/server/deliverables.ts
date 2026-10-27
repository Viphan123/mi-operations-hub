import "server-only";
import { createWorkflowSeed } from "@/data/workflow-seed";
import type { WorkflowDeliverable } from "@/data/workflows";

const MAX_PAYLOAD_SIZE = 1_000_000;
const statuses = ["Not Started", "In Progress", "On Hold", "Completed"];
const priorities = ["Low", "Medium", "High", "Urgent"];
const workflowStates = ["Active", "Draft", "Archived"];
const categories = ["External Data Uploads", "External Reports", "Internal Reports", "Tableau Dashboards", "Tableau Flows", "Program Administration", "Data Requests"];
const linkTypes = ["SharePoint Folder", "SOP", "Current Workbook", "Previous Deliverable", "Tableau Workbook", "Tableau Flow", "Training Material", "External Source"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasStringFields(value: Record<string, unknown>, fields: string[]): boolean {
  return fields.every((field) => typeof value[field] === "string");
}

function isLinkList(value: unknown): boolean {
  return Array.isArray(value) && value.length <= 500 && value.every((link) => {
    if (!isRecord(link) || !hasStringFields(link, ["id", "displayName", "type", "url", "description", "relatedRecord"])) return false;
    if (typeof link.type !== "string" || typeof link.url !== "string" || !linkTypes.includes(link.type) || link.url.length > 2_000) return false;
    try {
      return ["http:", "https:"].includes(new URL(link.url).protocol);
    } catch {
      return false;
    }
  });
}

function isCheckList(value: unknown): boolean {
  return Array.isArray(value) && value.length <= 500 && value.every((check) =>
    isRecord(check)
    && hasStringFields(check, ["id", "description", "completedBy", "completionDate", "notes"])
    && typeof check.required === "boolean"
    && typeof check.completed === "boolean");
}

function isCycleList(value: unknown): boolean {
  return Array.isArray(value) && value.length <= 100 && value.every((cycle) => {
    if (!isRecord(cycle)
      || !hasStringFields(cycle, ["id", "name", "startDate", "dueDate"])
      || !["Active", "Archived"].includes(String(cycle.state))
      || !isLinkList(cycle.links)
      || !Array.isArray(cycle.phases)
      || cycle.phases.length > 100) return false;

    return cycle.phases.every((phase) => {
      if (!isRecord(phase)
        || !hasStringFields(phase, ["id", "name", "owner", "startDate", "dueDate", "notes"])
        || !statuses.includes(String(phase.status))
        || !Array.isArray(phase.tasks)
        || phase.tasks.length > 500
        || !isLinkList(phase.links)) return false;
      return phase.tasks.every((task) =>
        isRecord(task)
        && hasStringFields(task, ["id", "name", "owner", "reviewer", "startDate", "dueDate", "blockedReason", "notes"])
        && statuses.includes(String(task.status))
        && priorities.includes(String(task.priority))
        && Array.isArray(task.dependencies)
        && task.dependencies.every((dependency) => typeof dependency === "string")
        && isCheckList(task.checks)
        && isLinkList(task.links));
    });
  });
}

export function validateDeliverable(value: unknown, expectedId?: string): WorkflowDeliverable | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string"
    || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(value.id)
    || (expectedId !== undefined && value.id !== expectedId)
    || typeof value.name !== "string"
    || value.name.trim().length === 0
    || value.name.length > 120
    || typeof value.description !== "string"
    || value.description.length > 2_000
    || typeof value.category !== "string"
    || !categories.includes(value.category)
    || !hasStringFields(value, ["frequency", "owner", "backupOwner", "reportingSchedule", "notes"])
    || typeof value.frequency !== "string"
    || typeof value.owner !== "string"
    || typeof value.backupOwner !== "string"
    || typeof value.reportingSchedule !== "string"
    || typeof value.notes !== "string"
    || value.frequency.length > 100
    || value.owner.length > 100
    || value.backupOwner.length > 100
    || value.reportingSchedule.length > 200
    || value.notes.length > 5_000
    || typeof value.status !== "string"
    || !statuses.includes(value.status)
    || typeof value.priority !== "string"
    || !priorities.includes(value.priority)
    || typeof value.state !== "string"
    || !workflowStates.includes(value.state)
    || !(value.nextDueDate === null || (typeof value.nextDueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.nextDueDate)))
    || !isCycleList(value.cycles)
    || !isLinkList(value.links)
    || !Array.isArray(value.activity)
    || value.activity.length > 100
    || !value.activity.every((entry) => typeof entry === "string")
  ) return null;

  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return null;
  }
  if (serialized.length > MAX_PAYLOAD_SIZE) return null;
  return value as WorkflowDeliverable;
}

export async function seedIfEmpty(db: D1Database, maySeed: boolean): Promise<boolean> {
  const initialized = await db.prepare("SELECT value FROM workspace_metadata WHERE key = 'seeded'").first<{ value: string }>();
  if (initialized) return true;

  const result = await db.prepare("SELECT COUNT(*) AS count FROM deliverables").first<{ count: number }>();
  if ((result?.count ?? 0) !== 0) {
    if (maySeed) await db.prepare("INSERT OR IGNORE INTO workspace_metadata (key, value) VALUES ('seeded', 'true')").run();
    return true;
  }
  if (!maySeed) return false;

  const seed = createWorkflowSeed();
  await db.batch([
    ...seed.map((item) => {
      const payload = JSON.stringify(item);
      return db.prepare("INSERT OR IGNORE INTO deliverables (id, payload) VALUES (?, ?)").bind(item.id, payload);
    }),
    db.prepare("INSERT OR IGNORE INTO workspace_metadata (key, value) VALUES ('seeded', 'true')"),
  ]);
  return true;
}

export async function listDeliverables(db: D1Database): Promise<WorkflowDeliverable[]> {
  const result = await db.prepare("SELECT payload FROM deliverables ORDER BY json_extract(payload, '$.name') COLLATE NOCASE").all<{ payload: string }>();
  return result.results.map(({ payload }) => JSON.parse(payload) as WorkflowDeliverable);
}

export function getD1Database(env: CloudflareEnv): D1Database {
  if (!env.DB) throw new Error("The D1 database binding is missing.");
  return env.DB;
}
