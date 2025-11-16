"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItem } from "../_types/menu-item";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type PropsType = {
  item: MenuItem;
  sidebarOpen: boolean;
  expanded?: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  setSidebarOpen: (open: boolean) => void;
};

export default function SidebarMenuItem({
  item,
  sidebarOpen,
  expanded,
  onToggle,
  icon,
  setSidebarOpen,
}: PropsType) {
  const hasSubmenu = !!item.submenu?.length;

  const route = useRouter();

  const handleClick = () => {
    if (hasSubmenu) {
      if (!sidebarOpen) setSidebarOpen(true);

      onToggle();
    } else if (item.path) {
      route.push(item.path);
      // close drawer on small screens after navigation
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  const button = (
    <button
      onClick={handleClick}
      className={`w-full flex items-center ${
        sidebarOpen ? "justify-between" : "justify-center"
      } px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group cursor-pointer`}
      aria-label={!sidebarOpen ? item.label : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        {sidebarOpen && (
          <span className="font-medium group-hover:text-[#A6CF52] whitespace-nowrap truncate">
            {item.label}
          </span>
        )}
      </div>

      {sidebarOpen &&
        hasSubmenu &&
        (expanded ? (
          <ChevronDown className="w-4 h-4 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" />
        ))}
    </button>
  );

  return (
    <div className="select-none">
      {!sidebarOpen ? (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right">
            <span>{item.label}</span>
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          expanded && sidebarOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } bg-gray-50`}
      >
        {sidebarOpen &&
          item.submenu?.map((subitem, subIndex) => (
            <button
              onClick={() => {
                route.push(subitem.path);
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              key={subIndex}
              className="w-full flex items-center px-4 py-2 pl-14 text-sm text-gray-600 hover:text-[#A6CF52] hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap truncate"
            >
              {subitem.label}
            </button>
          ))}
      </div>
    </div>
  );
}
