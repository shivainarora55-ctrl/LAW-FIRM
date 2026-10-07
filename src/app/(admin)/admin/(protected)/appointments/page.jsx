import Link from "next/link";
import { appointments, users } from "@/lib/storage";
import { formatDate, formatTime } from "@/lib/format";
import StatusBadge from "@/components/portal/StatusBadge/StatusBadge";
import Pagination from "@/components/admin/Pagination/Pagination";

export const metadata = { title: "Appointments" };
const PAGE_SIZE = 20;

export default async function AppointmentsPage({ searchParams }) {
  const query = await searchParams;
  const tab = ["past", "cancelled"].includes(query.tab) ? query.tab : "upcoming";
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const [all, clients] = await Promise.all([appointments.listAll(), users.listAll()]);
  const clientMap = new Map(clients.map((client) => [client.id, client.name]));
  const now = new Date();
  const filtered = all.filter((item) => tab === "cancelled" ? item.status === "cancelled" : tab === "past" ? new Date(item.startsAt) < now && item.status !== "cancelled" : item.status === "scheduled" && new Date(item.startsAt) >= now);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const grouped = new Map();
  for (const appointment of pageItems) {
    const key = formatDate(appointment.startsAt);
    grouped.set(key, [...(grouped.get(key) ?? []), appointment]);
  }
  return (
    <>
      <div className="mb-7 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Staff portal</p><h1 className="mt-2 text-3xl font-medium">Appointments</h1></div><Link href="/admin/appointments/new" className="inline-flex min-h-11 items-center bg-brand-black px-5 text-sm font-medium text-white transition-colors hover:bg-brand-red">New appointment</Link></div>
      <div className="mb-6 flex gap-5 border-b border-line">{[["upcoming", "Upcoming"], ["past", "Past"], ["cancelled", "Cancelled"]].map(([key, label]) => <Link key={key} href={`/admin/appointments?tab=${key}`} className={`border-b-2 px-1 py-3 text-sm font-medium ${tab === key ? "border-brand-red text-brand-red" : "border-transparent text-muted"}`}>{label}</Link>)}</div>
      {filtered.length === 0 ? <p className="border-t border-line py-7 text-sm text-muted">No {tab} appointments.</p> : <div className="space-y-7">{[...grouped.entries()].map(([day, items]) => <section key={day}><h2 className="mb-2 text-lg font-medium">{day}</h2><ul className="divide-y divide-line border-y border-line">{items.map((item) => <li key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><Link href={`/admin/appointments/${item.id}`} className="font-medium hover:text-brand-red">{formatTime(item.startsAt)} · {clientMap.get(item.clientId) ?? "Client"}</Link><p className="mt-1 text-xs capitalize text-muted">{item.durationMin} min · {item.mode}{item.location ? ` · ${item.location}` : ""}</p></div><StatusBadge status={item.status} /></li>)}</ul></section>)}</div>}
      <Pagination page={page} total={filtered.length} pathname="/admin/appointments" preserve={{ tab }} />
    </>
  );
}
