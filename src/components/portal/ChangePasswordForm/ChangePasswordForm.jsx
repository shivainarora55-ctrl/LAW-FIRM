"use client";

import { useActionState } from "react";
import { changePassword } from "@/actions/portal";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, null);
  return (
    <form action={action} className="max-w-xl space-y-5">
      <ActionFeedback state={state} />
      <FormField label="Current password" name="currentPassword" type="password" autoComplete="current-password" required error={state?.errors?.currentPassword} />
      <FormField label="New password" name="newPassword" type="password" autoComplete="new-password" required error={state?.errors?.newPassword} />
      <p className="text-xs text-muted">At least 8 characters, including a letter and a number.</p>
      <SubmitButton pendingText="Changing password...">Change password</SubmitButton>
    </form>
  );
}
