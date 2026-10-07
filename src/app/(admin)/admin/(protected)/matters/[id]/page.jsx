import Link from "next/link";
import { notFound } from "next/navigation";
import { admins, appointments, documents, matters, notes, users } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";
import PageHeading from "@/components/portal/PageHeading/PageHeading";
import StatusBadge from "@/components/portal/StatusBadge/StatusBadge";
import MatterStatusForm from "@/components/admin/MatterStatusForm/MatterStatusForm";
import InternalNoteForm from "@/components/admin/InternalNoteForm/InternalNoteForm";
import { EXPERTISE } from "@/constants/expertise";

const practiceNames = Object.fromEntries(EXPERTISE.map((item) => [item.slug, item.title]));

export async function generateMetadata({ params }) {
  const { id } = await params;
  const matter = await matters.findById(id);
  return { title: matter ? matter.ref : "Matter" };
}

export default async function AdminMatterDetail({ params }) {
  const { id } = await params;
  const matter = await matters.findById(id);
  if (!matter) notFound();
  const [client, allAdmins, allDocuments, allAppointments, allNotes] = await Promise.all([
    users.findUserById(matter.userId), admins.list(), documents.listAll(), appointments.listAll(), notes.listForClient(matter.userId),
  ]);
  const linkedDocuments = allDocuments.filter((item) => item.matterId === matter.id);
  const linkedAppointments = allAppointments.filter((item) => item.matterId === matter.id);
  const matterNotes = allNotes.filter((item) => item.matterId === matter.id);
  return (
    <>
      <PageHeading eyebrow={matter.ref} title={matter.title} description={client ? `${client.name} · ${client.email}` : "Client record unavailable"}><Link href="/admin/requests?tab=matters" className="min-h-11 inline-flex items-center border border-brand-black px-4 text-sm transition-colors hover:bg-brand-black hover:text-white">Back to matters</Link></PageHeading>
      <div className="grid gap-9 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center gap-3"><StatusBadge status={matter.status} /><span className="text-sm capitalize text-muted">{matter.urgency} urgency</span><span className="text-sm text-muted">{practiceNames[matter.practiceArea] ?? matter.practiceArea}</span></div>
          <section className="border-y border-line py-5"><h2 className="text-lg font-medium">Matter details</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{matter.description}</p>{matter.opposingParty && <p className="mt-4 text-sm"><span className="text-muted">Opposing party:</span> {matter.opposingParty}</p>}<p className="mt-2 text-xs text-muted">Preferred contact: {matter.preferredContact}</p></section>
          <section className="mt-7"><h2 className="mb-3 text-lg font-medium">Status history</h2><ol className="border-l border-line pl-5">{matter.statusHistory.map((entry, index) => <li key={`${entry.at}-${index}`} className="relative pb-5"><span className="absolute -left-[1.55rem] top-1 h-2.5 w-2.5 rounded-full bg-brand-red" /><p className="text-sm font-medium capitalize">{entry.status.replaceAll("-", " ")}</p><p className="mt-1 text-xs text-muted">{formatDateTime(entry.at)}</p></li>)}</ol></section>
          <section className="mt-7"><h2 className="mb-3 text-lg font-medium">Client updates</h2>{matter.updates.length ? <ul className="divide-y divide-line border-y border-line">{matter.updates.map((item) => <li key={item.id} className="py-4"><p className="whitespace-pre-wrap text-sm">{item.text}</p><p className="mt-2 text-xs text-muted">{item.authorName} · {formatDateTime(item.createdAt)}</p></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No updates sent.</p>}</section>
          <section className="mt-7"><h2 className="mb-3 text-lg font-medium">Linked documents</h2>{linkedDocuments.length ? <ul className="divide-y divide-line border-y border-line">{linkedDocuments.map((item) => <li key={item.id} className="py-3"><Link href={`/api/admin/documents/${item.id}`} className="font-medium text-brand-red hover:text-brand-red-dark">{item.originalName}</Link><p className="mt-1 text-xs text-muted">{item.uploadedBy === "firm" ? "From firm" : "From client"}</p></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No linked documents.</p>}</section>
          <section className="mt-7"><h2 className="mb-3 text-lg font-medium">Linked appointments</h2>{linkedAppointments.length ? <ul className="divide-y divide-line border-y border-line">{linkedAppointments.map((item) => <li key={item.id} className="py-3"><Link href={`/admin/appointments/${item.id}`} className="font-medium hover:text-brand-red">{formatDateTime(item.startsAt)}</Link><p className="mt-1 text-xs capitalize text-muted">{item.status} · {item.mode}</p></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No linked appointments.</p>}</section>
        </div>
        <aside className="space-y-7"><section><h2 className="mb-3 text-lg font-medium">Manage matter</h2><MatterStatusForm matter={matter} admins={allAdmins} /><Link href={`/admin/appointments/new?clientId=${matter.userId}&matterId=${matter.id}`} className="mt-3 inline-flex min-h-11 items-center bg-brand-black px-4 text-sm font-medium text-white transition-colors hover:bg-brand-red">Schedule appointment</Link></section><section><h2 className="mb-3 text-lg font-medium">Internal notes</h2><InternalNoteForm clientId={matter.userId} matterId={matter.id} /><ul className="mt-4 divide-y divide-line border-y border-line">{matterNotes.map((note) => <li key={note.id} className="py-3"><p className="whitespace-pre-wrap text-sm">{note.text}</p><p className="mt-1 text-xs text-muted">{formatDateTime(note.createdAt)}</p></li>)}</ul>{matterNotes.length === 0 && <p className="mt-3 text-sm text-muted">No internal notes.</p>}</section></aside>
      </div>
    </>
  );
}
