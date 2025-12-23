import { NavLink } from "@/components/nav-link";
import { MobileNav } from "@/components/mobile-nav";
import {
	BriefcaseMedical,
	CalendarHeart,
	HouseHeart,
	Phone,
	ShieldQuestionMark,
	Stethoscope,
} from "lucide-react";
import { Unkempt } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import FloatingButtons from "@/components/floating-buttons";

const unkemptSans = Unkempt({
	weight: ["400", "700"],
});

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 bg-white">
				<div className="flex items-center justify-between h-full">
					{/* Mobile Menu - Left */}
					<div className="md:hidden">
						<MobileNav />
					</div>

					{/* Desktop Nav - Left */}
					<div className="hidden md:flex items-center justify-start gap-x-10">
						<NavLink href="/" icon={<HouseHeart />} label="Trang Chủ" />
						<NavLink
							href="/linh-vuc"
							icon={<BriefcaseMedical />}
							label="Lĩnh vực"
						/>
						<NavLink
							href="/gioi-thieu"
							icon={<Stethoscope />}
							label="Giới thiệu"
							subLinks={[
								{ href: "/gioi-thieu/ve-chung-toi", label: "Về chúng tôi" },
								{ href: "/gioi-thieu/gia-dich-vu", label: "Giá dịch vụ" },
							]}
						/>
					</div>

					{/* Logo - Center on mobile, middle on desktop */}
					<div>
						<Link href="/" className="flex items-center">
							<Image
								src="/full-logo.png"
								alt="Yasoco Logo"
								height={90}
								width={146}
								className="h-14 md:h-[90px] w-auto"
							/>
						</Link>
					</div>

					{/* Desktop Nav - Right */}
					<div className="hidden md:flex items-center justify-end gap-x-10">
						<NavLink
							href="/dat-lich-kham"
							icon={<CalendarHeart />}
							label="Đặt lịch"
						/>
						<NavLink
							href="/hoi-dap"
							icon={<ShieldQuestionMark />}
							label="Hỏi Đáp"
						/>
						<NavLink href="/lien-he" icon={<Phone />} label="Liên Hệ" />
					</div>

					{/* Spacer for mobile */}
					<div className="md:hidden w-10"></div>
				</div>
			</header>

			{children}

			<footer className="relative min-h-screen flex flex-col items-center justify-between bg-cover bg-center bg-no-repeat pb-10 bg-[url(/footer.webp)] pt-8 md:pt-16 px-4">
				<div className="absolute inset-0 bg-black/50"></div>
				<div className="z-10 backdrop-blur-xs text-center p-6 md:p-16 rounded-2xl md:rounded-4xl bg-white/40 max-w-3xl space-y-3 md:space-y-4 border border-white mx-4">
					<h1
						className={`text-white text-3xl md:text-6xl ${unkemptSans.className} font-bold`}
					>
						Phòng Khám Chuyên Khoa Nhi Yasoco
					</h1>
					<p className="text-[#E2FFA7] text-base md:text-xl m-0">
						Địa chỉ : 8 Ngách 7/18 Đặng Vũ Hỷ, Thượng Thanh, Long Biên, Hà Nội
					</p>
					<p className="text-[#E2FFA7] text-base md:text-xl m-0">
						Số điện thoại phòng khám : 0946.700.185
					</p>
					<p className="text-[#E2FFA7] text-base md:text-xl m-0">
						Điều phối phòng khám : Mrs.Hương - 0978.692.286
					</p>
				</div>
				<div className="text-center space-y-4 z-10 px-4">
					<p className="font-medium text-white text-sm md:text-base">
						Copyright © 2025 Phòng khám Yasoco. All rights reserved.
					</p>
				</div>
			</footer>
			<FloatingButtons />
		</>
	);
}
