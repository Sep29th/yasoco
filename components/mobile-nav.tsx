"use client";

import { useState } from "react";
import {
  Menu,
  X,
  Phone,
  HouseHeart,
  BriefcaseMedical,
  Stethoscope,
  CalendarHeart,
  ShieldQuestionMark,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: HouseHeart, label: "Trang Chủ" },
  { href: "/linh-vuc", icon: BriefcaseMedical, label: "Lĩnh vực" },
  {
    href: "/gioi-thieu",
    icon: Stethoscope,
    label: "Giới thiệu",
    subLinks: [
      { href: "/gioi-thieu/ve-chung-toi", label: "Về chúng tôi" },
      { href: "/gioi-thieu/gia-dich-vu", label: "Giá dịch vụ" },
    ],
  },
  { href: "/dat-lich-kham", icon: CalendarHeart, label: "Đặt lịch" },
  { href: "/hoi-dap", icon: ShieldQuestionMark, label: "Hỏi Đáp" },
  { href: "/lien-he", icon: Phone, label: "Liên Hệ" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-[#A6CF52] transition-colors"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <Image src="/full-logo.png" alt="Yasoco" height={75} width={120} />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-600 hover:text-[#A6CF52]"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                item.subLinks?.some((s) => pathname === s.href);

              return (
                <div key={item.href}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 w-full p-4 transition-all duration-200 ${
                        isActive
                          ? "text-[#A6CF52] bg-gray-50"
                          : "text-gray-600 hover:text-[#A6CF52] hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                    {item.subLinks && (
                      <button
                        className="pr-4 text-gray-500 hover:text-[#A6CF52]"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === item.href ? null : item.href
                          )
                        }
                      >
                        {openDropdown === item.href ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    )}
                  </div>

                  {item.subLinks && openDropdown === item.href && (
                    <div className="pl-10">
                      {item.subLinks.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setIsOpen(false)}
                          className={`block py-2 text-sm ${
                            pathname === sub.href
                              ? "text-[#A6CF52] font-medium"
                              : "text-gray-600 hover:text-[#A6CF52]"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
