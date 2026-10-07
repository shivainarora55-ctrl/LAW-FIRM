"use client";

import { useActionState } from "react";
import { adminLogin } from "@/actions/adminAuth";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function AdminLoginForm() {
  const [state, action] = useActionState(adminLogin, null);
  return (
    <form action={action} className="space-y-5">
      <ActionFeedback state={state} />
      <FormField label="Email address" name="email" type="email" autoComplete="username" required error={state?.errors?.email} />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" required error={state?.errors?.password} />
      <SubmitButton className="w-full" pendingText="Signing in...">Log in</SubmitButton>
    </form>
  );
}
