import "server-only";
import { deliverables as baseDeliverables } from "@/data/deliverables";
import type { WorkflowDeliverable, WorkflowTask } from "@/data/workflows";

const blankTask = (id: string, name: string, province: string, dueDate: string): WorkflowTask => ({
  id,
  name,
  province,
  owner: "Unassigned",
  reviewer: "Unassigned",
  startDate: "2026-10-01",
  dueDate,
  priority: "Medium",
  status: "Not Started",
  dependencies: [],
  blockedReason: "",
  notes: "",
  checks: [],
  links: [],
});

const makeCycle = (deliverableId: string) => {
  const cycleId = `${deliverableId}-cycle-1`;
  const phaseId = `${cycleId}-phase-1`;
  const task: WorkflowTask = {
    id: `${phaseId}-task-1`,
    name: "Initial Task",
    owner: "Unassigned",
    reviewer: "Unassigned",
    startDate: "",
    dueDate: "",
    priority: "Medium",
    status: "Not Started",
    dependencies: [],
    blockedReason: "",
    notes: "",
    checks: [],
    links: [],
  };
  return {
    id: cycleId,
    name: "Initial Cycle",
    startDate: "",
    dueDate: "",
    state: "Active" as const,
    links: [],
    phases: [{
      id: phaseId,
      name: "Initial Phase",
      owner: "Unassigned",
      startDate: "",
      dueDate: "",
      status: "Not Started" as const,
      notes: "",
      links: [],
      tasks: [task],
    }],
  };
};

const hht = {
  id: "hen-housing-transition",
  name: "Hen Housing Transition",
  category: "External Reports",
  description: "Coordinate data collection, validation, and reporting for the Hen Housing Transition process.",
  frequency: "Twice a year",
  owner: "Market Intelligence",
  backupOwner: "Unassigned",
  status: "In Progress",
  priority: "High",
  nextDueDate: "2026-11-30",
  reportingSchedule: "November 2026 reporting cycle",
  notes: "",
  state: "Active",
  links: [],
  activity: ["HHT November 2026 cycle created"],
  cycles: [{
    id: "hht-november-2026",
    name: "HHT November 2026",
    startDate: "2026-10-01",
    dueDate: "2026-11-30",
    state: "Active",
    links: [],
    phases: [
      {
        id: "hht-data-collection",
        name: "Data Collection",
        owner: "Market Intelligence",
        startDate: "2026-10-01",
        dueDate: "2026-10-30",
        status: "In Progress",
        notes: "Collect current market and provincial data.",
        links: [],
        tasks: [
          { ...blankTask("hht-task-bc", "Collect province data", "British Columbia", "2026-10-02"), owner: "Taylor Chen", status: "In Progress" },
          { ...blankTask("hht-task-ab", "Collect province data", "Alberta", "2026-09-25"), owner: "Jordan Lee", status: "On Hold", blockedReason: "Awaiting the provincial producer submission." },
          blankTask("hht-task-sk", "Collect province data", "Saskatchewan", "2026-10-16"),
          blankTask("hht-task-mb", "Collect province data", "Manitoba", "2026-10-16"),
          blankTask("hht-task-on", "Collect province data", "Ontario", "2026-10-20"),
          blankTask("hht-task-qc", "Collect province data", "Quebec", "2026-10-20"),
          blankTask("hht-task-atlantic", "Collect province data", "Atlantic", "2026-10-23"),
        ],
      },
      {
        id: "hht-validation",
        name: "Validation and Reconciliation",
        owner: "Market Intelligence",
        startDate: "2026-10-26",
        dueDate: "2026-11-06",
        status: "Not Started",
        notes: "Reconcile submissions and confirm required validation checks.",
        links: [],
        tasks: [
          {
            ...blankTask("hht-reconcile", "Reconcile provincial submissions", "", "2026-11-03"),
            checks: ["coverage", "outliers", "totals"].map((key, index) => ({
              id: `hht-check-${key}`,
              description: ["All expected provinces submitted", "Outliers reviewed and documented", "National totals reconcile to source data"][index],
              required: true,
              completed: false,
              completedBy: "",
              completionDate: "",
              notes: "",
            })),
          },
          {
            ...blankTask("hht-validate", "Validate final dataset", "", "2026-11-06"),
            checks: ["period", "review"].map((key, index) => ({
              id: `hht-check-${key}`,
              description: ["Reporting period confirmed", "Independent review completed"][index],
              required: true,
              completed: false,
              completedBy: "",
              completionDate: "",
              notes: "",
            })),
          },
        ],
      },
      {
        id: "hht-reporting",
        name: "Report Production",
        owner: "Market Intelligence",
        startDate: "2026-11-09",
        dueDate: "2026-11-30",
        status: "Not Started",
        notes: "Produce final report and update dashboards.",
        links: [],
        tasks: [
          {
            ...blankTask("hht-report-draft", "Prepare report draft", "", "2026-11-20"),
            dependencies: ["hht-validate"],
            checks: ["charts", "approval"].map((key, index) => ({
              id: `hht-check-${key}`,
              description: ["Tables and charts reviewed", "Report approved for distribution"][index],
              required: true,
              completed: false,
              completedBy: "",
              completionDate: "",
              notes: "",
            })),
          },
          blankTask("hht-dashboard-update", "Update dashboard", "", "2026-11-27"),
        ],
      },
    ],
  }],
} satisfies WorkflowDeliverable;

export function createWorkflowSeed(): WorkflowDeliverable[] {
  const rows = baseDeliverables.map((item) => ({
    ...item,
    backupOwner: "Unassigned",
    priority: "Medium" as const,
    reportingSchedule: item.frequency,
    notes: "",
    state: "Active" as const,
    cycles: [makeCycle(item.id)],
    links: [],
    activity: [],
  }));
  return [hht, ...rows.filter((item) => item.id !== "hen-housing-transition")];
}
