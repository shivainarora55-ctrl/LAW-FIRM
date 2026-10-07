"use client";

import { useActionState } from "react";
import { REQUEST_STATUSES } from "@/constants/admin";
import { replyToRequest } from "@/actions/admin";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function RequestReplyForm({ request }) {
  const [state, action] = useActionState(replyToRequest, null);
  return (
    <form action={action} className="space-y-4 border border-line p-4 sm:p-5">
      <ActionFeedback state={state} />
      <input type="hidden" name="requestId" value={request.id} />
      <FormField label="Request status" name="status" as="select" defaultValue={request.status} required>{REQUEST_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("-", " ")}</option>)}</FormField>
      <FormField label="Reply to client (optional)" name="reply" as="textarea" rows={4} maxLength={2000} error={state?.errors?.reply} />
      <SubmitButton pendingText="Saving reply...">Save response</SubmitButton>
    </form>
  );
}
