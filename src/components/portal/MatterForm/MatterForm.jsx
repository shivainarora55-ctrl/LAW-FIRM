"use client";

import { useActionState } from "react";
import Link from "next/link";
import { EXPERTISE } from "@/constants/expertise";
import { PREFERRED_CONTACT_OPTIONS, URGENCY_OPTIONS } from "@/constants/portal";
import { submitMatter } from "@/actions/portal";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function MatterForm() {
  const [state, action] = useActionState(submitMatter, null);
  if (state?.ok && state.reference) {
    return <div role="status" className="border-l-4 border-brand-red bg-soft-gray p-5 sm:p-6"><h2 className="text-xl font-medium">Matter submitted</h2><p className="mt-2 text-sm text-muted">Your reference number is <strong className="text-brand-black">{state.reference}</strong>.</p><p className="mt-2 text-sm text-muted">{state.message}</p><div className="mt-4 flex flex-wrap gap-5 text-sm font-medium"><Link href="/portal" className="text-brand-red hover:text-brand-red-dark">View your matters</Link><Link href="/portal/documents" className="text-brand-red hover:text-brand-red-dark">Go to documents</Link></div></div>;
  }
  return (
    <form action={action} className="max-w-3xl space-y-5">
      <ActionFeedback state={state} />
      <FormField label="Matter title" name="title" minLength={5} maxLength={120} required error={state?.errors?.title} />
      <FormField label="Practice area" name="practiceArea" as="select" required error={state?.errors?.practiceArea}>
        <option value="">Select an area</option>
        {EXPERTISE.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
      </FormField>
      <FormField label="Brief description" name="description" as="textarea" rows={6} minLength={20} maxLength={3000} required error={state?.errors?.description} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Urgency" name="urgency" as="select" required error={state?.errors?.urgency}>
          {URGENCY_OPTIONS.map((option) => <option key={option} value={option}>{option === "normal" ? "Normal" : "Urgent"}</option>)}
        </FormField>
        <FormField label="Preferred contact" name="preferredContact" as="select" required error={state?.errors?.preferredContact}>
          {PREFERRED_CONTACT_OPTIONS.map((option) => <option key={option} value={option}>{option === "phone" ? "Phone" : "Email"}</option>)}
        </FormField>
      </div>
      <FormField label="Opposing party (optional)" name="opposingParty" maxLength={160} error={state?.errors?.opposingParty} />
      <SubmitButton pendingText="Submitting matter...">Submit matter</SubmitButton>
    </form>
  );
}
