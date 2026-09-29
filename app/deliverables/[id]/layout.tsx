import { deliverables } from "@/data/deliverables";

export function generateStaticParams() {
  return ["hen-housing-transition", ...deliverables.map((deliverable) => deliverable.id)].map((id) => ({ id }));
}

export const dynamicParams = false;

export default function DeliverableLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
