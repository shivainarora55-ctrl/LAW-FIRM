import Link from "next/link";
import { posts } from "@/lib/storage";
import { formatDate } from "@/lib/format";
import Pagination from "@/components/admin/Pagination/Pagination";

export const metadata = { title: "Blogs" };
const PAGE_SIZE = 20;

export default async function AdminBlogsPage({ searchParams }) {
  const query = await searchParams;
  const filter = ["published", "draft"].includes(query.filter) ? query.filter : "all";
  const term = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const allPosts = await posts.listAll();
  const filtered = allPosts.filter((post) => (filter === "all" || post.status === filter) && (!term || `${post.title} ${post.excerpt}`.toLowerCase().includes(term)));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="mb-7 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Staff portal</p><h1 className="mt-2 text-3xl font-medium">Blogs and articles</h1></div><Link href="/admin/blogs/new" className="inline-flex min-h-11 items-center bg-brand-black px-5 text-sm font-medium text-white transition-colors hover:bg-brand-red">New post</Link></div>
      <div className="mb-5 flex gap-5 border-b border-line">{[["all", "All"], ["published", "Published"], ["draft", "Drafts"]].map(([value, label]) => <Link key={value} href={`/admin/blogs?filter=${value}`} className={`border-b-2 px-1 py-3 text-sm font-medium ${filter === value ? "border-brand-red text-brand-red" : "border-transparent text-muted"}`}>{label}</Link>)}</div>
      <form action="/admin/blogs" className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end"><input type="hidden" name="filter" value={filter} /><label className="flex-1 text-sm">Search posts<input type="search" name="q" defaultValue={term} className="mt-1 min-h-11 w-full border border-line px-3" /></label><button className="min-h-11 bg-brand-black px-5 text-sm font-medium text-white transition-colors hover:bg-brand-red">Search</button></form>
      {visible.length === 0 ? <p className="border-t border-line py-7 text-sm text-muted">No posts in this view.</p> : <ul className="divide-y divide-line border-y border-line">{visible.map((post) => <li key={post.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><Link href={`/admin/blogs/${post.id}/edit`} className="font-medium hover:text-brand-red">{post.title}</Link><p className="mt-1 text-xs text-muted">{post.type} · {post.status} · Updated {formatDate(post.updatedAt)}</p></div><Link href={`/admin/blogs/${post.id}/edit`} className="min-h-11 inline-flex items-center text-sm font-medium text-brand-red">Edit</Link></li>)}</ul>}
      <Pagination page={page} total={filtered.length} pathname="/admin/blogs" search={term} preserve={{ filter }} />
    </>
  );
}
