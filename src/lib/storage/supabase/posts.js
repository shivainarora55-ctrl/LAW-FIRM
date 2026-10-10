import "server-only";
import { connection } from "next/server";
import { randomUUID } from "node:crypto";
import { db, execute, mapDatabaseError, mapPost, postRow } from "./shared";

export async function listAll() {
  return (await execute(db().from("posts").select("*"), "posts.listAll")).map(mapPost).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listPublished({ offset = 0, limit = Number.POSITIVE_INFINITY } = {}) {
  if (limit <= 0) return [];
  const query = db().from("posts").select("*").eq("status", "published").not("published_at", "is", null).order("published_at", { ascending: false }).range(offset, Number.isFinite(limit) ? offset + limit - 1 : 999999);
  return (await execute(query, "posts.listPublished")).map(mapPost);
}

export async function countPublished() {
  const query = db().from("posts").select("id", { count: "exact", head: true }).eq("status", "published").not("published_at", "is", null);
  try {
    await connection();
    const { count, error } = await query;
    if (error) throw mapDatabaseError(error, "posts.countPublished");
    return count ?? 0;
  } catch (error) {
    if (["This record already exists.", "This time overlaps another appointment.", "The requested record could not be saved because a related record is unavailable.", "Storage operation failed. Please try again."].includes(error?.message)) throw error;
    console.error("Supabase storage operation failed", { operation: "posts.countPublished", code: typeof error?.code === "string" ? error.code : "network" });
    throw new Error("Storage operation failed. Please try again.");
  }
}

export async function findById(id) {
  const rows = await execute(db().from("posts").select("*").eq("id", id).limit(1), "posts.findById");
  return rows[0] ? mapPost(rows[0]) : null;
}

export async function findPublishedBySlug(slug) {
  const rows = await execute(db().from("posts").select("*").eq("slug", slug).eq("status", "published").not("published_at", "is", null).limit(1), "posts.findPublishedBySlug");
  return rows[0] ? mapPost(rows[0]) : null;
}

export async function create(input) {
  const now = new Date().toISOString();
  const row = await execute(db().from("posts").insert({ id: input.id ?? randomUUID(), ...postRow({ ...input, createdAt: input.createdAt ?? now, updatedAt: input.updatedAt ?? now }) }).select("*").single(), "posts.create");
  return mapPost(row);
}

export async function update(id, patchFn) {
  const current = await findById(id);
  if (!current) return null;
  const updated = await patchFn({ ...current });
  const rows = await execute(db().from("posts").update(postRow(updated)).eq("id", id).select("*"), "posts.update");
  return rows[0] ? mapPost(rows[0]) : null;
}

export async function remove(id) {
  const rows = await execute(db().from("posts").delete().eq("id", id).select("*"), "posts.remove");
  return rows[0] ? mapPost(rows[0]) : null;
}
