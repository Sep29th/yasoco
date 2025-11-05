import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <section className="w-full mb-20">
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
          <button className="cursor-pointer px-8 sm:px-10 py-4 bg-white text-[#7ea728] font-semibold rounded-full shadow-2xl hover:shadow-lg hover:scale-105 transition flex items-center space-x-4 text-base animate-bounce hover:animate-none">
            <span>Đặt Lịch Khám</span>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
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
                Bố mẹ các cháu vui lòng thực hiện “Đặt lịch khám” tự động, giúp
                chủ động khám theo từng khung giờ. Xin cảm ơn!
              </p>

              <button className="cursor-pointer bg-[#A6CF52] text-white px-6 py-3 rounded-full hover:bg-[#7ea728] transition text-sm sm:text-base font-medium flex items-center gap-x-2">
                <span>Xem hướng dẫn đặt lịch</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
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
  );
}
