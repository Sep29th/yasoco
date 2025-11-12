import { requireAuth } from "@/lib/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phòng khám Yasoco | Quản lý",
  description:
    "Phòng khám Yasoco - Nơi chăm sóc sức khỏe toàn diện cho trẻ em.",
};

export default async function ManagerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const auth = await requireAuth();

  return (
    <>
      <h1>{auth.userId}</h1>
      <>{children}</>
    </>
  );
}
