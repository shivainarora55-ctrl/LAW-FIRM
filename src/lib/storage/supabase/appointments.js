import "server-only";
import { db, execute, mapAppointment, appointmentRow } from "./shared";

export async function listAll() {
  return (await execute(db().from("appointments").select("*"), "appointments.listAll")).map(mapAppointment).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function listForClient(clientId) {
  return (await execute(db().from("appointments").select("*").eq("client_id", clientId), "appointments.listForClient")).map(mapAppointment).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function findById(id) {
  const rows = await execute(db().from("appointments").select("*").eq("id", id).limit(1), "appointments.findById");
  return rows[0] ? mapAppointment(rows[0]) : null;
}

export async function create(input) {
  const now = new Date().toISOString();
  const row = await execute(db().from("appointments").insert(appointmentRow({ ...input, createdAt: input.createdAt ?? now, updatedAt: input.updatedAt ?? now })).select("*").single(), "appointments.create");
  return mapAppointment(row);
}

export async function update(id, patchFn) {
  const current = await findById(id);
  if (!current) return null;
  const updated = await patchFn({ ...current });
  const rows = await execute(db().from("appointments").update(appointmentRow(updated)).eq("id", id).select("*"), "appointments.update");
  return rows[0] ? mapAppointment(rows[0]) : null;
}
