import Link from "next/link";
import { FaLinkedinIn, FaXTwitter, FaFacebookF, FaInstagram } from "react-icons/fa6";
import { FiLock } from "react-icons/fi";
import Container from "@/components/ui/Container/Container";
import Button from "@/components/ui/Button/Button";
import { SITE, NAV_LINKS, AUTH_LINK, LEGAL_LINKS } from "@/constants/site";
import { EXPERTISE } from "@/constants/expertise";

const SOCIALS = [
  { label: "LinkedIn", icon: FaLinkedinIn, href: SITE.social.linkedin },
  { label: "X", icon: FaXTwitter, href: SITE.social.x },
  { label: "Facebook", icon: FaFacebookF, href: SITE.social.facebook },
  { label: "Instagram", icon: FaInstagram, href: SITE.social.instagram },
];

const linkStyle =
  "text-white/80 transition-colors duration-200 hover:text-brand-red-light active:text-brand-red";

function Column({ title, children }) {
  return (
    <div>
      <h3 className="text-xl font-bold">{title}</h3>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white">
      {/* Newsletter band */}
      <Container className="flex flex-col gap-6 border-b border-white/15 py-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Sign Up for Our Newsletters.</h2>
          <p className="mt-3 text-white/70">
            Subscribe for timely updates on the latest legal developments, with expert commentary delivered directly to your inbox.
          </p>
        </div>
        <Button href="/newsletter" variant="red" size="lg" className="self-start lg:self-auto">Sign Up</Button>
      </Container>

      {/* Link columns */}
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <Column title="Explore">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}><Link href={href} className={linkStyle}>{label}</Link></li>
          ))}
        </Column>

        <Column title="Our Expertise">
          {EXPERTISE.slice(0, 6).map(({ slug, title }) => (
            <li key={slug}><Link href={`/expertise/${slug}`} className={linkStyle}>{title}</Link></li>
          ))}
        </Column>

        <Column title="Quick Links">
          <li><Link href="/careers" className={linkStyle}>Careers</Link></li>
          <li><Link href={AUTH_LINK.href} className={linkStyle}>{AUTH_LINK.label}</Link></li>
        </Column>

        <Column title="Contact">
          <li><a href={SITE.phoneHref} className={linkStyle}>{SITE.phone}</a></li>
          <li><a href={`mailto:${SITE.email}`} className={linkStyle}>{SITE.email}</a></li>
          <li className="text-white/80">{SITE.address}</li>
        </Column>
      </Container>

      {/* Bottom bar */}
      <Container className="border-t border-white/15 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            {SOCIALS.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-brand-red active:bg-brand-red-dark"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold uppercase tracking-wide">
            {LEGAL_LINKS.map(({ label, href }) => (
              <li key={label}><Link href={href} className={linkStyle}>{label}</Link></li>
            ))}
            <li className="text-white/60">© {new Date().getFullYear()} {SITE.name}</li>
            <li>
              {/* Admin login only: lawyers are pre-registered, there is no signup */}
              <Link
                href="/admin/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/30 px-4 transition-colors duration-200 hover:border-brand-red hover:bg-brand-red active:bg-brand-red-dark"
              >
                <FiLock aria-hidden /> Admin Access
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
