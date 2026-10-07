"use server";

import "server-only";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appointments, audit, admins, fileStore, matters, notes, posts, requests, users } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth/adminGuard";
import { headers } from "next/headers";
import { sendClientNotice } from "@/lib/mailer";
import { clientNoticeTemplate } from "@/lib/mailer/templates";
import { MATTER_STATUSES, REQUEST_STATUSES } from "@/constants/admin";
import { fieldErrorsFromZod } from "@/lib/validation";
import { z } from "zod";

const noteSchema = z.object({ clientId: z.string().uuid(), matterId: z.string().uuid().or(z.literal("")), text: z.string().trim().min(2).max(3000) });
const matterSchema = z.object({ matterId: z.string().uuid(), status: z.string().refine((value) => MATTER_STATUSES.includes(value)), assignedTo: z.string().uuid().or(z.literal("")), updateText: z.string().trim().max(2000) });
const replySchema = z.object({ requestId: z.string().uuid(), status: z.string().refine((value) => REQUEST_STATUSES.includes(value)), reply: z.string().trim().max(2000) });

const fail = (message, errors = {}) => ({ ok: false, message, errors });
const value = (formData, name) => typeof formData.get(name) === "string" ? formData.get(name) : "";

async function assertActionOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!origin || !host || new URL(origin).host.toLowerCase() !== host.toLowerCase()) throw new Error("Request origin could not be verified.");
}

export async function addInternalNote(_previousState, formData) {
  try { await assertActionOrigin(); } catch { return fail("Request origin could not be verified."); }
  const admin = await requireAdmin();
  const parsed = noteSchema.safeParse({ clientId: value(formData, "clientId"), matterId: value(formData, "matterId"), text: value(formData, "text") });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));
  try {
    const client = await users.findUserById(parsed.data.clientId);
    if (!client) return fail("Client not found.");
    if (parsed.data.matterId && !await matters.findMatterForUser(parsed.data.matterId, client.id)) return fail("The matter does not belong to this client.", { matterId: "Choose a matter for this client." });
    await notes.create({ clientId: client.id, matterId: parsed.data.matterId || null, adminId: admin.id, text: parsed.data.text });
    await audit.record({ adminId: admin.id, action: "note.create", entity: "note", entityId: client.id });
    revalidatePath(`/admin/clients/${client.id}`);
    if (parsed.data.matterId) revalidatePath(`/admin/matters/${parsed.data.matterId}`);
    return { ok: true, message: "Internal note added.", errors: {} };
  } catch (error) {
    console.error("Internal note creation failed:", error.message);
    return fail("We could not save that note.");
  }
}

export async function updateMatterAdmin(_previousState, formData) {
  try { await assertActionOrigin(); } catch { return fail("Request origin could not be verified."); }
  const admin = await requireAdmin();
  const parsed = matterSchema.safeParse({ matterId: value(formData, "matterId"), status: value(formData, "status"), assignedTo: value(formData, "assignedTo"), updateText: value(formData, "updateText") });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));
  try {
    const current = await matters.findById(parsed.data.matterId);
    if (!current) return fail("Matter not found.");
    const assignedTo = parsed.data.assignedTo || null;
    if (assignedTo && !await admins.findById(assignedTo)) return fail("Choose an active lawyer.", { assignedTo: "Choose an active lawyer." });
    const statusChanged = current.status !== parsed.data.status;
    const updateText = parsed.data.updateText;
    const updated = await matters.update(current.id, (matter) => ({
      ...matter,
      status: parsed.data.status,
      assignedTo,
      updatedAt: new Date().toISOString(),
      statusHistory: statusChanged ? [...matter.statusHistory, { status: parsed.data.status, at: new Date().toISOString(), adminId: admin.id }] : matter.statusHistory,
      updates: updateText ? [...matter.updates, { id: randomUUID(), text: updateText, authorName: admin.name, createdAt: new Date().toISOString() }] : matter.updates,
    }));
    if (statusChanged) await audit.record({ adminId: admin.id, action: "matter.status", entity: "matter", entityId: current.id });
    if (updateText) await audit.record({ adminId: admin.id, action: "matter.update", entity: "matter", entityId: current.id });
    const client = await users.findUserById(current.userId);
    if (client?.email && (statusChanged || updateText)) {
      void sendClientNotice(client.email, clientNoticeTemplate({ greeting: client.name, subject: "An update to your legal matter", message: updateText || `The status of matter ${current.ref} is now ${parsed.data.status.replaceAll("-", " ")}.` }));
    }
    revalidatePath("/admin");
    revalidatePath("/admin/requests");
    revalidatePath(`/admin/matters/${current.id}`);
    revalidatePath("/portal");
    revalidatePath(`/portal/matters/${current.id}`);
    return { ok: true, message: "Matter details updated.", errors: {}, ref: updated.ref };
  } catch (error) {
    console.error("Matter update failed:", error.message);
    return fail("We could not update that matter.");
  }
}

export async function replyToRequest(_previousState, formData) {
  try { await assertActionOrigin(); } catch { return fail("Request origin could not be verified."); }
  const admin = await requireAdmin();
  const parsed = replySchema.safeParse({ requestId: value(formData, "requestId"), status: value(formData, "status"), reply: value(formData, "reply") });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));
  if (!parsed.data.reply && parsed.data.status === "open") return fail("Add a reply or change the request status.");
  try {
    const current = await requests.findById(parsed.data.requestId);
    if (!current) return fail("Request not found.");
    const updated = await requests.update(current.id, (request) => ({
      ...request,
      status: parsed.data.status,
      replies: parsed.data.reply ? [...request.replies, { id: randomUUID(), text: parsed.data.reply, authorName: admin.name, createdAt: new Date().toISOString() }] : request.replies,
    }));
    await audit.record({ adminId: admin.id, action: "request.reply", entity: "request", entityId: current.id });
    const client = await users.findUserById(current.userId);
    if (client?.email && parsed.data.reply) void sendClientNotice(client.email, clientNoticeTemplate({ greeting: client.name, subject: "A reply to your office request", message: parsed.data.reply }));
    revalidatePath("/admin");
    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${current.id}`);
    revalidatePath("/portal/requests");
    revalidatePath("/portal");
    return { ok: true, message: "Request updated.", errors: {}, request: updated };
  } catch (error) {
    console.error("Request update failed:", error.message);
    return fail("We could not update that request.");
  }
}

export async function createAppointment(_previousState, formData) {
  try { await assertActionOrigin(); } catch { return fail("Request origin could not be verified."); }
  const admin = await requireAdmin();
  const localStartsAt = value(formData, "startsAt");
  const localDate = localStartsAt ? new Date(`${localStartsAt}:00+05:30`) : null;
  const utcStartsAt = localDate && Number.isFinite(localDate.getTime()) ? localDate.toISOString() : "";
  const parsed = z.object({
    clientId: z.string().uuid(),
    matterId: z.string().uuid().or(z.literal("")),
    startsAt: z.string().datetime({ offset: true }),
    durationMin: z.coerce.number().refine((minutes) => [30, 45, 60].includes(minutes)),
    mode: z.enum(["in-person", "phone", "video"]),
    location: z.string().trim().max(300),
    notes: z.string().trim().max(2000),
  }).safeParse({
    clientId: value(formData, "clientId"),
    matterId: value(formData, "matterId"),
    startsAt: utcStartsAt,
    durationMin: value(formData, "durationMin"),
    mode: value(formData, "mode"),
    location: value(formData, "location"),
    notes: value(formData, "notes"),
  });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));
  let created = null;
  try {
    const client = await users.findUserById(parsed.data.clientId);
    if (!client) return fail("Client not found.");
    if (parsed.data.matterId && !await matters.findMatterForUser(parsed.data.matterId, client.id)) return fail("The matter does not belong to this client.", { matterId: "Choose one of this client’s matters." });
    const start = new Date(parsed.data.startsAt).getTime();
    const end = start + parsed.data.durationMin * 60000;
    const overlaps = (await appointments.listAll()).some((item) => item.adminId === admin.id && item.status === "scheduled" && start < new Date(item.startsAt).getTime() + item.durationMin * 60000 && end > new Date(item.startsAt).getTime());
    if (overlaps) return fail("This time overlaps another scheduled appointment.", { startsAt: "Choose a different time." });
    created = await appointments.create({ ...parsed.data, matterId: parsed.data.matterId || null, startsAt: new Date(parsed.data.startsAt).toISOString(), adminId: admin.id, status: "scheduled" });
    await audit.record({ adminId: admin.id, action: "appointment.create", entity: "appointment", entityId: created.id });
    if (client.email) void sendClientNotice(client.email, clientNoticeTemplate({ greeting: client.name, subject: "A legal appointment has been scheduled", message: `Your appointment is scheduled for ${created.startsAt}. Please contact the office if you need to make a change.` }));
    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
    revalidatePath("/portal");
  } catch (error) {
    console.error("Appointment creation failed:", error.message);
    return fail("We could not schedule that appointment.");
  }
  if (created) redirect(`/admin/appointments/${created.id}`);
  return fail("We could not schedule that appointment.");
}

export async function updateAppointment(_previousState, formData) {
  try { await assertActionOrigin(); } catch { return fail("Request origin could not be verified."); }
  const admin = await requireAdmin();
  const id = value(formData, "appointmentId");
  if (!z.string().uuid().safeParse(id).success) return fail("Appointment not found.");
  const status = value(formData, "status");
  if (!["scheduled", "completed", "cancelled"].includes(status)) return fail("Choose a valid appointment status.", { status: "Choose a valid status." });
  try {
    const current = await appointments.findById(id);
    if (!current) return fail("Appointment not found.");
    const updated = await appointments.update(id, (appointment) => ({ ...appointment, status, updatedAt: new Date().toISOString() }));
    await audit.record({ adminId: admin.id, action: status === "cancelled" ? "appointment.cancel" : "appointment.update", entity: "appointment", entityId: id });
    const client = await users.findUserById(current.clientId);
    if (client?.email && status !== current.status) void sendClientNotice(client.email, clientNoticeTemplate({ greeting: client.name, subject: "An update to your legal appointment", message: `Your appointment status is now ${status}.` }));
    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
    revalidatePath(`/admin/appointments/${id}`);
    revalidatePath("/portal");
    return { ok: true, message: "Appointment updated.", errors: {}, appointment: updated };
  } catch (error) {
    console.error("Appointment update failed:", error.message);
    return fail("We could not update that appointment.");
  }
}

function slugBase(title) {
  return title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "article";
}

async function uniquePostSlug(title, currentId = null) {
  const existing = await posts.listAll();
  const base = slugBase(title);
  let slug = base;
  let suffix = 2;
  while (existing.some((post) => post.id !== currentId && post.slug === slug)) slug = `${base}-${suffix++}`;
  return slug;
}

export async function saveBlogPost(_previousState, formData) {
  try { await assertActionOrigin(); } catch { return fail("Request origin could not be verified."); }
  const admin = await requireAdmin();
  const parsed = z.object({
    postId: z.string().uuid().or(z.literal("")),
    title: z.string().trim().min(5).max(160),
    type: z.enum(["Article", "Blog"]),
    excerpt: z.string().trim().min(1).max(200),
    body: z.string().trim().min(30).max(30000),
    status: z.enum(["draft", "published"]),
  }).safeParse({
    postId: value(formData, "postId"),
    title: value(formData, "title"),
    type: value(formData, "type"),
    excerpt: value(formData, "excerpt"),
    body: value(formData, "body"),
    status: value(formData, "status"),
  });
  if (!parsed.success) return fail("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));
  let uploadedCover = null;
  try {
    const current = parsed.data.postId ? await posts.findById(parsed.data.postId) : null;
    if (parsed.data.postId && !current) return fail("Post not found.");
    const file = formData.get("coverImage");
    let coverImage = current?.coverImage ?? null;
    if (file instanceof File && file.size > 0) {
      const originalName = file.name.replace(/\\/g, "/").split("/").pop().replace(/[\u0000-\u001f\u007f]/g, "");
      const extension = originalName.includes(".") ? originalName.split(".").pop().toLowerCase() : "";
      const validPair = (extension === "jpg" || extension === "jpeg") && file.type === "image/jpeg" || extension === "png" && file.type === "image/png" || extension === "webp" && file.type === "image/webp";
      if (!validPair || file.size > 2 * 1024 * 1024) return fail("Cover images must be JPG, PNG, or WebP and no larger than 2 MB.", { coverImage: "Choose a supported image under 2 MB." });
      uploadedCover = `${randomUUID()}.${extension === "jpeg" ? "jpg" : extension}`;
      await fileStore.saveBlogImage(uploadedCover, Buffer.from(await file.arrayBuffer()));
      coverImage = `/api/blog-images/${uploadedCover}`;
    }
    const slug = await uniquePostSlug(parsed.data.title, current?.id ?? null);
    const now = new Date().toISOString();
    const publishedAt = parsed.data.status === "published" ? current?.publishedAt ?? now : null;
    const values = { slug, title: parsed.data.title, type: parsed.data.type, excerpt: parsed.data.excerpt, body: parsed.data.body, coverImage, status: parsed.data.status, authorId: current?.authorId ?? admin.id, authorName: current?.authorName ?? admin.name, publishedAt, updatedAt: now };
    const post = current ? await posts.update(current.id, (record) => ({ ...record, ...values })) : await posts.create({ ...values, createdAt: now });
    await audit.record({ adminId: admin.id, action: current ? parsed.data.status !== current.status ? `blog.${parsed.data.status}` : "blog.update" : "blog.create", entity: "post", entityId: post.id });
    for (const path of ["/", "/insights", `/insights/${current?.slug ?? post.slug}`, `/insights/${post.slug}`]) revalidatePath(path);
    return { ok: true, message: current ? "Post saved." : "Post created.", errors: {}, postId: post.id, slug: post.slug };
  } catch (error) {
    if (uploadedCover) await fileStore.deleteBlogImage(uploadedCover).catch(() => {});
    console.error("Blog save failed:", error.message);
    return fail("We could not save that post.");
  }
}

export async function deleteBlogPost(formData) {
  try { await assertActionOrigin(); } catch { return fail("Request origin could not be verified."); }
  const admin = await requireAdmin();
  const id = value(formData, "postId");
  if (!z.string().uuid().safeParse(id).success) return fail("Post not found.");
  try {
    const post = await posts.remove(id);
    if (!post) return fail("Post not found.");
    if (post.coverImage) await fileStore.deleteBlogImage(post.coverImage.split("/").pop()).catch(() => {});
    await audit.record({ adminId: admin.id, action: "blog.delete", entity: "post", entityId: id });
    for (const path of ["/", "/insights", `/insights/${post.slug}`]) revalidatePath(path);
    redirect("/admin/blogs");
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Blog delete failed:", error.message);
    return fail("We could not delete that post.");
  }
}
