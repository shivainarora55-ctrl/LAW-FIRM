export default function PageHeading({ eyebrow = "Client portal", title, description, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-medium sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>}
      </div>
      {children}
    </div>
  );
}
