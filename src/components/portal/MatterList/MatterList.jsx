import Link from "next/link";
import StatusBadge from "@/components/portal/StatusBadge/StatusBadge";
import { EXPERTISE } from "@/constants/expertise";
import { formatDate } from "@/lib/format";

const practiceTitles = Object.fromEntries(EXPERTISE.map((item) => [item.slug, item.title]));

export default function MatterList({ matters }) {
  if (matters.length === 0) {
    return (
      <div className="border-t border-line py-8">
        <p className="text-muted">You have not submitted a matter yet.</p>
        <Link href="/portal/submit-matter" className="mt-4 inline-flex min-h-11 items-center bg-brand-black px-5 text-sm font-medium text-white transition-colors hover:bg-brand-red">Submit a matter</Link>
      </div>
    );
  }
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
          <thead><tr className="border-y border-line text-xs uppercase tracking-wide text-muted"><th className="py-3 pr-4 font-medium">Reference</th><th className="py-3 pr-4 font-medium">Matter</th><th className="py-3 pr-4 font-medium">Urgency</th><th className="py-3 pr-4 font-medium">Status</th><th className="py-3 font-medium">Submitted</th></tr></thead>
          <tbody>{matters.map((matter) => <tr key={matter.id} className="border-b border-line align-top"><td className="py-4 pr-4 font-medium"><Link href={`/portal/matters/${matter.id}`} className="text-brand-red hover:text-brand-red-dark">{matter.ref}</Link></td><td className="py-4 pr-4"><p className="font-medium"><Link href={`/portal/matters/${matter.id}`} className="hover:text-brand-red">{matter.title}</Link></p><p className="mt-1 text-xs text-muted">{practiceTitles[matter.practiceArea]}</p></td><td className="py-4 pr-4 capitalize">{matter.urgency}</td><td className="py-4 pr-4"><StatusBadge status={matter.status} /></td><td className="py-4 text-muted">{formatDate(matter.createdAt)}</td></tr>)}</tbody>
        </table>
      </div>
      <ul className="divide-y divide-line border-y border-line md:hidden">
        {matters.map((matter) => <li key={matter.id} className="py-4"><div className="flex items-start justify-between gap-3"><div><Link href={`/portal/matters/${matter.id}`} className="font-medium hover:text-brand-red">{matter.title}</Link><p className="mt-1 text-xs text-muted"><Link href={`/portal/matters/${matter.id}`} className="hover:text-brand-red">{matter.ref}</Link> · {practiceTitles[matter.practiceArea]}</p></div><StatusBadge status={matter.status} /></div><div className="mt-3 flex justify-between text-xs text-muted"><span className="capitalize">{matter.urgency} urgency</span><time dateTime={matter.createdAt}>{formatDate(matter.createdAt)}</time></div></li>)}
      </ul>
    </>
  );
}
