export const deliverableCategories = [
  "External Data Uploads",
  "External Reports",
  "Internal Reports",
  "Tableau Dashboards",
  "Tableau Flows",
  "Program Administration",
  "Data Requests",
] as const;

export type DeliverableCategory = (typeof deliverableCategories)[number];

export type DeliverableStatus = "Not Started" | "In Progress" | "On Hold" | "Completed";

export type Deliverable = {
  id: string;
  name: string;
  category: DeliverableCategory;
  frequency: string;
  owner: string;
  status: DeliverableStatus;
  nextDueDate: string | null;
  description: string;
};
