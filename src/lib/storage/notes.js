import "server-only";
import { randomUUID } from "node:crypto";
import { readJson, updateJson } from "./jsonFile";

const FILE = "notes.json";

export async function listAll() {
  return (await readJson(FILE)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listForClient(clientId) {
  return (await readJson(FILE)).filter((note) => note.clientId === clientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function create(input) {
  return updateJson(FILE, [], (records) => {
    const note = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
    return { data: [...records, note], result: note };
  });
}

export function update(id, patchFn) {
  return updateJson(FILE, [], async (records) => {
    let updated = null;
    const next = await Promise.all(records.map(async (record) => {
      if (record.id !== id) return record;
      updated = await patchFn({ ...record });
      return updated;
    }));
    return { data: next, result: updated };
  });
}
