"use client";

import { useState } from "react";
import { MenuItem } from "../_types/menu-item";
import {
  BarChart,
  FileText,
  Home,
  LucideIcon,
  Settings,
  Users,
} from "lucide-react";
import SidebarMenuItem from "./sidebar-menu-item";
import Logo from "./logo";

type PropsType = {
  sidebarOpen: boolean;
  menuData: MenuItem[];
};

const iconMap: Record<string, LucideIcon> = {
  Home,
  Users,
  FileText,
  BarChart,
  Settings,
};

export default function Sidebar({ sidebarOpen, menuData }: PropsType) {
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
      } bg-white border-r border-gray-200 transition-all duration-300 flex-col ${
        sidebarOpen ? "flex" : "hidden md:flex"
      }`}
    >
      <Logo sidebarOpen={sidebarOpen} />

      <nav className="flex-1 overflow-y-auto py-4">
        {menuData.map((item, index) => {
          const IconComponent = iconMap[item.icon] || Home;
          return (
            <SidebarMenuItem
              key={index}
              item={item}
              icon={
                <IconComponent className="w-5 h-5 group-hover:text-[#A6CF52] shrink-0" />
              }
              sidebarOpen={sidebarOpen}
              expanded={expandedMenus[index]}
              onToggle={() => toggleSubmenu(index)}
            />
          );
        })}
      </nav>
    </aside>
  );
}
