"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/portal";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function ProfileForm({ user }) {
  const [state, action] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-5">
      <ActionFeedback state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" name="name" defaultValue={user.name} autoComplete="name" required error={state?.errors?.name} />
        <FormField label="Phone" name="phone" type="tel" defaultValue={user.phone} autoComplete="tel" required error={state?.errors?.phone} />
        <FormField label="Address" name="address" defaultValue={user.address} autoComplete="street-address" error={state?.errors?.address} />
        <FormField label="City" name="city" defaultValue={user.city} autoComplete="address-level2" error={state?.errors?.city} />
        <FormField label="State" name="state" defaultValue={user.state} autoComplete="address-level1" error={state?.errors?.state} />
      </div>
      <div className="border-t border-line pt-5">
        <p className="text-sm font-medium">Email address</p>
        <p className="mt-1 text-sm text-muted">{user.email} <span className="ml-2 border border-line px-2 py-0.5 text-xs text-brand-black">Verified</span></p>
      </div>
      <SubmitButton pendingText="Saving changes...">Save profile</SubmitButton>
    </form>
  );
}
