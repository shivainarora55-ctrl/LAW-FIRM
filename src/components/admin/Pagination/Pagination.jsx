import Link from "next/link";

export default function Pagination({ page, total, pageSize = 20, pathname, search = "", preserve = {} }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const hrefFor = (target) => `${pathname}?${new URLSearchParams({ ...Object.fromEntries(Object.entries(preserve).filter(([, value]) => value !== "" && value !== undefined && value !== null).map(([key, value]) => [key, String(value)])), ...(search ? { q: search } : {}), page: String(target) })}`;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
      <p className="text-muted">Page {current} of {pageCount} · {total} results</p>
      <div className="flex gap-2">
        {current > 1 ? <Link className="inline-flex min-h-11 items-center border border-brand-black px-4 transition-colors hover:bg-brand-black hover:text-white" href={hrefFor(current - 1)}>Previous</Link> : <span className="inline-flex min-h-11 items-center border border-line px-4 text-muted">Previous</span>}
        {current < pageCount ? <Link className="inline-flex min-h-11 items-center border border-brand-black px-4 transition-colors hover:bg-brand-black hover:text-white" href={hrefFor(current + 1)}>Next</Link> : <span className="inline-flex min-h-11 items-center border border-line px-4 text-muted">Next</span>}
      </div>
    </nav>
  );
}
