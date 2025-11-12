import { requireAuth } from "@/lib/auth";

export default async function Dashboard() {
  const auth = await requireAuth();
  return <p>{auth.permissions.join(",")}</p>;
}
