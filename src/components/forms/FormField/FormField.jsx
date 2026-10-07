export default function FormField({ label, name, type = "text", error, required = false, as = "input", children, ...props }) {
  const controlClass = "mt-1.5 min-h-11 w-full border border-line bg-white px-3 py-2 text-brand-black outline-none transition focus:border-brand-red focus:ring-1 focus:ring-brand-red";
  const describedBy = error ? `${name}-error` : undefined;
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">{label}{required && <span aria-hidden="true"> *</span>}</label>
      {as === "textarea" ? (
        <textarea id={name} name={name} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={controlClass} {...props}>{children}</textarea>
      ) : as === "select" ? (
        <select id={name} name={name} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={controlClass} {...props}>{children}</select>
      ) : (
        <input id={name} name={name} type={type} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={controlClass} {...props} />
      )}
      {error && <p id={describedBy} className="mt-1 text-sm text-brand-red" aria-live="polite">{error}</p>}
    </div>
  );
}
