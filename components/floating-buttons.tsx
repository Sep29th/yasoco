"use client";

import { useEffect, useState } from "react";
import { Phone, CalendarHeart, ArrowUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function FloatingButtons() {
	const [showScroll, setShowScroll] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setShowScroll(window.scrollY > 200);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// --- SỬA Ở ĐÂY ---
	// Đổi 'justify-start' thành 'justify-center'
	const buttonBase =
		"flex items-center justify-center gap-2 shadow-lg transition-transform duration-300 hover:scale-110 text-white font-medium";

	return (
		<div className="fixed bottom-6 right-4 flex flex-col gap-3 z-50">
			{/* Scroll to top */}
			{showScroll && (
				<div className="flex justify-end">
					<button
						onClick={scrollToTop}
						aria-label="Scroll to top"
						// Nút này đã có justify-center sẵn rồi, giữ nguyên
						className="bg-gray-700 hover:bg-gray-800 text-white cursor-pointer w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110"
					>
						<ArrowUp className="w-5 h-5" />
					</button>
				</div>
			)}

			{/* Gọi điện */}
			<a
				href="tel:0862973602"
				className={`${buttonBase} bg-green-500 hover:bg-green-600 
        w-12 h-12 sm:w-auto sm:h-auto sm:px-5 sm:py-3 rounded-full`}
			>
				<Phone className="w-5 h-5" />
				<span className="hidden sm:inline">0862973602</span>
			</a>

			{/* Zalo */}
			<a
				href="https://zalo.me/0862973602"
				target="_blank"
				rel="noopener noreferrer"
				className={`${buttonBase} bg-blue-500 hover:bg-blue-600 
        w-12 h-12 sm:w-auto sm:h-auto sm:px-5 sm:py-3 rounded-full`}
			>
				<Image
					alt="Zalo"
					width={20}
					height={20}
					className="w-5 h-5"
					src={"/Icon_of_Zalo.svg"}
				/>
				<span className="hidden sm:inline">Nhắn Zalo</span>
			</a>

			{/* Đặt lịch khám */}
			<Link
				href="/dat-lich-kham"
				className={`${buttonBase} bg-pink-500 hover:bg-pink-600 
        w-12 h-12 sm:w-auto sm:h-auto sm:px-5 sm:py-3 rounded-full`}
			>
				<CalendarHeart className="w-5 h-5" />
				<span className="hidden sm:inline">Đặt lịch khám</span>
			</Link>
		</div>
	);
}
