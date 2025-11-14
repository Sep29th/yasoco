import { getPublishedArticleCount } from "@/lib/article";

export default async function Article() {
  const countPublishedArticle = await getPublishedArticleCount();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-1">Bài viết đã đăng</p>
      <p className="text-3xl font-bold" style={{ color: "#3B82F6" }}>
        {countPublishedArticle}
      </p>
    </div>
  );
}
