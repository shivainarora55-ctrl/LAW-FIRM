import "server-only";
import { randomUUID } from "node:crypto";
import { readJson, updateJson } from "./jsonFile";

const FILE = "matters.json";

export function normalizeMatter(matter) {
  return {
    ...matter,
    assignedTo: matter.assignedTo ?? null,
    statusHistory: Array.isArray(matter.statusHistory) ? matter.statusHistory : [{ status: matter.status ?? "submitted", at: matter.createdAt, adminId: null }],
    updates: Array.isArray(matter.updates) ? matter.updates : [],
  };
}

export async function listAll() {
  return (await readJson(FILE)).map(normalizeMatter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listMattersForUser(userId) {
  const matters = await readJson(FILE);
  return matters.filter((matter) => matter.userId === userId).map(normalizeMatter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findMatterForUser(id, userId) {
  const matters = await readJson(FILE);
  const matter = matters.find((entry) => entry.id === id && entry.userId === userId);
  return matter ? normalizeMatter(matter) : null;
}

export async function findById(id) {
  const matter = (await readJson(FILE)).find((entry) => entry.id === id);
  return matter ? normalizeMatter(matter) : null;
}

export function createMatter(input) {
  return updateJson(FILE, [], (matters) => {
    const year = new Date().getFullYear();
    const count = matters.filter((matter) => matter.ref.startsWith(`LF-${year}-`)).length + 1;
    const now = new Date().toISOString();
    const matter = {
      id: randomUUID(),
      ref: `LF-${year}-${String(count).padStart(4, "0")}`,
      ...input,
      status: "submitted",
      assignedTo: null,
      statusHistory: [{ status: "submitted", at: now, adminId: null }],
      updates: [],
      createdAt: now,
      updatedAt: now,
    };
    return { data: [...matters, matter], result: matter };
  });
}

export function update(id, patchFn) {
  return updateJson(FILE, [], async (records) => {
    let updated = null;
    const nextRecords = await Promise.all(records.map(async (record) => {
      if (record.id !== id) return record;
      updated = normalizeMatter(await patchFn(normalizeMatter(record)));
      return updated;
    }));
    return { data: nextRecords, result: updated };
  });
}
