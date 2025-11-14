import { getUserCount } from "@/lib/user";

export default async function User() {
  const count = await getUserCount();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-1">Người dùng</p>
      <p className="text-3xl font-bold" style={{ color: "#F59E0B" }}>
        {count}
      </p>
    </div>
  );
}
