import "server-only";
import { randomUUID } from "node:crypto";
import { db, execute, mapMatter, matterRow } from "./shared";

async function readMatter(id) {
  const rows = await execute(db().from("matters").select("*").eq("id", id).limit(1), "matters.findById");
  if (!rows[0]) return null;
  const [history, updates] = await Promise.all([
    execute(db().from("matter_status_history").select("*").eq("matter_id", id).order("at", { ascending: true }), "matters.history"),
    execute(db().from("matter_updates").select("*").eq("matter_id", id).order("created_at", { ascending: true }), "matters.updates"),
  ]);
  return mapMatter(rows[0], history, updates);
}

async function readMatters(query, operation) {
  const rows = await execute(query, operation);
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const [history, updates] = await Promise.all([
    execute(db().from("matter_status_history").select("*").in("matter_id", ids).order("at", { ascending: true }), `${operation}.history`),
    execute(db().from("matter_updates").select("*").in("matter_id", ids).order("created_at", { ascending: true }), `${operation}.updates`),
  ]);
  return rows.map((row) => mapMatter(row, history.filter((item) => item.matter_id === row.id), updates.filter((item) => item.matter_id === row.id)));
}

export async function listAll() {
  return (await readMatters(db().from("matters").select("*"), "matters.listAll")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listMattersForUser(userId) {
  return (await readMatters(db().from("matters").select("*").eq("user_id", userId), "matters.listMattersForUser")).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findMatterForUser(id, userId) {
  const matter = await readMatter(id);
  return matter?.userId === userId ? matter : null;
}

export const findById = readMatter;

export async function createMatter(input) {
  const row = await execute(db().from("matters").insert(matterRow({ ...input, status: "submitted", assignedTo: null })).select("*").single(), "matters.createMatter");
  const initialHistory = { id: randomUUID(), matter_id: row.id, status: "submitted", admin_id: null };
  try {
    const history = await execute(db().from("matter_status_history").insert(initialHistory).select("*").single(), "matters.createMatter.history");
    return mapMatter(row, [history], []);
  } catch (error) {
    await execute(db().from("matters").delete().eq("id", row.id), "matters.createMatter.rollback").catch(() => {});
    throw error;
  }
}

export async function update(id, patchFn) {
  const current = await readMatter(id);
  if (!current) return null;
  const updated = await patchFn({ ...current, statusHistory: [...current.statusHistory], updates: [...current.updates] });
  const addedHistory = (updated.statusHistory ?? []).slice(current.statusHistory.length);
  const currentUpdateIds = new Set(current.updates.map((item) => item.id));
  const addedUpdates = (updated.updates ?? []).filter((item) => !currentUpdateIds.has(item.id));
  const insertedHistory = [];
  const insertedUpdates = [];
  try {
    for (const item of addedHistory) {
      const row = await execute(db().from("matter_status_history").insert({ matter_id: id, status: item.status, admin_id: item.adminId ?? null, ...(item.at ? { at: item.at } : {}) }).select("id").single(), "matters.update.history");
      insertedHistory.push(row.id);
    }
    for (const item of addedUpdates) {
      const row = await execute(db().from("matter_updates").insert({ id: item.id || randomUUID(), matter_id: id, text: item.text, author_name: item.authorName, ...(item.createdAt ? { created_at: item.createdAt } : {}) }).select("id").single(), "matters.update.update");
      insertedUpdates.push(row.id);
    }
    const rows = await execute(db().from("matters").update(matterRow(updated)).eq("id", id).select("*"), "matters.update");
    if (!rows[0]) throw new Error("Storage operation failed. Please try again.");
  } catch (error) {
    if (insertedHistory.length) await execute(db().from("matter_status_history").delete().in("id", insertedHistory), "matters.update.rollback.history").catch(() => {});
    if (insertedUpdates.length) await execute(db().from("matter_updates").delete().in("id", insertedUpdates), "matters.update.rollback.updates").catch(() => {});
    throw error;
  }
  return readMatter(id);
}
