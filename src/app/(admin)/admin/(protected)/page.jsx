import Link from "next/link";
import { appointments, documents, matters, requests, users } from "@/lib/storage";
import { firmWeekRange, formatDateTime } from "@/lib/format";
import { EXPERTISE } from "@/constants/expertise";

export const metadata = { title: "Dashboard" };
const practiceNames = Object.fromEntries(EXPERTISE.map((item) => [item.slug, item.title]));

function Stat({ label, value, href }) {
  return <Link href={href} className="block border-t-2 border-brand-black py-4 transition-colors hover:border-brand-red"><p className="text-3xl font-medium">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></Link>;
}

function ListSection({ title, href, children, empty }) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-end justify-between gap-3 border-b border-line pb-3"><h2 className="text-lg font-medium">{title}</h2><Link href={href} className="text-sm font-medium text-brand-red hover:text-brand-red-dark">View all</Link></div>
      {children ?? <p className="py-4 text-sm text-muted">{empty}</p>}
    </section>
  );
}

export default async function AdminDashboard() {
  const [clients, allMatters, allRequests, allAppointments, allDocuments] = await Promise.all([
    users.listAll(),
    matters.listAll(),
    requests.listAll(),
    appointments.listAll(),
    documents.listAll(),
  ]);
  const now = new Date();
  const week = firmWeekRange(now);
  const weekAppointments = allAppointments.filter((item) => item.status === "scheduled" && new Date(item.startsAt) >= week.start && new Date(item.startsAt) < week.end).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const upcoming = allAppointments.filter((item) => item.status === "scheduled" && new Date(item.startsAt) >= now).sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 5);
  const openRequests = allRequests.filter((item) => item.status === "open").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentDocuments = allDocuments.filter((item) => new Date(item.uploadedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 5);
  const newMatters = allMatters.filter((item) => item.status === "submitted" || item.status === "under-review").sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(0, 5);
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));

  return (
    <>
      <div className="mb-8 border-b border-line pb-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Staff portal</p><h1 className="mt-2 text-3xl font-medium sm:text-4xl">Dashboard</h1><p className="mt-3 text-sm text-muted">Current client work and office activity.</p></div>
      <section aria-label="Practice overview" className="mb-9 grid gap-x-8 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total clients" value={clients.length} href="/admin/clients" />
        <Stat label="Matters awaiting review" value={allMatters.filter((item) => ["submitted", "under-review"].includes(item.status)).length} href="/admin/requests?tab=matters" />
        <Stat label="Open requests" value={allRequests.filter((item) => item.status === "open").length} href="/admin/requests" />
        <Stat label="Appointments this week" value={weekAppointments.length} href="/admin/appointments" />
        <Stat label="Documents uploaded in 7 days" value={allDocuments.filter((item) => new Date(item.uploadedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length} href="/admin/documents" />
      </section>
      <div className="grid gap-x-10 gap-y-9 xl:grid-cols-2">
        <ListSection title="New matters needing review" href="/admin/requests?tab=matters" empty="No matters are waiting for review.">
          {newMatters.length > 0 && <ul className="divide-y divide-line border-y border-line">{newMatters.map((item) => <li key={item.id} className="py-3"><Link href={`/admin/matters/${item.id}`} className="font-medium hover:text-brand-red">{item.title}</Link><p className="mt-1 text-xs text-muted">{item.ref} · {clientNames.get(item.userId) ?? "Client"} · {practiceNames[item.practiceArea] ?? item.practiceArea}</p><p className="mt-1 text-xs capitalize text-muted">{item.status.replaceAll("-", " ")} · {formatDateTime(item.createdAt)}</p></li>)}</ul>}
        </ListSection>
        <ListSection title="Upcoming appointments" href="/admin/appointments" empty="No scheduled appointments.">
          {upcoming.length > 0 && <ul className="divide-y divide-line border-y border-line">{upcoming.map((item) => <li key={item.id} className="py-3"><Link href={`/admin/appointments/${item.id}`} className="font-medium hover:text-brand-red">{clientNames.get(item.clientId) ?? "Client"}</Link><p className="mt-1 text-xs text-muted">{formatDateTime(item.startsAt)} · {item.durationMin} min · {item.mode}</p></li>)}</ul>}
        </ListSection>
        <ListSection title="Open client requests" href="/admin/requests" empty="No open client requests.">
          {openRequests.length > 0 && <ul className="divide-y divide-line border-y border-line">{openRequests.map((item) => <li key={item.id} className="py-3"><Link href={`/admin/requests/${item.id}`} className="font-medium capitalize hover:text-brand-red">{item.type}</Link><p className="mt-1 line-clamp-2 text-sm text-muted">{item.message}</p><p className="mt-1 text-xs text-muted">{clientNames.get(item.userId) ?? "Client"} · {formatDateTime(item.createdAt)}</p></li>)}</ul>}
        </ListSection>
        <ListSection title="Recent client documents" href="/admin/documents" empty="No documents uploaded in the last 7 days.">
          {recentDocuments.length > 0 && <ul className="divide-y divide-line border-y border-line">{recentDocuments.map((item) => <li key={item.id} className="py-3"><Link href={`/admin/documents`} className="break-words font-medium hover:text-brand-red">{item.originalName}</Link><p className="mt-1 text-xs text-muted">{clientNames.get(item.userId) ?? "Client"} · {formatDateTime(item.uploadedAt)}</p></li>)}</ul>}
        </ListSection>
      </div>
    </>
  );
}
