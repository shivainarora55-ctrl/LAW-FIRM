"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function LoginForm() {
  const [state, action] = useActionState(login, null);
  return (
    <form action={action} className="space-y-5">
      <ActionFeedback state={state} />
      <FormField label="Email address" name="email" type="email" autoComplete="email" required error={state?.errors?.email} />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" required error={state?.errors?.password} />
      <SubmitButton className="w-full" pendingText="Signing in...">Log in</SubmitButton>
      <p className="text-sm text-muted">New to the client portal? <Link className="font-medium text-brand-red hover:text-brand-red-dark" href="/register">Register with email</Link></p>
    </form>
  );
}
