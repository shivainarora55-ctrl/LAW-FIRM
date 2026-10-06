import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export default function ExpertiseCard({ slug, title, summary }) {
  return (
    <Link
      href={`/expertise/${slug}`}
      className="group relative flex min-h-64 flex-col justify-end rounded-lg bg-brand-black p-6 text-white transition-colors duration-300 hover:bg-brand-red active:bg-brand-red-dark sm:min-h-72"
    >
      {/* PHOTO LATER: add a background <Image> with a dark overlay here */}
      <FiArrowUpRight aria-hidden size={26} className="absolute right-5 top-5 text-white/60 transition-colors group-hover:text-white" />
      <h3 className="text-2xl font-semibold leading-snug">{title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-white/80">{summary}</p>
    </Link>
  );
}
