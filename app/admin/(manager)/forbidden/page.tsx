import Image from "next/image";

export default function Forbidden() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-8 p-8 text-center">
      <Image
        src="/403.svg"
        alt="Không được phép truy cập trang"
        width={400}
        height={300}
        className="max-w-full"
        priority
      />
      <div className="flex flex-col gap-4 items-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Bạn không có quyền truy cập trang này!
        </h1>
        <p className="max-w-md text-lg text-gray-600 dark:text-gray-300">
          Hãy liên hệ với quản trị để cấp quyền cho bạn
        </p>
      </div>
    </main>
  );
}
