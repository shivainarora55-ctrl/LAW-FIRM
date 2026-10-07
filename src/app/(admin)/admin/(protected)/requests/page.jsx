import Link from "next/link";
import { matters, requests, users } from "@/lib/storage";
import { REQUEST_STATUSES, MATTER_STATUSES } from "@/constants/admin";
import { formatDateTime } from "@/lib/format";
import StatusBadge from "@/components/portal/StatusBadge/StatusBadge";
import Pagination from "@/components/admin/Pagination/Pagination";

export const metadata = { title: "Requests" };
const PAGE_SIZE = 20;

export default async function AdminRequestsPage({ searchParams }) {
  const query = await searchParams;
  const tab = query.tab === "matters" ? "matters" : "requests";
  const status = typeof query.status === "string" ? query.status : "";
  const type = typeof query.type === "string" ? query.type : "";
  const term = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const [clientList, requestList, matterList] = await Promise.all([users.listAll(), requests.listAll(), matters.listAll()]);
  const clients = new Map(clientList.map((client) => [client.id, client.name]));
  const isMatters = tab === "matters";
  const statuses = isMatters ? MATTER_STATUSES : REQUEST_STATUSES;
  const source = isMatters ? matterList : requestList;
  const filtered = source.filter((item) => {
    const matchesStatus = !status || item.status === status;
    const matchesType = isMatters || !type || item.type === type;
    const text = isMatters ? `${item.title} ${item.ref} ${clients.get(item.userId) ?? ""}` : `${item.message} ${item.type} ${clients.get(item.userId) ?? ""}`;
    return matchesStatus && matchesType && (!term || text.toLowerCase().includes(term));
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="mb-7 border-b border-line pb-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Staff portal</p><h1 className="mt-2 text-3xl font-medium">Requests</h1></div>
      <div className="mb-5 flex gap-5 border-b border-line"><Link href="/admin/requests?tab=requests" aria-current={!isMatters ? "page" : undefined} className={`border-b-2 px-1 py-3 text-sm font-medium ${!isMatters ? "border-brand-red text-brand-red" : "border-transparent text-muted"}`}>Client requests</Link><Link href="/admin/requests?tab=matters" aria-current={isMatters ? "page" : undefined} className={`border-b-2 px-1 py-3 text-sm font-medium ${isMatters ? "border-brand-red text-brand-red" : "border-transparent text-muted"}`}>Matter submissions</Link></div>
      <form action="/admin/requests" className="mb-5 grid gap-3 sm:grid-cols-4">
        <input type="hidden" name="tab" value={tab} />
        <label className="text-sm">Search<input name="q" type="search" defaultValue={term} className="mt-1 min-h-11 w-full border border-line px-3" /></label>
        <label className="text-sm">Status<select name="status" defaultValue={status} className="mt-1 min-h-11 w-full border border-line bg-white px-3"><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("-", " ")}</option>)}</select></label>
        {!isMatters && <label className="text-sm">Type<select name="type" defaultValue={type} className="mt-1 min-h-11 w-full border border-line bg-white px-3"><option value="">All types</option>{[...new Set(requestList.map((item) => item.type))].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>}
        <button className="min-h-11 self-end bg-brand-black px-5 text-sm font-medium text-white transition-colors hover:bg-brand-red">Filter</button>
      </form>
      {pageItems.length === 0 ? <p className="border-t border-line py-7 text-sm text-muted">No matching {isMatters ? "matter submissions" : "client requests"}.</p> : <ul className="divide-y divide-line border-y border-line">{pageItems.map((item) => <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><Link href={isMatters ? `/admin/matters/${item.id}` : `/admin/requests/${item.id}`} className="font-medium hover:text-brand-red">{isMatters ? item.title : item.type}</Link><p className="mt-1 text-xs text-muted">{clients.get(item.userId) ?? "Client"}{isMatters ? ` · ${item.ref}` : ""} · {formatDateTime(item.createdAt)}</p><p className="mt-1 line-clamp-2 text-sm text-muted">{isMatters ? item.description : item.message}</p></div><StatusBadge status={item.status} /></li>)}</ul>}
      <Pagination page={page} total={filtered.length} pathname="/admin/requests" search={term} preserve={{ tab, status, type }} />
    </>
  );
}
