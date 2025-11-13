"use client";

import Image from "next/image";

interface LogoProps {
  sidebarOpen: boolean;
}

export default function Logo({ sidebarOpen }: LogoProps) {
  return (
    <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
      {sidebarOpen ? (
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden">
            <Image
              src="/logo.png"
              alt="Yasoco Logo"
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-xl text-gray-800">Yasoco</span>
        </div>
      ) : (
        <div className="hidden md:flex items-center justify-center">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden">
            <Image
              src="/logo.png"
              alt="Yasoco Logo"
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
