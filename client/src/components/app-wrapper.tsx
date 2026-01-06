import React from "react";
import Sidebar from "./sidebar";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default AppWrapper;
