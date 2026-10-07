export default function SearchForm({ action, initialQuery = "", placeholder = "Search", children }) {
  return (
    <form action={action} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="min-w-0 flex-1"><span className="block text-sm font-medium">{placeholder}</span><input type="search" name="q" defaultValue={initialQuery} className="mt-1.5 min-h-11 w-full border border-line bg-white px-3 py-2 outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" /></label>
      {children}
      <button type="submit" className="min-h-11 shrink-0 bg-brand-black px-5 text-sm font-medium text-white transition-colors hover:bg-brand-red active:bg-brand-red-dark">Search</button>
    </form>
  );
}
