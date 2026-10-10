import "server-only";
import { randomUUID } from "node:crypto";
import { db, execute, mapDocument, documentRow } from "./shared";

export function normalizeDocument(document) {
  return { ...document, uploadedBy: document.uploadedBy ?? "client", uploadedByAdminId: document.uploadedByAdminId ?? null, sharedWithClient: document.sharedWithClient ?? true };
}

export async function listAll() {
  return (await execute(db().from("documents").select("*"), "documents.listAll")).map(mapDocument).map(normalizeDocument).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function listDocumentsForUser(userId) {
  const rows = await execute(db().from("documents").select("*").eq("user_id", userId).or("uploaded_by.eq.client,shared_with_client.eq.true"), "documents.listDocumentsForUser");
  return rows.map(mapDocument).map(normalizeDocument).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function countDocumentsForUser(userId) {
  const rows = await execute(db().from("documents").select("id").eq("user_id", userId), "documents.countDocumentsForUser");
  return rows.length;
}

export async function findDocumentForUser(id, userId) {
  const rows = await execute(db().from("documents").select("*").eq("id", id).eq("user_id", userId).limit(1), "documents.findDocumentForUser");
  return rows[0] ? normalizeDocument(mapDocument(rows[0])) : null;
}

export async function findById(id) {
  const rows = await execute(db().from("documents").select("*").eq("id", id).limit(1), "documents.findById");
  return rows[0] ? normalizeDocument(mapDocument(rows[0])) : null;
}

export async function createDocument(input, maximumCount = Number.POSITIVE_INFINITY) {
  if (Number.isFinite(maximumCount) && await countDocumentsForUser(input.userId) >= maximumCount) return null;
  const row = await execute(db().from("documents").insert({ id: input.id ?? randomUUID(), ...documentRow(input) }).select("*").single(), "documents.createDocument");
  return normalizeDocument(mapDocument(row));
}

export async function update(id, patchFn) {
  const current = await findById(id);
  if (!current) return null;
  const updated = normalizeDocument(await patchFn({ ...current }));
  const rows = await execute(db().from("documents").update(documentRow(updated)).eq("id", id).select("*"), "documents.update");
  return rows[0] ? normalizeDocument(mapDocument(rows[0])) : null;
}

export async function deleteDocumentForUser(id, userId) {
  const rows = await execute(db().from("documents").delete().eq("id", id).eq("user_id", userId).select("*"), "documents.deleteDocumentForUser");
  return rows[0] ? normalizeDocument(mapDocument(rows[0])) : null;
}
