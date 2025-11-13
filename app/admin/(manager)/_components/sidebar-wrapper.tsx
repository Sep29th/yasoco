"use server";

import { requireAuth } from "@/lib/auth";
import Sidebar from "./sidebar";
import { MenuItem } from "../_types/menu-item";

type PropsType = {
  sidebarOpen: boolean;
};

export default async function SidebarWrapper({ sidebarOpen }: PropsType) {
  const auth = await requireAuth();

  const menuItems: MenuItem[] = [];

  return <Sidebar sidebarOpen={sidebarOpen} menuData={menuItems} />;
}
