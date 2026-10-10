import "server-only";
import { randomUUID } from "node:crypto";
import { db, execute, mapRequest, requestRow } from "./shared";

async function readRequest(id) {
  const rows = await execute(db().from("requests").select("*").eq("id", id).limit(1), "requests.findById");
  if (!rows[0]) return null;
  const replies = await execute(db().from("request_replies").select("*").eq("request_id", id).order("created_at", { ascending: true }), "requests.replies");
  return mapRequest(rows[0], replies);
}

export async function listAll() {
  const rows = await execute(db().from("requests").select("*"), "requests.listAll");
  const replies = await execute(db().from("request_replies").select("*"), "requests.listAll.replies");
  return rows.map((row) => mapRequest(row, replies.filter((reply) => reply.request_id === row.id))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listRequestsForUser(userId) {
  const rows = await execute(db().from("requests").select("*").eq("user_id", userId), "requests.listRequestsForUser");
  const replies = await execute(db().from("request_replies").select("*").in("request_id", rows.map((row) => row.id)), "requests.listRequestsForUser.replies");
  return rows.map((row) => mapRequest(row, replies.filter((reply) => reply.request_id === row.id))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const findById = readRequest;

export async function createRequest(input) {
  const row = await execute(db().from("requests").insert({ ...requestRow(input), status: "open" }).select("*").single(), "requests.createRequest");
  return mapRequest(row, []);
}

export async function update(id, patchFn) {
  const current = await readRequest(id);
  if (!current) return null;
  const updated = await patchFn({ ...current, replies: [...current.replies] });
  const currentReplyIds = new Set(current.replies.map((reply) => reply.id));
  const newReplies = (updated.replies ?? []).filter((reply) => !currentReplyIds.has(reply.id));
  const inserted = [];
  try {
    for (const reply of newReplies) {
      const row = await execute(db().from("request_replies").insert({ id: reply.id || randomUUID(), request_id: id, text: reply.text, author_name: reply.authorName, ...(reply.createdAt ? { created_at: reply.createdAt } : {}) }).select("id").single(), "requests.update.reply");
      inserted.push(row.id);
    }
    const rows = await execute(db().from("requests").update(requestRow(updated)).eq("id", id).select("*"), "requests.update");
    if (!rows[0]) throw new Error("Storage operation failed. Please try again.");
  } catch (error) {
    if (inserted.length) await execute(db().from("request_replies").delete().in("id", inserted), "requests.update.rollback").catch(() => {});
    throw error;
  }
  return readRequest(id);
}
