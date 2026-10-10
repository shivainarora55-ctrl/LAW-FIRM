import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/adminGuard";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { audit, documents, fileStore, matters, users } from "@/lib/storage";
import { documentSchema } from "@/lib/validation/document";

function response(status, message) {
  return NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request) {
  try { assertSameOrigin(request); } catch { return response(403, "Request origin could not be verified."); }
  const admin = await requireAdmin();
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const clientId = formData.get("clientId");
    const matterIdValue = formData.get("matterId");
    const matterId = typeof matterIdValue === "string" ? matterIdValue.trim() : "";
    if (!(file instanceof File) || !file.size) return response(400, "Choose a document to upload.");
    if (typeof clientId !== "string") return response(400, "Choose a client.");
    const client = await users.findUserById(clientId);
    if (!client) return response(404, "Client not found.");
    if (matterId && !await matters.findMatterForUser(matterId, client.id)) return response(400, "Choose a matter belonging to this client.");
    const originalName = file.name.replace(/\\/g, "/").split("/").pop().replace(/[\u0000-\u001f\u007f]/g, "").trim();
    const extension = originalName.includes(".") ? originalName.split(".").pop().toLowerCase() : "";
    const parsed = documentSchema.safeParse({ originalName, extension, mimeType: file.type, size: file.size, matterId });
    if (!parsed.success) return response(400, parsed.error.issues[0]?.message ?? "The document details are invalid.");

    const id = randomUUID();
    const storedName = randomUUID();
    const metadata = { id, userId: client.id, matterId: matterId || null, originalName, storedName, mimeType: file.type, size: file.size, uploadedBy: "firm", uploadedByAdminId: admin.id, sharedWithClient: formData.get("sharedWithClient") === "on", uploadedAt: new Date().toISOString() };
    await fileStore.saveUpload(client.id, storedName, Buffer.from(await file.arrayBuffer()), file.type);
    try {
      await documents.createDocument(metadata);
    } catch (error) {
      await fileStore.deleteUpload(client.id, storedName).catch(() => {});
      throw error;
    }
    await audit.record({ adminId: admin.id, action: "document.upload", entity: "document", entityId: id });
    if (metadata.sharedWithClient && client.email) {
      const { sendClientNotice } = await import("@/lib/mailer");
      const { clientNoticeTemplate } = await import("@/lib/mailer/templates");
      void sendClientNotice(client.email, clientNoticeTemplate({ greeting: client.name, subject: "A document has been shared with you", message: `A new document is available in your client portal: ${originalName}.` }));
    }
    return NextResponse.json({ ok: true, document: metadata }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin document upload failed:", error.message);
    return response(500, "We could not upload the document.");
  }
}
