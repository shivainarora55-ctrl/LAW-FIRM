import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeading from "@/components/portal/PageHeading/PageHeading";
import StatusBadge from "@/components/portal/StatusBadge/StatusBadge";
import { requireUser } from "@/lib/auth";
import { documents, matters } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";
import { EXPERTISE } from "@/constants/expertise";

const practiceNames = Object.fromEntries(EXPERTISE.map((item) => [item.slug, item.title]));

export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await requireUser();
  const matter = await matters.findMatterForUser(id, user.id);
  return { title: matter?.ref ?? "Matter" };
}

export default async function ClientMatterPage({ params }) {
  const { id } = await params;
  const user = await requireUser();
  const matter = await matters.findMatterForUser(id, user.id);
  if (!matter) notFound();
  const userDocuments = (await documents.listDocumentsForUser(user.id)).filter((document) => document.matterId === matter.id);
  return (
    <>
      <PageHeading eyebrow={matter.ref} title={matter.title} description={practiceNames[matter.practiceArea] ?? matter.practiceArea}><Link href="/portal" className="min-h-11 inline-flex items-center border border-brand-black px-4 text-sm transition-colors hover:bg-brand-black hover:text-white">Back to dashboard</Link></PageHeading>
      <div className="mb-6 flex flex-wrap items-center gap-3"><StatusBadge status={matter.status} /><span className="text-sm capitalize text-muted">{matter.urgency} urgency</span><span className="text-sm text-muted">Submitted {formatDateTime(matter.createdAt)}</span></div>
      <section className="border-y border-line py-5"><h2 className="text-lg font-medium">Matter details</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{matter.description}</p>{matter.opposingParty && <p className="mt-3 text-sm"><span className="text-muted">Opposing party:</span> {matter.opposingParty}</p>}</section>
      <section className="mt-8"><h2 className="mb-4 text-lg font-medium">Status history</h2><ol className="border-l border-line pl-5">{matter.statusHistory.map((entry, index) => <li key={`${entry.at}-${index}`} className="relative pb-5"><span className="absolute -left-[1.55rem] top-1 h-2.5 w-2.5 rounded-full bg-brand-red" /><p className="text-sm font-medium capitalize">{entry.status.replaceAll("-", " ")}</p><p className="mt-1 text-xs text-muted">{formatDateTime(entry.at)}</p></li>)}</ol></section>
      <section className="mt-6"><h2 className="mb-3 text-lg font-medium">Updates from the firm</h2>{matter.updates.length ? <ul className="divide-y divide-line border-y border-line">{matter.updates.map((item) => <li key={item.id} className="py-4"><p className="whitespace-pre-wrap text-sm">{item.text}</p><p className="mt-2 text-xs text-muted">{item.authorName} · {formatDateTime(item.createdAt)}</p></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No updates yet.</p>}</section>
      <section className="mt-6"><h2 className="mb-3 text-lg font-medium">Documents</h2>{userDocuments.length ? <ul className="divide-y divide-line border-y border-line">{userDocuments.map((document) => <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{document.originalName}{document.uploadedBy === "firm" && <span className="ml-2 border border-line px-2 py-0.5 text-xs text-muted">From firm</span>}</p><p className="mt-1 text-xs text-muted">{formatDateTime(document.uploadedAt)}</p></div><a href={`/api/documents/${document.id}`} className="min-h-11 inline-flex items-center text-sm font-medium text-brand-red hover:text-brand-red-dark">Download</a></li>)}</ul> : <p className="border-t border-line py-4 text-sm text-muted">No documents linked to this matter.</p>}</section>
    </>
  );
}
