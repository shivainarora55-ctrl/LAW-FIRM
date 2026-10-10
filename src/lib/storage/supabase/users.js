import "server-only";
import { db, execute, mapUser, userRow } from "./shared";

export function toPublicUser(user) {
  if (!user) return null;
  const result = { ...user };
  delete result.passwordHash;
  return result;
}

export async function listAll() {
  return (await execute(db().from("users").select("*"), "users.listAll")).map(mapUser).map(toPublicUser).sort((a, b) => a.name.localeCompare(b.name));
}

export async function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  const rows = await execute(db().from("users").select("*").ilike("email", normalized).limit(1), "users.findUserByEmail");
  return toPublicUser(mapUser(rows[0]));
}

export async function getAuthRecordByEmail(email) {
  const normalized = email.trim().toLowerCase();
  const rows = await execute(db().from("users").select("id,email,password_hash,email_verified_at").ilike("email", normalized).limit(1), "users.getAuthRecordByEmail");
  const row = rows[0];
  return row ? { id: row.id, email: row.email, passwordHash: row.password_hash, emailVerifiedAt: row.email_verified_at } : null;
}

export async function getAuthRecordById(id) {
  const rows = await execute(db().from("users").select("id,email,password_hash").eq("id", id).limit(1), "users.getAuthRecordById");
  const row = rows[0];
  return row ? { id: row.id, email: row.email, passwordHash: row.password_hash } : null;
}

export async function findUserById(id) {
  const rows = await execute(db().from("users").select("*").eq("id", id).limit(1), "users.findUserById");
  return toPublicUser(mapUser(rows[0]));
}

export async function createUser(user) {
  try {
    const row = await execute(db().from("users").insert(userRow(user)).select("*").single(), "users.createUser");
    return { created: true, user: toPublicUser(mapUser(row)) };
  } catch (error) {
    if (error.message === "This record already exists.") return { created: false, user: null };
    throw error;
  }
}

export async function updateUser(id, changes) {
  return update(id, (user) => ({ ...user, ...changes, id: user.id, email: user.email, passwordHash: user.passwordHash }));
}

export async function update(id, patchFn) {
  const currentRows = await execute(db().from("users").select("*").eq("id", id).limit(1), "users.update.read");
  if (!currentRows[0]) return null;
  const current = mapUser(currentRows[0]);
  const updated = await patchFn({ ...current });
  const rows = await execute(db().from("users").update(userRow(updated)).eq("id", id).select("*"), "users.update");
  return toPublicUser(mapUser(rows[0]));
}

export async function updatePasswordHash(id, passwordHash) {
  return Boolean(await update(id, (user) => ({ ...user, passwordHash, updatedAt: new Date().toISOString() })));
}
