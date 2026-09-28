"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, BookOpen, CalendarDays, ChevronDown, CircleHelp, LayoutDashboard, Menu, Search, Settings2, Users, X, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { deliverables } from "@/data/deliverables";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Deliverables", href: "/deliverables", icon: ClipboardList, count: String(deliverables.length) },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
];

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/deliverables": "Deliverables",
  "/calendar": "Calendar",
  "/knowledge-base": "Knowledge Base",
  "/admin": "Admin",
};

export function OperationsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = titles[pathname] ?? (pathname.startsWith("/deliverables/") ? "Deliverable Details" : "Dashboard");

  return (
    <div className="min-h-screen lg:flex">
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("sidebar-scroll fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col overflow-y-auto bg-[#17231d] text-white transition-transform duration-200 lg:static lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-[72px] items-center justify-between border-b border-white/[.08] px-5">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="grid size-9 place-items-center rounded-md bg-[#9bcb78] text-[#17231d]"><Activity size={20} strokeWidth={2.4} /></span>
            <span><span className="display-font block text-[13px] font-extrabold tracking-[0]">MI OPERATIONS</span><span className="mt-0.5 block text-[10px] font-medium tracking-[0] text-[#a7b6ab]">HUB · CANADA</span></span>
          </Link>
          <button aria-label="Close navigation" className="rounded p-1 text-[#bdc9c0] hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>

        <div className="px-3 pt-6">
          <p className="px-3 pb-2 text-[10px] font-bold text-[#91a096]">WORKSPACE</p>
          <nav className="space-y-1" aria-label="Main navigation">
            {navigation.map(({ label, href, icon: Icon, count }) => {
              const active = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={cn("group relative flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition", active ? "bg-[#2c4937] text-white before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-[#a9d78a]" : "text-[#bfcbc2] hover:bg-white/[.06] hover:text-white")}>
                <Icon size={17} strokeWidth={1.8} className={active ? "text-[#a9d78a]" : "text-[#8ea095] group-hover:text-white"} /><span className="flex-1">{label}</span>{count && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-[#d5dfd8]">{count}</span>}
              </Link>;
            })}
          </nav>
        </div>

        <div className="mt-8 px-3">
          <p className="px-3 pb-2 text-[10px] font-bold text-[#91a096]">MANAGE</p>
          <Link href="/admin" onClick={() => setMobileOpen(false)} aria-current={pathname === "/admin" ? "page" : undefined} className={cn("group flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition", pathname === "/admin" ? "bg-[#2c4937] text-white" : "text-[#bfcbc2] hover:bg-white/[.06] hover:text-white")}><Settings2 size={17} className={pathname === "/admin" ? "text-[#a9d78a]" : "text-[#8ea095]"} />Admin</Link>
        </div>

        <div className="mt-auto px-3 pb-4">
          <Link href="/knowledge-base" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-xs text-[#aab7ad] hover:bg-white/[.06] hover:text-white"><CircleHelp size={16} />Help & resources</Link>
          <div className="mt-3 flex items-center gap-3 border-t border-white/[.08] px-2 pt-4">
            <span className="grid size-9 place-items-center rounded-full bg-[#d4e6d3] text-[10px] font-bold text-[#30573a]">MI</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">Market Intelligence</span><span className="mt-0.5 block truncate text-[10px] text-[#95a49a]">Operations Hub</span></span>
            <button aria-label="Account menu" className="rounded p-1 text-[#95a49a] hover:bg-white/10"><ChevronDown size={15} /></button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-0">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#e2e8e3] bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Open navigation" className="grid size-9 shrink-0 place-items-center rounded-md text-[#5b685f] hover:bg-[#f3f6f3] lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
            <h1 className="display-font truncate text-[17px] font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden h-9 w-[220px] items-center gap-2 rounded-md border border-[#e7ebe7] bg-[#fafbfa] px-3 text-xs text-[#89948c] md:flex" aria-label="Search workspace"><Search size={15} /><span className="flex-1 text-left">Search anything...</span><kbd className="rounded border border-[#e7ebe7] bg-white px-1 py-0.5 text-[10px]">⌘ K</kbd></button>
            <button className="grid size-9 place-items-center rounded-md text-[#637067] hover:bg-[#f3f6f3] md:hidden" aria-label="Search"><Search size={18} /></button>
            <button className="relative grid size-9 place-items-center rounded-md text-[#637067] hover:bg-[#f3f6f3]" aria-label="Notifications"><Bell size={18} /><span className="absolute right-[7px] top-[7px] size-1.5 rounded-full bg-[#d16b4f] ring-2 ring-white" /></button>
            <span className="hidden h-6 w-px bg-[#e7ebe7] sm:block" />
            <button className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-[#536057] hover:bg-[#f3f6f3] sm:flex"><Users size={15} />My team <ChevronDown size={14} /></button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-8 lg:px-9 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
