import "server-only";
import { randomUUID } from "node:crypto";
import { readJson, updateJson } from "./jsonFile";

const FILE = "posts.json";

export async function listAll() {
  return (await readJson(FILE)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listPublished({ offset = 0, limit = Number.POSITIVE_INFINITY } = {}) {
  const posts = (await readJson(FILE)).filter((post) => post.status === "published" && post.publishedAt).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return posts.slice(offset, offset + limit);
}

export async function countPublished() {
  return (await readJson(FILE)).filter((post) => post.status === "published" && post.publishedAt).length;
}

export async function findById(id) {
  return (await readJson(FILE)).find((post) => post.id === id) ?? null;
}

export async function findPublishedBySlug(slug) {
  return (await readJson(FILE)).find((post) => post.slug === slug && post.status === "published" && post.publishedAt) ?? null;
}

export function create(input) {
  return updateJson(FILE, [], (records) => {
    const now = new Date().toISOString();
    const post = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
    return { data: [...records, post], result: post };
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

export function remove(id) {
  return updateJson(FILE, [], (records) => {
    const post = records.find((entry) => entry.id === id) ?? null;
    return { data: records.filter((entry) => entry.id !== id), result: post };
  });
}
