"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import Section from "@/components/ui/Section/Section";

const TABS = [
  { value: "All", label: "All" },
  { value: "Article", label: "Articles" },
  { value: "Blog", label: "Blogs" },
];

export default function Insights({ insights }) {
  const [tab, setTab] = useState("All");
  const visible = tab === "All" ? insights : insights.filter((i) => i.type === tab);

  return (
    <Section id="insights" tone="white">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-red">Insights</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">Articles and blogs</h2>
        </div>

        <div role="group" aria-label="Filter insights" className="flex gap-2">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
              className={`min-h-11 rounded-md border-2 px-5 text-sm font-semibold transition-colors duration-200 active:bg-brand-red-dark ${
                tab === value
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-brand-black hover:border-brand-red hover:bg-brand-red hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? <p className="mt-8 border-t border-line py-6 text-muted">New articles coming soon.</p> : <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ slug, type, title, date, excerpt }) => (
          <article key={slug} className="group flex flex-col rounded-lg border border-line p-6 transition-colors duration-200 hover:border-brand-red">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-brand-red">{type}</span>
              <time className="text-muted" dateTime={date}>{date}</time>
            </div>
            <h3 className="mt-4 text-xl font-bold leading-snug">{title}</h3>
            <p className="mt-3 flex-1 text-muted">{excerpt}</p>
            <Link href={`/insights/${slug}`} className="mt-6 inline-flex items-center gap-1 font-semibold transition-colors hover:text-brand-red active:text-brand-red-dark">
              Read more <FiArrowUpRight aria-hidden />
            </Link>
          </article>
        ))}
      </div>}
    </Section>
  );
}
