import { requireAuth } from "@/lib/auth";
import { Metadata } from "next";
import LayoutClient from "./_components/layout-client";

export const metadata: Metadata = {
  title: "Phòng khám Yasoco | Quản lý",
  description:
    "Phòng khám Yasoco - Nơi chăm sóc sức khỏe toàn diện cho trẻ em.",
};

export default async function ManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAuth();

  // return <>{children}</>;
  return <LayoutClient>{children}</LayoutClient>;
}
