export function fieldErrorsFromZod(error) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [field, messages?.[0] ?? "Invalid value."]),
  );
}
