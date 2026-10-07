"use client";

import { useActionState } from "react";
import { MATTER_STATUSES } from "@/constants/admin";
import { updateMatterAdmin } from "@/actions/admin";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function MatterStatusForm({ matter, admins }) {
  const [state, action] = useActionState(updateMatterAdmin, null);
  return (
    <form action={action} className="space-y-4 border border-line p-4 sm:p-5">
      <ActionFeedback state={state} />
      <input type="hidden" name="matterId" value={matter.id} />
      <FormField label="Status" name="status" as="select" defaultValue={matter.status} required>
        {MATTER_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("-", " ")}</option>)}
      </FormField>
      <FormField label="Assigned lawyer" name="assignedTo" as="select" defaultValue={matter.assignedTo ?? ""}>
        <option value="">Unassigned</option>
        {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name}</option>)}
      </FormField>
      <FormField label="Client-visible update (optional)" name="updateText" as="textarea" rows={3} maxLength={2000} error={state?.errors?.updateText} />
      <SubmitButton pendingText="Saving matter...">Save matter</SubmitButton>
    </form>
  );
}
