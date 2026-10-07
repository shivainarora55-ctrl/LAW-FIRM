import "server-only";
import { randomUUID } from "node:crypto";
import { readJson, updateJson } from "./jsonFile";

const FILE = "audit.json";

export function record(input) {
  return updateJson(FILE, [], (records) => {
    const entry = { id: randomUUID(), ...input, at: new Date().toISOString() };
    return { data: [...records, entry], result: entry };
  });
}

export async function listRecent(limit = 20) {
  return (await readJson(FILE)).sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
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
