import Link from "next/link";
import { notFound } from "next/navigation";
import { matters, requests, users } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";
import PageHeading from "@/components/portal/PageHeading/PageHeading";
import StatusBadge from "@/components/portal/StatusBadge/StatusBadge";
import RequestReplyForm from "@/components/admin/RequestReplyForm/RequestReplyForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const request = await requests.findById(id);
  return { title: request ? `Request ${request.type}` : "Request" };
}

export default async function AdminRequestDetail({ params }) {
  const { id } = await params;
  const request = await requests.findById(id);
  if (!request) notFound();
  const [client, matter] = await Promise.all([users.findUserById(request.userId), request.matterId ? matters.findById(request.matterId) : null]);
  return (
    <>
      <PageHeading eyebrow="Client request" title={request.type.replace(/^./, (letter) => letter.toUpperCase())} description={client ? `${client.name} · ${client.email} · ${formatDateTime(request.createdAt)}` : formatDateTime(request.createdAt)}><Link href="/admin/requests" className="min-h-11 inline-flex items-center border border-brand-black px-4 text-sm transition-colors hover:bg-brand-black hover:text-white">Back to requests</Link></PageHeading>
      <div className="grid gap-9 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section><div className="mb-5 flex items-center gap-3"><StatusBadge status={request.status} />{matter && <Link href={`/admin/matters/${matter.id}`} className="text-sm text-brand-red hover:text-brand-red-dark">{matter.ref} · {matter.title}</Link>}</div><div className="whitespace-pre-wrap border-y border-line py-5 text-sm leading-relaxed">{request.message}</div><h2 className="mt-8 text-lg font-medium">Conversation</h2>{request.replies.length ? <ul className="mt-3 divide-y divide-line border-y border-line">{request.replies.map((reply) => <li key={reply.id} className="py-4"><p className="whitespace-pre-wrap text-sm">{reply.text}</p><p className="mt-2 text-xs text-muted">{reply.authorName} · {formatDateTime(reply.createdAt)}</p></li>)}</ul> : <p className="mt-3 text-sm text-muted">No replies yet.</p>}</section>
        <section><h2 className="mb-3 text-lg font-medium">Respond</h2><RequestReplyForm request={request} />{request.type === "consultation" && <Link href={`/admin/appointments/new?clientId=${request.userId}${request.matterId ? `&matterId=${request.matterId}` : ""}`} className="mt-4 inline-flex min-h-11 items-center bg-brand-black px-4 text-sm font-medium text-white transition-colors hover:bg-brand-red">Schedule appointment</Link>}</section>
      </div>
    </>
  );
}
