import PageHeading from "@/components/portal/PageHeading/PageHeading";
import RequestForm from "@/components/portal/RequestForm/RequestForm";
import StatusBadge from "@/components/portal/StatusBadge/StatusBadge";
import { requireUser } from "@/lib/auth";
import { matters, requests } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Requests" };

export default async function RequestsPage() {
  const user = await requireUser();
  const [userRequests, userMatters] = await Promise.all([
    requests.listRequestsForUser(user.id),
    matters.listMattersForUser(user.id),
  ]);
  const ownMatters = new Map(userMatters.map((matter) => [matter.id, matter]));
  return (
    <>
      <PageHeading title="Requests" description="Ask the office to contact you or follow up on a matter." />
      <section aria-labelledby="new-request-heading" className="mb-10"><h2 id="new-request-heading" className="mb-5 text-xl font-medium">New request</h2><RequestForm matters={userMatters.map(({ id, ref, title }) => ({ id, ref, title }))} /></section>
      <section aria-labelledby="request-history-heading" className="border-t border-line pt-7"><h2 id="request-history-heading" className="mb-4 text-xl font-medium">Request history</h2>
        {userRequests.length === 0 ? <p className="border-t border-line py-6 text-sm text-muted">You have not submitted a request.</p> : <ul className="divide-y divide-line border-y border-line">{userRequests.map((request) => { const matter = request.matterId ? ownMatters.get(request.matterId) : null; return <li key={request.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-medium capitalize">{request.type}</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted">{request.message}</p><p className="mt-2 text-xs text-muted">{matter ? `${matter.ref} · ${matter.title}` : "No related matter"} · {formatDateTime(request.createdAt)}</p>{request.replies.length > 0 && <ul className="mt-4 space-y-3 border-l-2 border-brand-red pl-4">{request.replies.map((reply) => <li key={reply.id}><p className="whitespace-pre-wrap text-sm">{reply.text}</p><p className="mt-1 text-xs text-muted">{reply.authorName} · {formatDateTime(reply.createdAt)}</p></li>)}</ul>}</div><StatusBadge status={request.status} /></li>; })}</ul>}
      </section>
    </>
  );
}
