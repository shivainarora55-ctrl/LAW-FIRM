import "server-only";
import { connection } from "next/server";
import { getSupabase } from "./client";

export function mapDatabaseError(error, operation) {
  const code = error?.code;
  console.error("Supabase storage operation failed", { operation, code: typeof code === "string" ? code : "unknown" });
  if (code === "23505") return new Error("This record already exists.");
  if (code === "23P01") return new Error("This time overlaps another appointment.");
  if (code === "23503") return new Error("The requested record could not be saved because a related record is unavailable.");
  return new Error("Storage operation failed. Please try again.");
}

export async function execute(query, operation) {
  try {
    await connection();
    const { data, error } = await query;
    if (error) throw mapDatabaseError(error, operation);
    return data;
  } catch (error) {
    if (error instanceof Error && ["This record already exists.", "This time overlaps another appointment.", "The requested record could not be saved because a related record is unavailable.", "Storage operation failed. Please try again."].includes(error.message)) throw error;
    console.error("Supabase storage operation failed", { operation, code: typeof error?.code === "string" ? error.code : "network" });
    throw new Error("Storage operation failed. Please try again.");
  }
}

export const db = () => getSupabase();

export function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id, name: row.name, email: row.email, phone: row.phone,
    passwordHash: row.password_hash, emailVerifiedAt: row.email_verified_at,
    address: row.address ?? "", city: row.city ?? "", state: row.state ?? "",
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function userRow(user) {
  return {
    ...(user.id ? { id: user.id } : {}), name: user.name, email: user.email, phone: user.phone,
    password_hash: user.passwordHash, email_verified_at: user.emailVerifiedAt ?? null,
    address: user.address ?? null, city: user.city ?? null, state: user.state ?? null,
    ...(user.createdAt ? { created_at: user.createdAt } : {}), ...(user.updatedAt ? { updated_at: user.updatedAt } : {}),
  };
}

export function mapAdmin(row) {
  return row ? { id: row.id, name: row.name, email: row.email, role: row.role, passwordHash: row.password_hash, createdAt: row.created_at } : null;
}

export function adminRow(admin) {
  return { ...(admin.id ? { id: admin.id } : {}), name: admin.name, email: admin.email, role: admin.role, password_hash: admin.passwordHash, ...(admin.createdAt ? { created_at: admin.createdAt } : {}) };
}

export function mapMatter(row, histories = [], updates = []) {
  return {
    id: row.id, ref: row.ref, userId: row.user_id, title: row.title, practiceArea: row.practice_area,
    description: row.description, urgency: row.urgency, preferredContact: row.preferred_contact,
    opposingParty: row.opposing_party, status: row.status, assignedTo: row.assigned_to,
    createdAt: row.created_at, updatedAt: row.updated_at,
    statusHistory: histories.map((item) => ({ status: item.status, at: item.at, adminId: item.admin_id ?? null })),
    updates: updates.map((item) => ({ id: item.id, text: item.text, authorName: item.author_name, createdAt: item.created_at })),
  };
}

export function matterRow(matter) {
  return {
    ...(matter.id ? { id: matter.id } : {}), ...(matter.ref ? { ref: matter.ref } : {}),
    user_id: matter.userId, title: matter.title, practice_area: matter.practiceArea,
    description: matter.description, urgency: matter.urgency, preferred_contact: matter.preferredContact,
    opposing_party: matter.opposingParty ?? null, status: matter.status, assigned_to: matter.assignedTo ?? null,
  };
}

export function mapRequest(row, replies = []) {
  return { id: row.id, userId: row.user_id, matterId: row.matter_id, type: row.type, message: row.message, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at, replies: replies.map((reply) => ({ id: reply.id, text: reply.text, authorName: reply.author_name, createdAt: reply.created_at })) };
}

export function requestRow(request) {
  return { ...(request.id ? { id: request.id } : {}), user_id: request.userId, matter_id: request.matterId ?? null, type: request.type, message: request.message, status: request.status ?? "open" };
}

export function mapDocument(row) {
  const storagePath = row.storage_path;
  return { id: row.id, userId: row.user_id, matterId: row.matter_id, originalName: row.original_name, storedName: storagePath.split("/").pop(), mimeType: row.mime_type, size: row.size_bytes, uploadedBy: row.uploaded_by, uploadedByAdminId: row.uploaded_by_admin_id, sharedWithClient: row.shared_with_client, uploadedAt: row.uploaded_at };
}

export function documentRow(document) {
  return { ...(document.id ? { id: document.id } : {}), user_id: document.userId, matter_id: document.matterId ?? null, original_name: document.originalName, storage_path: `${document.userId}/${document.storedName}`, mime_type: document.mimeType, size_bytes: document.size, uploaded_by: document.uploadedBy ?? "client", uploaded_by_admin_id: document.uploadedByAdminId ?? null, shared_with_client: document.sharedWithClient ?? true, ...(document.uploadedAt ? { uploaded_at: document.uploadedAt } : {}) };
}

export function mapAppointment(row) {
  return { id: row.id, clientId: row.client_id, matterId: row.matter_id, adminId: row.admin_id, startsAt: row.starts_at, durationMin: row.duration_min, mode: row.mode, location: row.location ?? "", notes: row.notes ?? "", status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function appointmentRow(item) {
  const startsAt = item.startsAt;
  const durationMin = item.durationMin;
  return { ...(item.id ? { id: item.id } : {}), client_id: item.clientId, matter_id: item.matterId ?? null, admin_id: item.adminId, starts_at: startsAt, ends_at: item.endsAt ?? new Date(new Date(startsAt).getTime() + durationMin * 60000).toISOString(), duration_min: durationMin, mode: item.mode, location: item.location || null, notes: item.notes || null, status: item.status };
}

export function mapNote(row) {
  return { id: row.id, clientId: row.client_id, matterId: row.matter_id, adminId: row.admin_id, text: row.text, createdAt: row.created_at };
}

export function mapPost(row) {
  return { id: row.id, slug: row.slug, title: row.title, type: row.type, excerpt: row.excerpt, body: row.body, coverImage: row.cover_image, status: row.status, authorId: row.author_id, authorName: row.author_name, publishedAt: row.published_at, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function postRow(post) {
  return { ...(post.id ? { id: post.id } : {}), slug: post.slug, title: post.title, type: post.type, excerpt: post.excerpt, body: post.body, cover_image: post.coverImage ?? null, status: post.status, author_id: post.authorId ?? null, author_name: post.authorName, published_at: post.publishedAt ?? null, ...(post.createdAt ? { created_at: post.createdAt } : {}), ...(post.updatedAt ? { updated_at: post.updatedAt } : {}) };
}
