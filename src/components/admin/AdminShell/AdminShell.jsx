"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/constants/admin";
import { adminLogout } from "@/actions/adminAuth";

function active(pathname, href) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ admin, children }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="bg-brand-black text-white lg:min-h-screen">
        <div className="border-b border-white/15 px-5 py-5 lg:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red-light">Law firm</p>
          <p className="mt-1 font-heading text-xl">Staff portal</p>
          <p className="mt-4 text-sm text-white/75">{admin.name}</p>
        </div>
        <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:overflow-visible lg:px-3 lg:py-5">
          {ADMIN_NAV_ITEMS.map(({ label, href }) => (
            <Link key={href} href={href} aria-current={active(pathname, href) ? "page" : undefined} className={`shrink-0 border-b-2 px-3 py-3 text-sm transition-colors lg:border-b-0 lg:border-l-2 ${active(pathname, href) ? "border-brand-red bg-white/5 text-brand-red-light" : "border-transparent text-white/80 hover:text-white"}`}>
              {label}
            </Link>
          ))}
          <Link href="/" className="shrink-0 px-3 py-3 text-sm text-white/75 hover:text-white lg:mt-5 lg:border-t lg:border-white/15 lg:pt-5">View website</Link>
          <form action={adminLogout} className="shrink-0 lg:mt-1">
            <button type="submit" className="min-h-11 px-3 text-sm text-white/75 transition-colors hover:text-brand-red-light">Log out</button>
          </form>
        </nav>
      </aside>
      <main className="min-w-0 px-4 py-7 sm:px-6 lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}
