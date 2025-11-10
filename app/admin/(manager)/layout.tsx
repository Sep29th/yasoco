import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phòng khám Yasoco | Quản lý",
  description:
    "Phòng khám Yasoco - Nơi chăm sóc sức khỏe toàn diện cho trẻ em.",
};

export default function ManagerLayout({
  children,
}: {
  children: Readonly<{ children: React.ReactNode }>;
}) {
  return <>{children}</>;
}
