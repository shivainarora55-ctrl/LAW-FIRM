"use client";

import { useActionState } from "react";
import { APPOINTMENT_STATUSES } from "@/constants/admin";
import { updateAppointment } from "@/actions/admin";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import ActionFeedback from "@/components/forms/ActionFeedback/ActionFeedback";

export default function AppointmentStatusForm({ appointment }) {
  const [state, action] = useActionState(updateAppointment, null);
  return <form action={action} className="space-y-4 border border-line p-5"><ActionFeedback state={state} /><input type="hidden" name="appointmentId" value={appointment.id} /><label className="block text-sm font-medium">Appointment status<select name="status" defaultValue={appointment.status} className="mt-1.5 min-h-11 w-full border border-line bg-white px-3">{APPOINTMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><SubmitButton pendingText="Saving...">Update appointment</SubmitButton></form>;
}
