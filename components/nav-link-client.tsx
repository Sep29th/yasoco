"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function NavLinkClient({
  href,
  icon,
  label,
  subLinks,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  subLinks?: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || subLinks?.some((s) => pathname === s.href);
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => {
        if (subLinks && window.innerWidth >= 768) {
          setOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (window.innerWidth >= 768) {
          setOpen(false);
        }
      }}
    >
      {/* Nút chính */}
      <Link
        href={href}
        className={`flex flex-col items-center transition-all duration-200 ${
          isActive ? "text-[#A6CF52]" : "text-gray-600"
        } hover:text-[#A6CF52]`}
        onClick={() => {
          // Đóng menu khi click vào link chính
          setOpen(false);
        }}
      >
        <div>{icon}</div>
        <span className="text-sm font-medium mt-1">{label}</span>
      </Link>

      {/* Nút số xuống riêng cho mobile */}
      {subLinks && (
        <button
          type="button"
          className="absolute -right-4 top-2 p-1 text-gray-500 hover:text-[#A6CF52] md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}

      {/* Menu con */}
      {subLinks && open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 pt-2 z-50"
          onMouseEnter={() => {
            // Giữ menu mở khi hover vào menu
            if (window.innerWidth >= 768) {
              setOpen(true);
            }
          }}
        >
          <div className="bg-white shadow-lg border border-gray-100 rounded-lg py-2 w-48">
            {subLinks.map((sub) => {
              const active = pathname === sub.href;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`block px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "text-[#A6CF52] font-medium"
                      : "text-gray-600 hover:text-[#A6CF52] hover:bg-gray-50"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {sub.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
