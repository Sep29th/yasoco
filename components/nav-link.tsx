import Link from "next/link";

export function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center transition-all duration-200 hover:scale-110"
    >
      <div className="text-gray-600 group-hover:text-[#A6CF52] transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-600 group-hover:text-[#A6CF52] transition-colors mt-1">
        {label}
      </span>
    </Link>
  );
}
