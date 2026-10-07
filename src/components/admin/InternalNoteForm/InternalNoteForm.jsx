"use client";

import { useActionState } from "react";
import { addInternalNote } from "@/actions/admin";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function InternalNoteForm({ clientId, matterId = "" }) {
  const [state, action] = useActionState(addInternalNote, null);
  return (
    <form action={action} className="space-y-4 border border-line p-4 sm:p-5">
      <ActionFeedback state={state} />
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="matterId" value={matterId} />
      <FormField label="Internal note (lawyers only)" name="text" as="textarea" rows={4} minLength={2} maxLength={3000} required error={state?.errors?.text} />
      <SubmitButton pendingText="Saving note...">Add note</SubmitButton>
    </form>
  );
}
