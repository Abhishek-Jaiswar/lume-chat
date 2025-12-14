import React from "react";

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      // Toolbar
      <main className=" ">{children}</main>
    </div>
  );
};

export default AppWrapper;
