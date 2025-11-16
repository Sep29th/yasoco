"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import { MenuItem } from "../_types/menu-item";
import Header from "./header";
import { User } from "@/lib/generated/prisma";

type PropsType = {
  children: React.ReactNode;
  menuData: MenuItem[];
  currentUser: User;
};

export default function LayoutClient({
  children,
  menuData,
  currentUser,
}: PropsType) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} menuData={menuData} setSidebarOpen={setSidebarOpen} />
      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentUser={currentUser}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </>
  );
}
