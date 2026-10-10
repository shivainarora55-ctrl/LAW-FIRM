import "server-only";
import { db, execute, mapAdmin, adminRow } from "./shared";

function publicAdmin(admin) {
  if (!admin) return null;
  const result = { ...admin };
  delete result.passwordHash;
  return result;
}

export async function list() {
  return (await execute(db().from("admins").select("*"), "admins.list")).map(mapAdmin).map(publicAdmin);
}

export async function findById(id) {
  const rows = await execute(db().from("admins").select("*").eq("id", id).limit(1), "admins.findById");
  return publicAdmin(mapAdmin(rows[0]));
}

export async function findAuthByEmail(email) {
  const rows = await execute(db().from("admins").select("*").ilike("email", email.trim().toLowerCase()).limit(1), "admins.findAuthByEmail");
  const admin = mapAdmin(rows[0]);
  return admin ? { id: admin.id, name: admin.name, email: admin.email, role: admin.role, passwordHash: admin.passwordHash } : null;
}

export async function update(id, patchFn) {
  const rows = await execute(db().from("admins").select("*").eq("id", id).limit(1), "admins.update.read");
  if (!rows[0]) return null;
  const updated = await patchFn(mapAdmin(rows[0]));
  const result = await execute(db().from("admins").update(adminRow(updated)).eq("id", id).select("*"), "admins.update");
  return publicAdmin(mapAdmin(result[0]));
}
