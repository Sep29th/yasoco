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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/", icon: HouseHeart, label: "Trang Chủ" },
  { href: "/", icon: BriefcaseMedical, label: "Lĩnh vực" },
  { href: "/", icon: Stethoscope, label: "Giới thiệu" },
  { href: "/", icon: CalendarHeart, label: "Đặt lịch" },
  { href: "/", icon: ShieldQuestionMark, label: "Hỏi Đáp" },
  { href: "/", icon: Phone, label: "Liên Hệ" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-[#A6CF52] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Image
              src="/full-logo.png"
              alt="Yasoco Logo"
              height={75}
              width={120}
              className="h-12 w-auto"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-600 hover:text-[#A6CF52] transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 w-full p-4 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="text-gray-600 group-hover:text-[#A6CF52] transition-colors">
                    <Icon size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-[#A6CF52] transition-colors">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
