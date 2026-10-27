import type { Metadata } from "next";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { OperationsShell } from "@/components/operations-shell";
import { AccessError, authenticateAccessRequest } from "@/lib/server/access";
import { WorkflowProvider } from "@/data/workflows";
import "./globals.css";

export const metadata: Metadata = {
  title: "MI Operations Hub",
  description: "A clear view of marketing intelligence operations.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  try {
    await authenticateAccessRequest(await headers());
  } catch (error) {
    if (error instanceof AccessError && error.status === 401) unauthorized();
    throw error;
  }

  return (
    <html lang="en">
      <body>
        <WorkflowProvider><OperationsShell>{children}</OperationsShell></WorkflowProvider>
      </body>
    </html>
  );
}
