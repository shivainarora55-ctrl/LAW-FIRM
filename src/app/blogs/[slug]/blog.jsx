import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import Section from "@/components/ui/Section/Section";

export default function Blog({ blog }) {
  return (
    <>
      <Section tone="dark">
        <Link href="/#insights" className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-brand-red-light">
          <FiArrowLeft aria-hidden /> Back to Insights
        </Link>
        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-brand-red-light">{blog.type}</p>
        <p className="mt-3 text-sm text-white/70">{blog.date}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{blog.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{blog.excerpt}</p>
      </Section>

      <Section tone="gray">
        <div className="max-w-3xl border-y border-line py-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-red">Full blog coming soon</p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            The full blog content will be published once it has been provided and approved by the advocate.
          </p>
        </div>
        <Link href="/#insights" className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-md border-2 border-brand-black px-5 py-2 font-semibold transition-colors hover:border-brand-red hover:bg-brand-red hover:text-white active:bg-brand-red-dark">
          <FiArrowLeft aria-hidden /> Back to Insights
        </Link>
      </Section>
    </>
  );
}
