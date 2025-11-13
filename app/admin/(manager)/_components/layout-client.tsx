"use client";

import { useState } from "react";
import SidebarWrapper from "./sidebar-wrapper";

type PropsType = {
  children: React.ReactNode;
};

export default function LayoutClient({ children }: PropsType) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarWrapper sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
