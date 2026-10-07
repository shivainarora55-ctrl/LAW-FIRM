import Link from "next/link";
import { posts } from "@/lib/storage";
import { formatDate } from "@/lib/format";
import PageHeading from "@/components/portal/PageHeading/PageHeading";
import Pagination from "@/components/admin/Pagination/Pagination";

export const metadata = { title: "Insights" };
const PAGE_SIZE = 20;

export default async function InsightsIndexPage({ searchParams }) {
  const query = await searchParams;
  const filter = ["Article", "Blog"].includes(query.type) ? query.type : "All";
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const allPosts = await posts.listPublished();
  const filtered = filter === "All" ? allPosts : allPosts.filter((post) => post.type === filter);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <PageHeading title="Insights" description="Articles and practical notes from the firm." />
      <div role="group" aria-label="Filter insights" className="mb-6 flex gap-5 border-b border-line">{[["All", "All"], ["Article", "Articles"], ["Blog", "Blogs"]].map(([type, label]) => <Link key={type} href={`/insights?type=${type}`} aria-current={filter === type ? "page" : undefined} className={`border-b-2 px-1 py-3 text-sm font-medium ${filter === type ? "border-brand-red text-brand-red" : "border-transparent text-muted hover:text-brand-black"}`}>{label}</Link>)}</div>
      {items.length === 0 ? <p className="border-t border-line py-7 text-muted">New articles coming soon.</p> : <div className="grid gap-x-9 md:grid-cols-2 lg:grid-cols-3">{items.map((post) => <article key={post.id} className="border-t border-line py-5"><div className="flex justify-between gap-4 text-xs"><span className="font-medium text-brand-red">{post.type}</span><time className="text-muted" dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></div><h2 className="mt-3 text-xl font-medium"><Link href={`/insights/${post.slug}`} className="hover:text-brand-red">{post.title}</Link></h2><p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p><Link href={`/insights/${post.slug}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brand-red hover:text-brand-red-dark">Read more</Link></article>)}</div>}
      <Pagination page={page} total={filtered.length} pathname="/insights" preserve={{ type: filter === "All" ? "" : filter }} />
    </>
  );
}
