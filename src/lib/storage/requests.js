import "server-only";
import { randomUUID } from "node:crypto";
import { readJson, updateJson } from "./jsonFile";

const FILE = "requests.json";

export function normalizeRequest(request) {
  return { ...request, status: request.status ?? "open", replies: Array.isArray(request.replies) ? request.replies : [] };
}

export async function listAll() {
  return (await readJson(FILE)).map(normalizeRequest).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listRequestsForUser(userId) {
  const requests = await readJson(FILE);
  return requests.filter((request) => request.userId === userId).map(normalizeRequest).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findById(id) {
  const request = (await readJson(FILE)).find((entry) => entry.id === id);
  return request ? normalizeRequest(request) : null;
}

export function createRequest(input) {
  return updateJson(FILE, [], (requests) => {
    const request = { id: randomUUID(), ...input, status: "open", replies: [], createdAt: new Date().toISOString() };
    return { data: [...requests, request], result: request };
  });
}

export function update(id, patchFn) {
  return updateJson(FILE, [], async (records) => {
    let updated = null;
    const nextRecords = await Promise.all(records.map(async (record) => {
      if (record.id !== id) return record;
      updated = normalizeRequest(await patchFn(normalizeRequest(record)));
      return updated;
    }));
    return { data: nextRecords, result: updated };
  });
}
