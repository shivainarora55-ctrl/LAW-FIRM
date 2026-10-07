import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { getEnv } from "@/lib/env";

function uploadPath(userId, storedName) {
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !/^[0-9a-f-]{36}$/i.test(storedName)) {
    throw new Error("Invalid upload identifier.");
  }
  const root = resolve(process.cwd(), getEnv().DATA_DIR, "uploads");
  const destination = resolve(root, userId, storedName);
  if (!destination.startsWith(`${root}${sep}`)) throw new Error("Invalid upload location.");
  return { root, destination };
}

export async function saveUpload(userId, storedName, bytes) {
  const { root, destination } = uploadPath(userId, storedName);
  await mkdir(join(root, userId), { recursive: true });
  await writeFile(destination, bytes, { flag: "wx" });
}

export async function readUpload(userId, storedName) {
  const { destination } = uploadPath(userId, storedName);
  return readFile(/*turbopackIgnore: true*/ destination);
}

export async function deleteUpload(userId, storedName) {
  const { destination } = uploadPath(userId, storedName);
  await unlink(destination);
}

function blogImagePath(storedName) {
  if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(storedName)) throw new Error("Invalid blog image identifier.");
  const root = resolve(process.cwd(), getEnv().DATA_DIR, "uploads", "blog");
  const destination = resolve(root, storedName);
  if (!destination.startsWith(`${root}${sep}`)) throw new Error("Invalid blog image location.");
  return { root, destination };
}

export async function saveBlogImage(storedName, bytes) {
  const { root, destination } = blogImagePath(storedName);
  await mkdir(root, { recursive: true });
  await writeFile(destination, bytes, { flag: "wx" });
}

export async function readBlogImage(storedName) {
  const { destination } = blogImagePath(storedName);
  return readFile(/*turbopackIgnore: true*/ destination);
}

export async function deleteBlogImage(storedName) {
  const { destination } = blogImagePath(storedName);
  await unlink(destination);
}
