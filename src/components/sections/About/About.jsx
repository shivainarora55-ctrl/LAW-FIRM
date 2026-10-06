import Section from "@/components/ui/Section/Section";
import { SITE } from "@/constants/site";

export default function About() {
  return (
    <Section id="about" tone="white">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-red">About Us</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Trusted counsel, built on decades of practice
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Replace this with the firm's story: when it was founded, who leads it, and the kinds of clients and matters it serves.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Add a second paragraph on the firm's approach, values and what clients can expect when they work with the team.
          </p>

          <figure className="mt-10 rounded-2xl rounded-bl-none bg-brand-red p-6 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-bold text-brand-red">
                {SITE.name.charAt(0)}
              </span>
              <div className="leading-tight">
                <p className="font-semibold">{SITE.name}</p>
                <p className="text-sm text-white/80">@{SITE.handle}</p>
              </div>
            </div>
            <blockquote className="mt-4 text-lg leading-snug">
              “Every client deserves clear advice, honest answers and a lawyer who fights for their outcome.”
            </blockquote>
            <figcaption className="mt-4 text-sm text-white/80">Since {SITE.since}</figcaption>
          </figure>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          {/* PLACEHOLDER: replace with <Image src="/images/lawyer.jpg" alt="..." fill className="object-cover" /> inside this box */}
          <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl border-b-8 border-brand-red bg-soft-gray text-muted">
            Lawyer photo
          </div>
        </div>
      </div>
    </Section>
  );
}
