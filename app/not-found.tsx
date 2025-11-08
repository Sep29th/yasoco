import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      {/* THAY THẾ CHỖ NÀY BẰNG ẢNH CỦA BẠN 
        Bạn có thể dùng component <Image> của Next.js
        hoặc một thẻ <img> đơn giản.
      */}
      <Image
        // src="/link-den-anh-illustration-cua-ban.svg" // <-- Thay đổi link này
        src="/404.svg" // <-- Link ảnh mèo 404 placeholder
        alt="Trang không tìm thấy"
        width={400}
        height={300}
        className="max-w-full"
        priority // Ưu tiên tải ảnh này
      />

      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Ôi, có vẻ bạn đã đi lạc!
        </h1>
        <p className="max-w-md text-lg text-gray-600 dark:text-gray-300">
          Chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Nhưng đừng lo,
          bạn có thể quay về trang chủ.
        </p>
      </div>

      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Quay về Trang chủ
      </Link>
    </main>
  );
}
