import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-8 p-8 text-center">
      <Image
        src="/404.svg"
        alt="Trang không tìm thấy"
        width={400}
        height={300}
        className="max-w-full"
        priority
      />
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Ôi, có vẻ bạn đã đi lạc!
        </h1>
        <p className="max-w-md text-lg text-gray-600 dark:text-gray-300">
          Chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
        </p>
      </div>
    </main>
  );
}
