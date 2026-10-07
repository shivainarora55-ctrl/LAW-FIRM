import Link from "next/link";
import { notFound } from "next/navigation";
import { appointments, documents, matters, notes, requests, users } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";
import StatusBadge from "@/components/portal/StatusBadge/StatusBadge";
import InternalNoteForm from "@/components/admin/InternalNoteForm/InternalNoteForm";
import PageHeading from "@/components/portal/PageHeading/PageHeading";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const client = await users.findUserById(id);
  return { title: client ? client.name : "Client" };
}

export default async function ClientDetailPage({ params }) {
  const { id } = await params;
  const client = await users.findUserById(id);
  if (!client) notFound();
  const [clientMatters, allDocuments, allRequests, clientAppointments, clientNotes] = await Promise.all([
    matters.listMattersForUser(id),
    documents.listAll(),
    requests.listRequestsForUser(id),
    appointments.listForClient(id),
    notes.listForClient(id),
  ]);
  const clientDocuments = allDocuments.filter((item) => item.userId === id);
  const linkedMatter = new Map(clientMatters.map((matter) => [matter.id, matter]));
  return (
    <>
      <PageHeading eyebrow="Client record" title={client.name} description={client.email}>
        <Link href="/admin/clients" className="min-h-11 inline-flex items-center border border-brand-black px-4 text-sm transition-colors hover:bg-brand-black hover:text-white">Back to clients</Link>
      </PageHeading>
      <section className="mb-9 grid gap-4 border-y border-line py-5 sm:grid-cols-2 xl:grid-cols-4"><p className="text-sm"><span className="block text-xs uppercase text-muted">Phone</span><span className="mt-1 block">{client.phone}</span></p><p className="text-sm"><span className="block text-xs uppercase text-muted">Address</span><span className="mt-1 block">{client.address || "Not provided"}</span></p><p className="text-sm"><span className="block text-xs uppercase text-muted">City / state</span><span className="mt-1 block">{[client.city, client.state].filter(Boolean).join(", ") || "Not provided"}</span></p><p className="text-sm"><span className="block text-xs uppercase text-muted">Joined</span><span className="mt-1 block">{formatDateTime(client.createdAt)}</span></p></section>
      <div className="grid gap-10 xl:grid-cols-2">
        <section><h2 className="mb-3 text-lg font-medium">Matters</h2>{clientMatters.length ? <ul className="divide-y divide-line border-y border-line">{clientMatters.map((matter) => <li key={matter.id} className="flex items-center justify-between gap-3 py-3"><div><Link href={`/admin/matters/${matter.id}`} className="font-medium hover:text-brand-red">{matter.title}</Link><p className="mt-1 text-xs text-muted">{matter.ref} · {formatDateTime(matter.createdAt)}</p></div><StatusBadge status={matter.status} /></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No matters.</p>}</section>
        <section><h2 className="mb-3 text-lg font-medium">Documents</h2>{clientDocuments.length ? <ul className="divide-y divide-line border-y border-line">{clientDocuments.map((item) => <li key={item.id} className="py-3"><p className="break-words font-medium">{item.originalName}</p><p className="mt-1 text-xs text-muted">{item.matterId ? linkedMatter.get(item.matterId)?.ref ?? "Matter unavailable" : "No linked matter"} · {item.uploadedBy === "firm" ? "From firm" : "From client"}</p></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No documents.</p>}</section>
        <section><h2 className="mb-3 text-lg font-medium">Requests</h2>{allRequests.length ? <ul className="divide-y divide-line border-y border-line">{allRequests.map((item) => <li key={item.id} className="py-3"><Link href={`/admin/requests/${item.id}`} className="font-medium capitalize hover:text-brand-red">{item.type}</Link><p className="mt-1 line-clamp-2 text-sm text-muted">{item.message}</p><p className="mt-1 text-xs capitalize text-muted">{item.status}</p></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No requests.</p>}</section>
        <section><h2 className="mb-3 text-lg font-medium">Appointments</h2>{clientAppointments.length ? <ul className="divide-y divide-line border-y border-line">{clientAppointments.map((item) => <li key={item.id} className="py-3"><Link href={`/admin/appointments/${item.id}`} className="font-medium hover:text-brand-red">{formatDateTime(item.startsAt)}</Link><p className="mt-1 text-xs capitalize text-muted">{item.durationMin} minutes · {item.mode} · {item.status}</p></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No appointments.</p>}</section>
      </div>
      <section className="mt-10 border-t border-line pt-7"><h2 className="mb-4 text-lg font-medium">Internal notes</h2><InternalNoteForm clientId={client.id} /><ul className="mt-5 divide-y divide-line border-y border-line">{clientNotes.map((note) => <li key={note.id} className="py-3"><p className="whitespace-pre-wrap text-sm">{note.text}</p><p className="mt-1 text-xs text-muted">{formatDateTime(note.createdAt)}</p></li>)}</ul>{clientNotes.length === 0 && <p className="mt-4 text-sm text-muted">No internal notes.</p>}</section>
    </>
  );
}
