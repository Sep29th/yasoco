import { Button } from "@/components/ui/button";
import { CalendarDays, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="container mx-auto flex h-20 items-center justify-between">
        <Link href="/">
          <Image
            className="dark:invert cursor-pointer"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
        </Link>
        <div className="flex items-center flex-1 justify-end h-full gap-10">
          <div className="flex items-center gap-2">
            <Phone />
            <div className="flex flex-col">
              <span className="text-sm leading-none">Tổng đài</span>
              <span className="text-xl font-bold leading-none text-[#00A651]">
                1900558892
              </span>
            </div>
          </div>
          <Button
            size="lg"
            className="
              cursor-pointer 
              bg-[#00A651] 
              text-white 
              hover:bg-[#008f46]
            "
          >
            <CalendarDays />
            <span className="text-xl font-medium">Đặt lịch khám</span>
          </Button>
        </div>
      </header>
      <div className="h-12 bg-linear-to-r from-[#00A651] to-[#F58220]">
        <div className="container mx-auto h-full">
          <div className="flex items-center gap-x-10 h-full text-white">
            <span className="text font-medium cursor-pointer">Giới thiệu</span>
            <span className="text font-medium cursor-pointer">Chuyên khoa</span>
            <span className="text font-medium cursor-pointer">
              Dịch vụ Y tế
            </span>
            <span className="text font-medium cursor-pointer">
              Hỗ trợ khách hàng
            </span>
            <span className="text font-medium cursor-pointer">Liên hệ</span>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
