"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import Container from "@/components/ui/Container/Container";
import AuthButton from "@/components/auth/AuthButton/AuthButton";
import Logo from "@/components/layout/Logo/Logo";
import { NAV_LINKS } from "@/constants/site";

const navItem =
  "rounded-md px-4 py-2 text-[15px] font-medium text-white transition-colors duration-200 hover:text-brand-red-light active:bg-brand-red active:text-white";

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50 bg-brand-black/25">
      <Container className="flex h-20 items-center justify-between">
        <Logo />

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} className={navItem}>{label}</Link>
          ))}
          <AuthButton className="ml-3" />
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white transition-colors hover:text-brand-red-light active:bg-brand-red active:text-white lg:hidden"
        >
          {open ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>
      </Container>

      {/* Mobile menu panel */}
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-white/15 bg-brand-black/95 lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={label} href={href} onClick={close} className={`${navItem} py-3`}>{label}</Link>
            ))}
            <AuthButton onClick={close} className="mt-2 w-full" />
          </Container>
        </nav>
      )}
    </header>
  );
}
