const STATUS_LABELS = {
  submitted: "Submitted",
  "under-review": "Under review",
  accepted: "Accepted",
  "in-progress": "In progress",
  "on-hold": "On hold",
  closed: "Closed",
  declined: "Declined",
  open: "Open",
  "in progress": "In progress",
  resolved: "Resolved",
};

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] ?? "Submitted";
  const isResolved = ["resolved", "closed", "declined"].includes(status);
  return <span className={`inline-flex items-center border px-2.5 py-1 text-xs font-medium ${isResolved ? "border-line bg-soft-gray text-muted" : "border-brand-red/30 bg-brand-red/5 text-brand-red"}`}>{label}</span>;
}
