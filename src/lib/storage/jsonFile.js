import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { getEnv } from "@/lib/env";

const queues = new Map();

function dataDirectory() {
  return resolve(/*turbopackIgnore: true*/ process.cwd(), getEnv().DATA_DIR);
}

async function withLock(key, task) {
  const previous = queues.get(key) ?? Promise.resolve();
  let release;
  const queued = new Promise((resolveQueue) => { release = resolveQueue; });
  queues.set(key, queued);
  await previous;
  try {
    return await task();
  } finally {
    release();
    if (queues.get(key) === queued) queues.delete(key);
  }
}

async function saveAtomic(filePath, value) {
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  const handle = await open(temporaryPath, "wx");
  try {
    await handle.writeFile(JSON.stringify(value, null, 2), "utf8");
    await handle.sync();
    await handle.close();
  } catch (error) {
    await handle.close().catch(() => {});
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
  try {
    await rename(temporaryPath, filePath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
}

async function readOrCreate(fileName, initialValue) {
  const directory = dataDirectory();
  const filePath = join(/*turbopackIgnore: true*/ directory, fileName);
  await mkdir(directory, { recursive: true });
  try {
    const parsed = JSON.parse(await readFile(/*turbopackIgnore: true*/ filePath, "utf8"));
    if (Array.isArray(initialValue) !== Array.isArray(parsed)) {
      throw new Error(`Storage file ${basename(filePath)} is corrupt. Repair or restore it before continuing.`);
    }
    return parsed;
  } catch (error) {
    if (error.code !== "ENOENT") {
      if (error instanceof SyntaxError) {
        throw new Error(`Storage file ${basename(filePath)} is corrupt. Repair or restore it before continuing.`);
      }
      throw error;
    }
    await saveAtomic(filePath, initialValue);
    return initialValue;
  }
}

export function readJson(fileName, initialValue = []) {
  const filePath = join(/*turbopackIgnore: true*/ dataDirectory(), fileName);
  return withLock(filePath, () => readOrCreate(fileName, initialValue));
}

export function updateJson(fileName, initialValue, updater) {
  const directory = dataDirectory();
  const filePath = join(/*turbopackIgnore: true*/ directory, fileName);
  return withLock(filePath, async () => {
    const current = await readOrCreate(fileName, initialValue);
    const { data, result } = await updater(current);
    await saveAtomic(filePath, data);
    return result;
  });
}
