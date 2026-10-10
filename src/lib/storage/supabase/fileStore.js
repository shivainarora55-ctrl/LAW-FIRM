import "server-only";
import { connection } from "next/server";
import { getSupabase } from "./client";
import { mapDatabaseError } from "./shared";

const UUID = /^[0-9a-f-]{36}$/i;

function uploadPath(userId, storedName) {
  if (!UUID.test(userId) || !UUID.test(storedName)) throw new Error("Invalid upload identifier.");
  return `${userId}/${storedName}`;
}

function blogImageType(storedName) {
  if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(storedName)) throw new Error("Invalid blog image identifier.");
  return storedName.toLowerCase().endsWith(".png") ? "image/png" : storedName.toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg";
}

async function storageOperation(promise, operation) {
  try {
    await connection();
    const { data, error } = await promise;
    if (error) throw mapDatabaseError(error, operation);
    return data;
  } catch (error) {
    if (["This record already exists.", "This time overlaps another appointment.", "The requested record could not be saved because a related record is unavailable.", "Storage operation failed. Please try again."].includes(error?.message)) throw error;
    console.error("Supabase storage operation failed", { operation, code: typeof error?.statusCode === "string" ? error.statusCode : "unknown" });
    throw new Error("Storage operation failed. Please try again.");
  }
}

export async function saveUpload(userId, storedName, bytes, contentType = "application/octet-stream") {
  const path = uploadPath(userId, storedName);
  await storageOperation(getSupabase().storage.from("documents").upload(path, bytes, { contentType, upsert: false }), "storage.documents.upload");
}

export async function readUpload(userId, storedName) {
  const path = uploadPath(userId, storedName);
  return storageOperation(getSupabase().storage.from("documents").download(path), "storage.documents.download");
}

export async function deleteUpload(userId, storedName) {
  const path = uploadPath(userId, storedName);
  await storageOperation(getSupabase().storage.from("documents").remove([path]), "storage.documents.delete");
}

export async function saveBlogImage(storedName, bytes) {
  await storageOperation(getSupabase().storage.from("blog-images").upload(storedName, bytes, { contentType: blogImageType(storedName), upsert: false }), "storage.blogImages.upload");
}

export async function readBlogImage(storedName) {
  blogImageType(storedName);
  return storageOperation(getSupabase().storage.from("blog-images").download(storedName), "storage.blogImages.download");
}

export async function deleteBlogImage(storedName) {
  blogImageType(storedName);
  await storageOperation(getSupabase().storage.from("blog-images").remove([storedName]), "storage.blogImages.delete");
}
