import Link from "next/link";
import { users, matters } from "@/lib/storage";
import { formatDate } from "@/lib/format";
import Pagination from "@/components/admin/Pagination/Pagination";
import SearchForm from "@/components/admin/SearchForm/SearchForm";

export const metadata = { title: "Clients" };
const PAGE_SIZE = 20;

export default async function ClientsPage({ searchParams }) {
  const query = await searchParams;
  const term = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const [allClients, allMatters] = await Promise.all([users.listAll(), matters.listAll()]);
  const counts = new Map();
  for (const matter of allMatters) counts.set(matter.userId, (counts.get(matter.userId) ?? 0) + 1);
  const filtered = allClients.filter((client) => !term || [client.name, client.email, client.phone].some((value) => value?.toLowerCase().includes(term)));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="mb-7 border-b border-line pb-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Staff portal</p><h1 className="mt-2 text-3xl font-medium">Clients</h1></div>
      <SearchForm action="/admin/clients" initialQuery={term} placeholder="Search name, email, or phone" />
      {slice.length === 0 ? <p className="border-t border-line py-7 text-sm text-muted">No clients match this search.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[42rem] border-collapse text-left text-sm"><thead><tr className="border-y border-line text-xs uppercase tracking-wide text-muted"><th className="py-3 pr-4 font-medium">Client</th><th className="py-3 pr-4 font-medium">Email</th><th className="py-3 pr-4 font-medium">Phone</th><th className="py-3 pr-4 font-medium">Matters</th><th className="py-3 font-medium">Joined</th></tr></thead><tbody>{slice.map((client) => <tr key={client.id} className="border-b border-line"><td className="py-4 pr-4"><Link href={`/admin/clients/${client.id}`} className="font-medium hover:text-brand-red">{client.name}</Link></td><td className="py-4 pr-4 text-muted">{client.email}</td><td className="py-4 pr-4 text-muted">{client.phone}</td><td className="py-4 pr-4">{counts.get(client.id) ?? 0}</td><td className="py-4 text-muted">{formatDate(client.createdAt)}</td></tr>)}</tbody></table></div>}
      <Pagination page={page} total={filtered.length} pathname="/admin/clients" search={term} />
    </>
  );
}
