"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { Icons } from "../icons";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex flex-1 items-center gap-2">
        <Icons.logo className="h-6 w-6 shrink-0 text-primary md:hidden" />
        <h1 className="text-lg font-semibold md:hidden">TenderAI</h1>
      </div>
      <UserNav />
    </header>
  );
}
