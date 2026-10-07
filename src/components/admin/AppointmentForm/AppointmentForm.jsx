"use client";

import { useActionState, useState } from "react";
import { APPOINTMENT_DURATIONS, APPOINTMENT_MODES } from "@/constants/admin";
import { createAppointment } from "@/actions/admin";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function AppointmentForm({ clients, matters, initialClientId = "", initialMatterId = "" }) {
  const [state, action] = useActionState(createAppointment, null);
  const [clientId, setClientId] = useState(initialClientId);
  const clientMatters = matters.filter((matter) => matter.userId === clientId);
  return (
    <form action={action} className="max-w-3xl space-y-5">
      <ActionFeedback state={state} />
      <FormField label="Client" name="clientId" as="select" defaultValue={initialClientId} required onChange={(event) => setClientId(event.target.value)}><option value="">Choose client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name} · {client.email}</option>)}</FormField>
      <FormField label="Related matter (optional)" name="matterId" as="select" defaultValue={initialMatterId}><option value="">No related matter</option>{clientMatters.map((matter) => <option key={matter.id} value={matter.id}>{matter.ref} · {matter.title}</option>)}</FormField>
      <div className="grid gap-5 sm:grid-cols-2"><FormField label="Date and time (office timezone)" name="startsAt" type="datetime-local" required error={state?.errors?.startsAt} /><FormField label="Duration" name="durationMin" as="select" required>{APPOINTMENT_DURATIONS.map((duration) => <option key={duration} value={duration}>{duration} minutes</option>)}</FormField></div>
      <FormField label="Mode" name="mode" as="select" required>{APPOINTMENT_MODES.map((mode) => <option key={mode} value={mode}>{mode.replace(/^./, (letter) => letter.toUpperCase())}</option>)}</FormField>
      <FormField label="Location or meeting link" name="location" maxLength={300} />
      <FormField label="Notes" name="notes" as="textarea" rows={4} maxLength={2000} />
      <SubmitButton pendingText="Scheduling...">Schedule appointment</SubmitButton>
    </form>
  );
}
