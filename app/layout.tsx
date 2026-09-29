import type { Metadata } from "next";
import { OperationsShell } from "@/components/operations-shell";
import { WorkflowProvider } from "@/data/workflows";
import "./globals.css";

export const metadata: Metadata = {
  title: "MI Operations Hub",
  description: "A clear view of marketing intelligence operations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WorkflowProvider><OperationsShell>{children}</OperationsShell></WorkflowProvider>
      </body>
    </html>
  );
}
