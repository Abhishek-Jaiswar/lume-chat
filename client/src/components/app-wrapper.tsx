import React from "react";
import Sidebar from "./sidebar";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main
        className={cn(
          "flex-1 transition-[margin] duration-300 ease-in-out bg-background min-w-0",
          isOpen ? "ml-88" : "ml-14",
          "max-w-[84%] lg:max-w-full"
        )}
      >
        {children}
      </main>
    </div>
  );
};

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <Layout>{children}</Layout>
    </SidebarProvider>
  );
};

export default AppWrapper;
