import { NavLinkClient } from "./nav-link-client";

export function NavLink({
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
  return (
    <NavLinkClient href={href} icon={icon} label={label} subLinks={subLinks} />
  );
}
