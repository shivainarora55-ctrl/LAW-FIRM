"use client";

export default function AdminError({ reset }) {
  return (
    <div role="alert" className="border-l-4 border-brand-red bg-soft-gray p-5">
      <h2 className="font-medium">The staff portal could not load</h2>
      <p className="mt-2 text-sm text-muted">Please try again. If the problem continues, contact your system administrator.</p>
      <button type="button" onClick={reset} className="mt-4 min-h-11 border border-brand-black px-4 text-sm font-medium transition-colors hover:bg-brand-black hover:text-white">Try again</button>
    </div>
  );
}
