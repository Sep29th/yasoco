import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="w-full mb-10">
        {/* HERO SECTION */}
        <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[calc(100vh-96px)] overflow-hidden lg:rounded-b-[100px]">
          <Image
            src="/section1.webp"
            alt="Bác sĩ và bệnh nhi"
            fill
            priority
            className="object-cover object-center"
          />

          {/* Nút Đặt lịch khám - ĐỔI HIỆU ỨNG VÀ DỪNG KHI HOVER */}
          <div className="absolute inset-0 flex items-end pb-20 sm:pb-24 lg:items-center lg:pb-0 justify-center px-4">
            <Link
              href="/dat-lich-kham"
              className="cursor-pointer px-8 sm:px-10 py-4 bg-white text-[#7ea728] font-semibold rounded-full shadow-2xl hover:shadow-lg hover:scale-105 transition flex items-center space-x-4 text-base animate-bounce hover:animate-none"
            >
              <span>Đặt Lịch Khám</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          </div>
        </div>

        {/* CARD GIỜ MỞ CỬA */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-20 lg:-mt-85 z-10">
          <div className="bg-white rounded-3xl shadow-xl px-6 sm:px-10 py-10 sm:py-14">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center mb-8 sm:mb-10">
              Giờ Mở Cửa
            </h2>

            {/* Danh sách giờ khám */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mb-10">
              {/* Thứ 2 - Thứ 7 */}
              <div className="group flex items-center sm:items-start space-x-4 p-4 sm:p-6 rounded-2xl border border-gray-100 hover:bg-sky-50 hover:shadow-md transition w-full sm:w-auto">
                <div className="bg-sky-100 text-sky-600 p-3 rounded-full group-hover:bg-sky-200 transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 
                    2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 
                    0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800 group-hover:text-sky-700 transition">
                    Thứ 2 đến thứ 7
                  </p>
                  <p className="text-gray-500 text-sm">
                    Thời gian khám: 17h30 - 21h00
                  </p>
                </div>
              </div>

              {/* Chủ Nhật */}
              <div className="group flex items-center sm:items-start space-x-4 p-4 sm:p-6 rounded-2xl border border-gray-100 hover:bg-orange-50 hover:shadow-md transition w-full sm:w-auto">
                <div className="bg-orange-100 text-orange-600 p-3 rounded-full group-hover:bg-orange-200 transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 
                    002-2V7a2 2 0 00-2-2H5a2 2 0 
                    00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800 group-hover:text-orange-700 transition">
                    Chủ Nhật
                  </p>
                  <p className="text-gray-500 text-sm">
                    Thời gian khám: 16h30 - 20h30
                  </p>
                </div>
              </div>
            </div>

            {/* Ghi chú + ảnh minh họa */}
            <div className="border border-dashed border-red-300 bg-pink-50 rounded-2xl lg:pb-0 px-5 pb-5 flex flex-col-reverse lg:flex-row items-center justify-between gap-8">
              {/* Nội dung bên trái */}
              <div className="flex-1 flex flex-col items-center lg:items-start">
                <p className="text-red-600 font-medium mb-6 leading-relaxed text-center lg:text-left">
                  Bố mẹ các cháu vui lòng thực hiện “Đặt lịch khám” tự động,
                  giúp chủ động khám theo từng khung giờ. Xin cảm ơn!
                </p>

                <Link
                  href="/gioi-thieu/quy-dinh-dat-lich-kham"
                  className="cursor-pointer bg-[#A6CF52] text-white px-6 py-3 rounded-full hover:bg-[#7ea728] transition text-sm sm:text-base font-medium flex items-center gap-x-2"
                >
                  <span>Xem hướng dẫn đặt lịch</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
              </div>

              {/* Ảnh minh họa */}
              <div className="shrink-0 w-48 sm:w-60 lg:w-[300px]">
                <Image
                  src="/medicine-bro.svg"
                  alt="Minh họa đặt lịch khám"
                  width={400}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="pb-16 pt-24 sm:py-24 bg-green-100 mb-10 overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative flex justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-300 rounded-3xl transform rotate-40 opacity-60"></div>

              <div className="relative z-10 w-full max-w-sm">
                <Image
                  src="/full-logo.png"
                  alt="Ảnh chụp cùng ngài Roland Dicsonnan"
                  width={450}
                  height={450}
                  className="rounded-xl shadow-lg object-cover bg-white p-8"
                />
                <p className="mt-3 text-xs text-center text-gray-600 italic">
                  Ảnh chụp cùng ngài Roland Dicsonnan - người sáng lập tổ chức
                  KidsCareEverywhere (Ảnh chụp năm 2018)
                </p>
              </div>
            </div>

            <div className="text-left">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Phòng Khám Chuyên Khoa
              </h2>
              <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Yasoco
              </h3>

              <p className="mt-6 text-base text-gray-700 leading-relaxed">
                Ý tưởng tên phòng khám xuất phát từ những công việc hàng ngày.
              </p>
              <p className="mt-4 text-base text-gray-700 leading-relaxed">
                Năm 2014, Bác sĩ Đồng có cơ hội được làm việc cùng tổ chức
                KidsCareEverywhere (
                <Link
                  href="https://www.kidscareeverywhere.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:underline font-medium"
                >
                  https://www.kidscareeverywhere.org
                </Link>
                ). Đây là tổ chức từ thiện nhằm giúp các nhân viên y tế ở những
                nước chưa phát triển, có cơ hội tiếp cận những kiến thức y học
                quan trọng và cập nhật nhất, giúp tăng chất lượng chăm sóc sức
                khỏe trẻ em...
              </p>

              <div className="flex mt-2">
                <Link
                  href="/gioi-thieu" // Thay đổi đường dẫn này
                  className="cursor-pointer py-1 px-3 gap-x-2 bg-white text-[#7ea728] font-semibold rounded-full shadow-2xl hover:shadow-lg hover:scale-105 flex items-center space-x-4 text-base"
                >
                  Chi tiết
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* 1. Lớp SVG trang trí (phía sau, mờ đi) */}
        {/* Giống như hình kim cương màu hồng ở ảnh mẫu đầu tiên, 
        chúng ta dùng SVG làm nền cho một div trang trí.
      */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 
                   w-[90vw] h-[650px] max-w-6xl
                   opacity-20 rounded-3xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='1440' height='560' preserveAspectRatio='none' viewBox='0 0 1440 560'%3E%3Cg mask='url(%26quot;%23SvgjsMask1001%26quot;)' fill='none'%3E%3Crect width='1440' height='560' x='0' y='0' fill='%23A6CF52'%3E%3C/rect%3E%3Cpath d='M 0,156 C 57.6,126.8 172.8,7.6 288,10 C 403.2,12.4 460.8,159.4 576,168 C 691.2,176.6 748.8,45.6 864,53 C 979.2,60.4 1036.8,210.6 1152,205 C 1267.2,199.4 1382.4,61 1440,25L1440 560L0 560z' fill='%23BBDD8B'%3E%3C/path%3E%3Cpath d='M 0,559 C 96,527.6 288,421.4 480,402 C 672,382.6 768,471.4 960,462 C 1152,452.6 1344,376.4 1440,355L1440 560L0 560z' fill='%23CDEBBD'%3E%3C/path%3E%3C/g%3E%3Cdefs%3E%3Cmask id='SvgjsMask1001'%3E%3Crect width='1440' height='560' fill='%23ffffff'%3E%3C/rect%3E%3C/mask%3E%3C/defs%3E%3C/svg%3E")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            // Bạn có thể xoay nó nếu muốn, giống như hình kim cương
            // transform: 'translate(-50%, -50%) rotate(-10deg)',
          }}
        ></div>

        {/* 2. Lớp Nội Dung (ở trên cùng, z-10) */}
        <div className="relative z-10 container mx-auto max-w-3xl px-4">
          {/* Khối nội dung nền trắng đơn giản */}
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
            <div className="text-left">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl text-center">
                Quy định đặt lịch khám
              </h2>

              <div className="mt-8 text-base sm:text-lg text-gray-700 space-y-4 leading-relaxed">
                <p className="text-md">
                  Khuyến nghị tất cả các cháu cần <strong>đặt số khám</strong>,
                  sẽ được ưu tiên khám theo giờ đã đặt.
                </p>
                <p className="text-md">
                  Nếu không thể đặt lịch do hết số, bạn có thể đến trực tiếp
                  phòng khám để lấy số khám (được khám khi có lịch trống).
                </p>
                <p className="text-md">
                  Hoặc vui lòng liên hệ Ms Hương{" "}
                  <a
                    href="tel:0978692286"
                    className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 transition-colors"
                  >
                    0978692286
                  </a>{" "}
                  để được tư vấn.
                </p>

                {/* Dùng blockquote cho phần lưu ý */}
                <blockquote className="mt-6 pt-4 border-t border-gray-200 text-sm italic text-gray-600 text-left">
                  <span className="font-semibold text-gray-800">Lưu ý:</span>{" "}
                  Nếu quá 3 lần đặt lịch thành công mà không đến khám, số điện
                  thoại của bạn sẽ không đặt được lịch cho những lần tiếp. Vui
                  lòng liên hệ với phòng khám để mở lại số.
                </blockquote>
              </div>

              <Link
                href="/quy-dinh-dat-lich" // Thay đổi đường dẫn này
                className="inline-flex items-center justify-center gap-2 mt-10 px-8 py-3 
                         bg-[#A6CF52] text-white font-bold text-lg rounded-full 
                         shadow-md hover:bg-[#8CB846] transition-colors"
              >
                Xem chi tiết
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Cột thông tin liên hệ */}
          <div className="space-y-8 text-center sm:text-left">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Liên hệ
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>
                  Bác sĩ Đông: <span className="font-medium">0966.282.286</span>
                </li>
                <li>
                  Bác sĩ Quân: <span className="font-medium">0376.468.804</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Điều phối phòng khám
              </h3>
              <p className="text-gray-700">
                Mrs Hương: <span className="font-medium">0978.692.286</span>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Địa chỉ
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Tầng 1, chung cư C9, Ngõ 7, Đặng Vũ Hỷ, <br />
                Thượng Thanh, Long Biên, Hà Nội.
              </p>
            </div>
          </div>

          {/* Bản đồ Google */}
          <div className="w-full">
            <iframe
              className="w-full h-[300px] sm:h-[400px] md:h-[450px] rounded-xl shadow-md border"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.7678544020114!2d105.94025537613498!3d21.00194078869755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x36b54e631ff34231%3A0x486afb986f0b5584!2sOcean%20Park!5e0!3m2!1svi!2s!4v1762591156581!5m2!1svi!2s"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
}
