import Link from "next/link";
import { notFound } from "next/navigation";
import { appointments, matters, users } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";
import PageHeading from "@/components/portal/PageHeading/PageHeading";
import AppointmentStatusForm from "@/components/admin/AppointmentStatusForm/AppointmentStatusForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: await appointments.findById(id) ? "Appointment" : "Appointment" };
}

export default async function AppointmentDetailPage({ params }) {
  const { id } = await params;
  const appointment = await appointments.findById(id);
  if (!appointment) notFound();
  const [client, matter] = await Promise.all([users.findUserById(appointment.clientId), appointment.matterId ? matters.findById(appointment.matterId) : null]);
  return (
    <>
      <PageHeading title="Appointment" description={`${formatDateTime(appointment.startsAt)} · ${appointment.durationMin} minutes`}><Link href="/admin/appointments" className="min-h-11 inline-flex items-center border border-brand-black px-4 text-sm transition-colors hover:bg-brand-black hover:text-white">Back to appointments</Link></PageHeading>
      <div className="grid gap-9 xl:grid-cols-[minmax(0,1fr)_22rem]"><section className="space-y-4 border-y border-line py-5 text-sm"><p><span className="text-muted">Client:</span> {client?.name ?? "Client"} · {client?.email ?? ""}</p><p><span className="text-muted">Matter:</span> {matter ? <Link className="text-brand-red hover:text-brand-red-dark" href={`/admin/matters/${matter.id}`}>{matter.ref} · {matter.title}</Link> : "None"}</p><p className="capitalize"><span className="text-muted">Mode:</span> {appointment.mode}</p>{appointment.location && <p><span className="text-muted">Location or link:</span> {appointment.location}</p>}{appointment.notes && <p className="whitespace-pre-wrap"><span className="text-muted">Notes:</span> {appointment.notes}</p>}</section><section><h2 className="mb-3 text-lg font-medium">Update status</h2><AppointmentStatusForm appointment={appointment} /></section></div>
    </>
  );
}
