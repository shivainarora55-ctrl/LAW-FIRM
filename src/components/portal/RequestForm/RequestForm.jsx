"use client";

import { useActionState } from "react";
import { REQUEST_TYPES } from "@/constants/portal";
import { submitRequest } from "@/actions/portal";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function RequestForm({ matters }) {
  const [state, action] = useActionState(submitRequest, null);
  return (
    <form action={action} className="max-w-3xl space-y-5">
      <ActionFeedback state={state} />
      <FormField label="Request type" name="type" as="select" required error={state?.errors?.type}>
        <option value="">Select a request</option>
        {REQUEST_TYPES.map((type) => <option key={type} value={type}>{type.replace(/^./, (letter) => letter.toUpperCase())}</option>)}
      </FormField>
      <FormField label="Related matter (optional)" name="matterId" as="select" error={state?.errors?.matterId}>
        <option value="">Not related to a specific matter</option>
        {matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.ref} · {matter.title}</option>)}
      </FormField>
      <FormField label="Message" name="message" as="textarea" rows={5} minLength={10} maxLength={1000} required error={state?.errors?.message} />
      <SubmitButton pendingText="Sending request...">Send request</SubmitButton>
    </form>
  );
}
