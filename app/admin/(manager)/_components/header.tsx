"use client";

import { ArrowLeftToLine, Menu } from "lucide-react";
import ProfileDropdown from "./profile-dropdown";
import { User } from "@/lib/generated/prisma";

type PropsType = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentUser: User;
};

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  currentUser,
}: PropsType) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      >
        {sidebarOpen ? (
          <ArrowLeftToLine className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      <ProfileDropdown currentUser={currentUser} />
    </header>
  );
}
