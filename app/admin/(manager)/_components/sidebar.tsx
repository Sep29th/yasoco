"use client";

import { useState } from "react";
import { MenuItem } from "../_types/menu-item";
import SidebarMenuItem from "./sidebar-menu-item";
import Logo from "./logo";

type PropsType = {
  sidebarOpen: boolean;
  menuData: MenuItem[];
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({ sidebarOpen, menuData, setSidebarOpen }: PropsType) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleToggle = (label: string) => {
    setExpanded((prev) => (prev === label ? null : label));
  };

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-[width,transform] absolute sm:block duration-300 shrink-0 h-full md:static z-50 transform ${
        // On mobile we use transform-based drawer overlay; on md+ it is static and may be collapsed
        sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20 w-0"
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-center h-16 border-b">
          <Logo sidebarOpen={sidebarOpen} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="py-4">
            {menuData.map((item, idx) => (
              <SidebarMenuItem
                key={idx}
                item={item}
                sidebarOpen={sidebarOpen}
                expanded={expanded === item.label}
                onToggle={() => handleToggle(item.label)}
                icon={item.icon}
                setSidebarOpen={setSidebarOpen}
              />
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );

}
