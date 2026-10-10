import "server-only";
import { randomUUID } from "node:crypto";
import { db, execute, mapNote } from "./shared";

export async function listAll() {
  return (await execute(db().from("notes").select("*"), "notes.listAll")).map(mapNote).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listForClient(clientId) {
  return (await execute(db().from("notes").select("*").eq("client_id", clientId), "notes.listForClient")).map(mapNote).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function create(input) {
  const row = await execute(db().from("notes").insert({ id: randomUUID(), client_id: input.clientId, matter_id: input.matterId ?? null, admin_id: input.adminId ?? null, text: input.text }).select("*").single(), "notes.create");
  return mapNote(row);
}

export async function update(id, patchFn) {
  const rows = await execute(db().from("notes").select("*").eq("id", id).limit(1), "notes.update.read");
  if (!rows[0]) return null;
  const current = mapNote(rows[0]);
  const updated = await patchFn({ ...current });
  const result = await execute(db().from("notes").update({ client_id: updated.clientId, matter_id: updated.matterId ?? null, admin_id: updated.adminId ?? null, text: updated.text }).eq("id", id).select("*"), "notes.update");
  return result[0] ? mapNote(result[0]) : null;
}
