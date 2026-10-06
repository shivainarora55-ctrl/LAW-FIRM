export default function InfoBlock({ title, items, className = "" }) {
  return (
    <div className={`rounded-lg border border-line bg-white p-6 sm:p-8 ${className}`}>
      <h2 className="border-l-4 border-brand-red pl-3 text-2xl font-bold">{title}</h2>
      <ul className="mt-5 space-y-3 text-muted">
        {items.map((text) => (
          <li key={text} className="flex gap-3">
            <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand-red" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
