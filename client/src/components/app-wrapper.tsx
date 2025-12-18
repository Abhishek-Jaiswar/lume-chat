import React from "react";
import Sidebar from "./sidebar";

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <Sidebar />
      <main className="lg:pl-10 h-full ">{children}</main>
    </div>
  );
};

export default AppWrapper;
