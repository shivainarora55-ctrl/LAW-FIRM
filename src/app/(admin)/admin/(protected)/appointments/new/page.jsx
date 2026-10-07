import { redirect } from "next/navigation";
import { matters, users } from "@/lib/storage";
import AppointmentForm from "@/components/admin/AppointmentForm/AppointmentForm";
import PageHeading from "@/components/portal/PageHeading/PageHeading";

export const metadata = { title: "New Appointment" };

export default async function NewAppointmentPage({ searchParams }) {
  const query = await searchParams;
  const [clients, allMatters] = await Promise.all([users.listAll(), matters.listAll()]);
  const clientId = typeof query.clientId === "string" && clients.some((client) => client.id === query.clientId) ? query.clientId : "";
  const matterId = typeof query.matterId === "string" && allMatters.some((matter) => matter.id === query.matterId && matter.userId === clientId) ? query.matterId : "";
  if (query.clientId && !clientId) redirect("/admin/appointments/new");
  return <><PageHeading title="Schedule appointment" description="Times are entered in the firm timezone, Asia/Kolkata." /><AppointmentForm clients={clients} matters={allMatters} initialClientId={clientId} initialMatterId={matterId} /></>;
}
