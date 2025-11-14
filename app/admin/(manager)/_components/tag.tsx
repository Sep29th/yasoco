import { getTagCount } from "@/lib/tag";

export default async function Tag() {
  const count = await getTagCount();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-1">Chủ đề</p>
      <p className="text-3xl font-bold" style={{ color: "#EF4444" }}>
        {count}
      </p>
    </div>
  );
}
