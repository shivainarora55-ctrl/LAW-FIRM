import Link from "next/link";
import { SITE } from "@/constants/site";

export default function Logo() {
  return (
    <Link href="/" aria-label={`${SITE.name} home`} className="flex items-center gap-3">
      {/* PLACEHOLDER: replace with <Image src="/images/logo.png" width={96} height={56} alt="" /> */}
      <span className="flex h-14 w-24 items-center justify-center bg-brand-red font-heading text-xl font-bold tracking-widest text-white">
        LOGO
      </span>
      <span className="hidden text-sm leading-tight sm:block">
        <span className="block font-semibold text-white">{SITE.name}</span>
        <span className="block text-xs uppercase tracking-widest text-white/70">Since {SITE.since}</span>
      </span>
    </Link>
  );
}
