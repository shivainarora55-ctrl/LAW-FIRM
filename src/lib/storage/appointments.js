import "server-only";
import { randomUUID } from "node:crypto";
import { readJson, updateJson } from "./jsonFile";

const FILE = "appointments.json";

export async function listAll() {
  return (await readJson(FILE)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function listForClient(clientId) {
  return (await readJson(FILE)).filter((item) => item.clientId === clientId).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function findById(id) {
  return (await readJson(FILE)).find((item) => item.id === id) ?? null;
}

export function create(input) {
  return updateJson(FILE, [], (records) => {
    const now = new Date().toISOString();
    const record = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
    return { data: [...records, record], result: record };
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
