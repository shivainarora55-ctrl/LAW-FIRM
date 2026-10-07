import "server-only";
import { randomUUID } from "node:crypto";
import { readJson, updateJson } from "./jsonFile";

const FILE = "documents.json";

export function normalizeDocument(document) {
  return {
    ...document,
    uploadedBy: document.uploadedBy ?? "client",
    uploadedByAdminId: document.uploadedByAdminId ?? null,
    sharedWithClient: document.sharedWithClient ?? true,
  };
}

export async function listAll() {
  return (await readJson(FILE)).map(normalizeDocument).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function listDocumentsForUser(userId) {
  const documents = await readJson(FILE);
  return documents.filter((document) => document.userId === userId && (document.uploadedBy !== "firm" || document.sharedWithClient !== false)).map(normalizeDocument).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function countDocumentsForUser(userId) {
  const documents = await readJson(FILE);
  return documents.filter((document) => document.userId === userId).length;
}

export async function findDocumentForUser(id, userId) {
  const documents = await readJson(FILE);
  const document = documents.find((entry) => entry.id === id && entry.userId === userId);
  return document ? normalizeDocument(document) : null;
}

export async function findById(id) {
  const document = (await readJson(FILE)).find((entry) => entry.id === id);
  return document ? normalizeDocument(document) : null;
}

export function createDocument(input, maximumCount = Number.POSITIVE_INFINITY) {
  return updateJson(FILE, [], (documents) => {
    if (documents.filter((document) => document.userId === input.userId).length >= maximumCount) {
      return { data: documents, result: null };
    }
    const document = normalizeDocument({ id: randomUUID(), ...input, uploadedAt: new Date().toISOString() });
    return { data: [...documents, document], result: document };
  });
}

export function update(id, patchFn) {
  return updateJson(FILE, [], async (records) => {
    let updated = null;
    const nextRecords = await Promise.all(records.map(async (record) => {
      if (record.id !== id) return record;
      updated = normalizeDocument(await patchFn(normalizeDocument(record)));
      return updated;
    }));
    return { data: nextRecords, result: updated };
  });
}

export function deleteDocumentForUser(id, userId) {
  return updateJson(FILE, [], (documents) => {
    const document = documents.find((entry) => entry.id === id && entry.userId === userId) ?? null;
    return { data: documents.filter((entry) => entry.id !== id || entry.userId !== userId), result: document };
  });
}
