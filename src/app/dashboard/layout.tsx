import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarContent } from '@/components/dashboard/sidebar-content';
import { DashboardHeader } from '@/components/dashboard/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
