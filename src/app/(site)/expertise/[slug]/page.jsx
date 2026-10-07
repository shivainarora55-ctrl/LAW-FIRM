import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import Section from "@/components/ui/Section/Section";
import Button from "@/components/ui/Button/Button";
import InfoBlock from "@/components/ui/InfoBlock/InfoBlock";
import { EXPERTISE, getExpertise } from "@/constants/expertise";
import { SITE } from "@/constants/site";

export function generateStaticParams() {
  return EXPERTISE.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getExpertise(slug);
  return item ? { title: item.title, description: item.summary } : {};
}

export default async function ExpertisePage({ params }) {
  const { slug } = await params;
  const item = getExpertise(slug);
  if (!item) notFound();

  return (
    <>
      <Section tone="dark">
        <Link href="/#expertise" className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-brand-red-light">
          <FiArrowLeft aria-hidden /> All areas of practice
        </Link>
        <h1 className="mt-6 text-4xl font-bold sm:text-5xl lg:text-6xl">{item.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">{item.summary}</p>
      </Section>

      <Section tone="gray">
        <div className="grid gap-6 lg:grid-cols-2">
          <InfoBlock title="Common problems" items={item.problems} />
          <InfoBlock title="How we resolve them" items={item.solutions} />
          <InfoBlock title="Applicable acts" items={item.acts} />
          <InfoBlock title="Punishment and penalties" items={item.punishment} />
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-lg bg-brand-black p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xl font-semibold">Facing this issue? Speak to our team.</p>
          <Button href={SITE.phoneHref} variant="red" size="lg">Call {SITE.phone}</Button>
        </div>

        <p className="mt-6 text-sm text-muted">
          This page is general information, not legal advice. Outcomes depend on the facts of each case.
        </p>
      </Section>
    </>
  );
}
