import Section from "@/components/ui/Section/Section";
import Button from "@/components/ui/Button/Button";
import { SITE } from "@/constants/site";

export default function Hero() {
  return (
    <Section
      tone="dark"
      className="!flex !items-center !py-0 bg-cover bg-center"
      style={{
        minHeight: "100svh",
        backgroundImage:
          "linear-gradient(90deg, rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.76) 52%, rgba(10, 10, 10, 0.4) 100%), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=85')",
      }}
    >
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-red-light">{SITE.tagline}</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Defending your rights when it matters most.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/85 sm:text-xl">
          Experienced advocates providing clear advice and strong representation across civil, criminal and commercial matters.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/#expertise" variant="red" size="lg">Our Expertise</Button>
          <Button
            href={SITE.phoneHref}
            variant="outline"
            size="lg"
            className="border-white text-white hover:border-brand-red-light hover:bg-brand-red-light hover:text-white"
          >
            Call Now
          </Button>
        </div>
      </div>
    </Section>
  );
}
