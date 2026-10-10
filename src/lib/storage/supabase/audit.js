import "server-only";
import { randomUUID } from "node:crypto";
import { db, execute } from "./shared";

function mapAudit(row) {
  return { id: row.id, adminId: row.admin_id, action: row.action, entity: row.entity, entityId: row.entity_id, at: row.at };
}

export async function record(input) {
  const row = await execute(db().from("audit_log").insert({ id: randomUUID(), admin_id: input.adminId ?? null, action: input.action, entity: input.entity, entity_id: input.entityId ?? null }).select("*").single(), "audit.record");
  return mapAudit(row);
}

export async function listRecent(limit = 20) {
  return (await execute(db().from("audit_log").select("*").order("at", { ascending: false }).limit(limit), "audit.listRecent")).map(mapAudit);
}

export async function update(id, patchFn) {
  const rows = await execute(db().from("audit_log").select("*").eq("id", id).limit(1), "audit.update.read");
  if (!rows[0]) return null;
  const updated = await patchFn(mapAudit(rows[0]));
  const result = await execute(db().from("audit_log").update({ admin_id: updated.adminId ?? null, action: updated.action, entity: updated.entity, entity_id: updated.entityId ?? null, at: updated.at }).eq("id", id).select("*"), "audit.update");
  return result[0] ? mapAudit(result[0]) : null;
}
