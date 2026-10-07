"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function RegistrationFlow() {
  const [state, action] = useActionState(register, null);
  return (
    <div>
      <form action={action} className="space-y-5">
        <ActionFeedback state={state} />
        <FormField label="Full name" name="name" autoComplete="name" required error={state?.errors?.name} />
        <FormField label="Email address" name="email" type="email" autoComplete="email" required error={state?.errors?.email} />
        <FormField label="Phone number" name="phone" type="tel" autoComplete="tel" required error={state?.errors?.phone} />
        <FormField label="Password" name="password" type="password" autoComplete="new-password" required error={state?.errors?.password} />
        <FormField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" required error={state?.errors?.confirmPassword} />
        <p className="text-xs text-muted">At least 8 characters, including a letter and a number.</p>
        <SubmitButton className="w-full" pendingText="Creating account...">Create account</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-muted">Already registered? <Link className="font-medium text-brand-red hover:text-brand-red-dark" href="/login">Log in</Link></p>
    </div>
  );
}
