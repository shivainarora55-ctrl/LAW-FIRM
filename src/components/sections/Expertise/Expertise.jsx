import Section from "@/components/ui/Section/Section";
import ExpertiseCard from "./ExpertiseCard";
import { EXPERTISE } from "@/constants/expertise";

export default function Expertise() {
  return (
    <Section id="expertise" tone="gray">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-red">Expertise</p>
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">Areas of practice</h2>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Select an area to read about common problems, how we resolve them, the laws involved and the penalties.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {EXPERTISE.map((item) => (
          <ExpertiseCard key={item.slug} {...item} />
        ))}
      </div>
    </Section>
  );
}
