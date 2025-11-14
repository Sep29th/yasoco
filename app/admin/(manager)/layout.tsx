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
}: Readonly<{ children: React.ReactNode }>) {
  const auth = await requireAuth();
  const currentUser = await getCurrentUser();

  const menuData: MenuItem[] = [
    { icon: <LayoutDashboard />, label: "Tổng quan", path: "/admin" },
  ];

  const permissionsSet = new Set(auth.permissions);
  const topicSet = new Set(
    auth.permissions.map((permisson) => permisson.split(":")[0])
  );

  if (topicSet.has("role")) {
    const submenu: MenuItem["submenu"] = [];

    if (permissionsSet.has("role:read"))
      submenu.push({ label: "Danh sách", path: "/admin/roles" });

    if (permissionsSet.has("role:create"))
      submenu.push({ label: "Tạo mới", path: "/admin/roles/create" });

    menuData.push({
      icon: <ShieldUser />,
      label: "Vai trò",
      submenu,
    });
  }

  if (topicSet.has("user")) {
    const submenu: MenuItem["submenu"] = [];

    if (permissionsSet.has("user:read"))
      submenu.push({ label: "Danh sách", path: "/admin/users" });

    if (permissionsSet.has("user:create"))
      submenu.push({ label: "Tạo mới", path: "/admin/users/create" });

    menuData.push({
      icon: <Users />,
      label: "Người dùng",
      submenu,
    });
  }

  if (topicSet.has("examination")) {
    const submenu: MenuItem["submenu"] = [];

    if (permissionsSet.has("examination:read"))
      submenu.push({ label: "Danh sách", path: "/admin/examinations" });

    if (permissionsSet.has("examination:create"))
      submenu.push({ label: "Tạo mới", path: "/admin/examinations/create" });

    menuData.push({
      icon: <CalendarPlus2 />,
      label: "Lịch khám",
      submenu,
    });
  }

  if (topicSet.has("examination-session")) {
    const submenu: MenuItem["submenu"] = [];

    if (permissionsSet.has("examination-session:read"))
      submenu.push({ label: "Danh sách", path: "/admin/examination-session" });

    if (permissionsSet.has("examination-session:create"))
      submenu.push({
        label: "Tạo mới",
        path: "/admin/examination-session/create",
      });

    menuData.push({
      icon: <CalendarClock />,
      label: "Giờ khám",
      submenu,
    });
  }

  if (topicSet.has("tag")) {
    const submenu: MenuItem["submenu"] = [];

    if (permissionsSet.has("tag:read"))
      submenu.push({ label: "Danh sách", path: "/admin/tag" });

    if (permissionsSet.has("tag:create"))
      submenu.push({
        label: "Tạo mới",
        path: "/admin/tag/create",
      });

    menuData.push({
      icon: <Tag />,
      label: "Chủ đề",
      submenu,
    });
  }

  if (topicSet.has("article")) {
    const submenu: MenuItem["submenu"] = [];

    if (permissionsSet.has("article:read"))
      submenu.push({ label: "Danh sách", path: "/admin/article" });

    if (permissionsSet.has("article:create"))
      submenu.push({
        label: "Tạo mới",
        path: "/admin/article/create",
      });

    menuData.push({
      icon: <Newspaper />,
      label: "Bài viết",
      submenu,
    });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <LayoutClient menuData={menuData} currentUser={currentUser}>
        {children}
      </LayoutClient>
    </div>
  );
}
