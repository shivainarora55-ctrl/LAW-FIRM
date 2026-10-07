"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTAL_ITEMS } from "@/constants/portal";
import { logout } from "@/actions/portal";

function isActive(pathname, href) {
  return href === "/portal" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function PortalNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Client portal" className="min-w-0 border-b border-line bg-white lg:border-b-0">
      <div className="flex gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:flex-col lg:overflow-visible lg:px-0 lg:py-0">
        {PORTAL_ITEMS.map(({ label, href }) => (
          <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors lg:border-b-0 lg:border-l-2 ${isActive(pathname, href) ? "border-brand-red text-brand-red lg:bg-soft-gray" : "border-transparent text-muted hover:text-brand-red"}`}>
            {label}
          </Link>
        ))}
        <form action={logout} className="shrink-0 lg:mt-6 lg:border-t lg:border-line lg:pt-4">
          <button type="submit" className="min-h-11 px-3 text-sm font-medium text-muted transition-colors hover:text-brand-red">Log out</button>
        </form>
      </div>
    </nav>
  );
}
