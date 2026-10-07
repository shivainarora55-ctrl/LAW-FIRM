export default function AuthFormMessage({ message, errors = {} }) {
  const fieldMessages = Object.values(errors).filter(Boolean);
  if (!message && fieldMessages.length === 0) return null;
  return (
    <div aria-live="polite" className="mb-5 border-l-4 border-brand-red bg-soft-gray px-4 py-3 text-sm text-brand-black">
      {message && <p>{message}</p>}
      {fieldMessages.length > 0 && (
        <ul className="mt-1 space-y-1">
          {fieldMessages.map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}
        </ul>
      )}
    </div>
  );
}
