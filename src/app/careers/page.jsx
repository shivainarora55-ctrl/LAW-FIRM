import Section from "@/components/ui/Section/Section";
import Button from "@/components/ui/Button/Button";
import { SITE } from "@/constants/site";
import { OPENINGS } from "@/constants/careers";

export const metadata = { title: "Careers" };

export default function CareersPage() {
  return (
    <>
      <Section tone="dark">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-red-light">Careers</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">Start your legal career with us</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          Work alongside experienced advocates, learn the courts first-hand and build a strong foundation.
        </p>
      </Section>

      <Section tone="gray">
        <h2 className="text-3xl font-bold sm:text-4xl">Current openings</h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {OPENINGS.map(({ title, type, duration, location, description }) => (
            <li key={title} className="flex flex-col rounded-lg border border-line bg-white p-6">
              <span className="text-sm font-semibold text-brand-red">{type}</span>
              <h3 className="mt-2 text-xl font-bold">{title}</h3>
              <p className="mt-3 flex-1 text-muted">{description}</p>
              <p className="mt-4 text-sm text-muted">{duration} · {location}</p>
              <Button
                href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Application: ${title}`)}`}
                className="mt-6 self-start"
              >
                Apply Now
              </Button>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
