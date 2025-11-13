"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItem } from "../_types/menu-item";

type PropsType = {
  item: MenuItem;
  sidebarOpen: boolean;
  expanded?: boolean;
  onToggle: () => void;
  icon: React.ReactNode
};

export default function SidebarMenuItem({
  item,
  sidebarOpen,
  expanded,
  onToggle,
  icon
}: PropsType) {
  return (
    <div>
      <button
        onClick={() => (item.submenu ? onToggle() : null)}
        className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
        title={!sidebarOpen ? item.label : ""}
      >
        <div className="flex items-center gap-3">
          {icon}
          {sidebarOpen && (
            <span className="font-medium group-hover:text-[#A6CF52]">
              {item.label}
            </span>
          )}
        </div>
        {sidebarOpen &&
          item.submenu &&
          (expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          ))}
      </button>

      {sidebarOpen && item.submenu && expanded && (
        <div className="bg-gray-50">
          {item.submenu.map((subitem, subIndex) => (
            <button
              key={subIndex}
              className="w-full flex items-center px-4 py-2 pl-14 text-sm text-gray-600 hover:text-[#A6CF52] hover:bg-gray-100 transition-colors"
            >
              {subitem.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
