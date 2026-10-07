export default function ActionFeedback({ state }) {
  if (!state?.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} aria-live="polite" className={`mb-4 border-l-4 px-4 py-3 text-sm ${state.ok ? "border-brand-black bg-soft-gray text-brand-black" : "border-brand-red bg-soft-gray text-brand-black"}`}>
      {state.message}
    </p>
  );
}
