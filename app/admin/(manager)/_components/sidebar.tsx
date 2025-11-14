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
  const [expandedMenus, setExpandedMenus] = useState<Record<number, boolean>>(
    {}
  );

  const toggleSubmenu = (index: number) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-0 md:w-20"
      } bg-white border-r border-gray-200 transition-[width] duration-300 flex-col overflow-hidden ${
        sidebarOpen ? "flex" : "hidden md:flex"
      }`}
    >
      <Logo sidebarOpen={sidebarOpen} />

      <nav className="flex-1 overflow-y-auto py-4">
        {menuData.map((item, index) => (
          <SidebarMenuItem
            key={index}
            item={item}
            icon={item.icon}
            sidebarOpen={sidebarOpen}
            expanded={expandedMenus[index]}
            onToggle={() => toggleSubmenu(index)}
            setSidebarOpen={setSidebarOpen}
          />
        ))}
      </nav>
    </aside>
  );
}
