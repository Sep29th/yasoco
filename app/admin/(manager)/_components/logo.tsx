"use client";

interface LogoProps {
  sidebarOpen: boolean;
}

export default function Logo({ sidebarOpen }: LogoProps) {
  return (
    <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
      {sidebarOpen ? (
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl"
            style={{ backgroundColor: "#A6CF52" }}
          >
            A
          </div>
          <span className="font-bold text-xl text-gray-800">Yasoco</span>
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-lg hidden md:flex items-center justify-center font-bold text-white text-xl"
          style={{ backgroundColor: "#A6CF52" }}
        >
          A
        </div>
      )}
    </div>
  );
}
