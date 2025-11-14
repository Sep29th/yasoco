"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/lib/generated/prisma";
import { signOut } from "@/lib/auth";

type PropsType = {
  currentUser: User;
};

export default function ProfileDropdown({ currentUser }: PropsType) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleProfileClick = () => {
    router.push("/admin/profile");
  };

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: "#A6CF52" }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <span className="hidden md:block font-medium text-gray-700 group-hover:text-[#A6CF52]">
            {currentUser.name}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-[#A6CF52]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-gray-500 font-normal">
              {currentUser.phone}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleProfileClick}
        >
          <UserIcon className="w-4 h-4 mr-2" />
          Hồ sơ cá nhân
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          className={`text-red-600 cursor-pointer ${
            isPending ? "opacity-50 cursor-wait" : ""
          }`}
        >
          <LogOut className="w-4 h-4 mr-2 text-red-600" />
          {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
