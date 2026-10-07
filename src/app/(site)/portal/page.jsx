import Link from "next/link";
import PageHeading from "@/components/portal/PageHeading/PageHeading";
import MatterList from "@/components/portal/MatterList/MatterList";
import { requireUser } from "@/lib/auth";
import { appointments, documents, matters, requests } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Dashboard" };

function Stat({ label, value, href }) {
  return <Link href={href} className="block border-t-2 border-brand-black py-4 transition-colors hover:border-brand-red"><p className="text-3xl font-medium">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></Link>;
}

export default async function PortalDashboard() {
  const user = await requireUser();
  const [userMatters, userDocuments, userRequests, userAppointments] = await Promise.all([
    matters.listMattersForUser(user.id),
    documents.listDocumentsForUser(user.id),
    requests.listRequestsForUser(user.id),
    appointments.listForClient(user.id),
  ]);
  const openRequests = userRequests.filter((request) => request.status !== "resolved").length;
  const memberSince = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(user.createdAt));
  const upcomingAppointments = userAppointments.filter((appointment) => appointment.status === "scheduled" && new Date(appointment.startsAt) > new Date()).slice(0, 4);
  const recentActivity = [
    ...userMatters.flatMap((matter) => [
      ...matter.statusHistory.slice(1).map((entry) => ({ id: `${matter.id}-status-${entry.at}`, at: entry.at, text: `Matter ${matter.ref} status changed to ${entry.status.replaceAll("-", " ")}.` })),
      ...matter.updates.map((entry) => ({ id: entry.id, at: entry.createdAt, text: `Update on ${matter.ref}: ${entry.text}` })),
    ]),
    ...userRequests.flatMap((request) => request.replies.map((entry) => ({ id: entry.id, at: entry.createdAt, text: `Reply to your ${request.type} request: ${entry.text}` }))),
    ...userDocuments.filter((document) => document.uploadedBy === "firm").map((document) => ({ id: document.id, at: document.uploadedAt, text: `A document was shared with you: ${document.originalName}` })),
    ...upcomingAppointments.map((appointment) => ({ id: appointment.id, at: appointment.createdAt, text: `An appointment is scheduled for ${formatDateTime(appointment.startsAt)}.` })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

  return (
    <>
      <PageHeading title={`Welcome, ${user.name.split(" ")[0]}`} description="A current view of your matters and account." />
      <section aria-labelledby="profile-summary-heading" className="mb-9 border border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 id="profile-summary-heading" className="text-lg font-medium">Profile summary</h2><p className="mt-2 text-sm text-muted">{user.email}</p><p className="mt-1 text-sm text-muted">{user.phone}</p><p className="mt-1 text-sm text-muted">{[user.city, user.state].filter(Boolean).join(", ") || "Location not added"}</p><p className="mt-1 text-xs text-muted">Member since {memberSince}</p></div>
          <Link href="/portal/profile" className="min-h-11 border border-brand-black px-4 py-2 text-sm font-medium transition-colors hover:bg-brand-black hover:text-white">Edit profile</Link>
        </div>
      </section>
      <section aria-label="Account activity" className="mb-10 grid gap-x-8 sm:grid-cols-3">
        <Stat label="Matters" value={userMatters.length} href="/portal" />
        <Stat label="Documents" value={userDocuments.length} href="/portal/documents" />
        <Stat label="Open requests" value={openRequests} href="/portal/requests" />
      </section>
      <div className="mb-10 grid gap-9 lg:grid-cols-2">
        <section aria-labelledby="upcoming-appointments-heading"><h2 id="upcoming-appointments-heading" className="mb-3 text-xl font-medium">Upcoming appointments</h2>{upcomingAppointments.length ? <ul className="divide-y divide-line border-y border-line">{upcomingAppointments.map((appointment) => <li key={appointment.id} className="py-3"><p className="font-medium">{formatDateTime(appointment.startsAt)}</p><p className="mt-1 text-xs capitalize text-muted">{appointment.durationMin} minutes · {appointment.mode}{appointment.location ? ` · ${appointment.location}` : ""}</p></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No upcoming appointments.</p>}</section>
        <section aria-labelledby="recent-updates-heading"><h2 id="recent-updates-heading" className="mb-3 text-xl font-medium">Recent updates</h2>{recentActivity.length ? <ul className="divide-y divide-line border-y border-line">{recentActivity.map((activity) => <li key={activity.id} className="py-3"><p className="text-sm">{activity.text}</p><p className="mt-1 text-xs text-muted">{formatDateTime(activity.at)}</p></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No recent updates.</p>}</section>
      </div>
      <section aria-labelledby="matters-heading">
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Your account</p><h2 id="matters-heading" className="mt-1 text-2xl font-medium">Your matters</h2></div><Link href="/portal/submit-matter" className="text-sm font-medium text-brand-red hover:text-brand-red-dark">Submit matter</Link></div>
        <MatterList matters={userMatters} />
      </section>
    </>
  );
}
