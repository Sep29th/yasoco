import { getCurrentUser, requireAuth } from "@/lib/auth";
import { Metadata } from "next";
import LayoutClient from "./_components/layout-client";
import { MenuItem } from "./_types/menu-item";
import {
  CalendarClock,
  CalendarPlus2,
  LayoutDashboard,
  Newspaper,
  ShieldUser,
  Tag,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Phòng khám Yasoco | Quản lý",
  description:
    "Phòng khám Yasoco - Nơi chăm sóc sức khỏe toàn diện cho trẻ em.",
};

export default async function ManagerLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  const auth = await requireAuth();
  const currentUser = await getCurrentUser();

  const menuData: MenuItem[] = [
    {
      icon: <LayoutDashboard className="group-hover:text-[#A6CF52]" />,
      label: "Tổng quan",
      path: "/admin",
    },
  ];

  // const permissionsSet = new Set(auth.permissions);
  const topicSet = new Set(
    auth.permissions.map((permisson) => permisson.split(":")[0])
  );

  if (topicSet.has("role")) {
    menuData.push({
      icon: <ShieldUser className="group-hover:text-[#A6CF52]" />,
      label: "Vai trò",
      path: "/admin/roles",
    });
  }

  if (topicSet.has("user")) {
    menuData.push({
      icon: <Users className="group-hover:text-[#A6CF52]" />,
      label: "Người dùng",
      path: "/admin/users",
    });
  }

  if (topicSet.has("examination")) {
    menuData.push({
      icon: <CalendarPlus2 className="group-hover:text-[#A6CF52]" />,
      label: "Lịch khám",
      path: "/admin/examinations",
    });
  }

  if (topicSet.has("examination-session")) {
    menuData.push({
      icon: <CalendarClock className="group-hover:text-[#A6CF52]" />,
      label: "Giờ khám",
      path: "/admin/examination-session",
    });
  }

  if (topicSet.has("tag")) {
    menuData.push({
      icon: <Tag className="group-hover:text-[#A6CF52]" />,
      label: "Chủ đề",
      path: "/admin/tag",
    });
  }

  if (topicSet.has("article")) {
    menuData.push({
      icon: <Newspaper className="group-hover:text-[#A6CF52]" />,
      label: "Bài viết",
      path: "/admin/article",
    });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <LayoutClient menuData={menuData} currentUser={currentUser}>
        {children}
        {modal}
      </LayoutClient>
    </div>
  );
}
