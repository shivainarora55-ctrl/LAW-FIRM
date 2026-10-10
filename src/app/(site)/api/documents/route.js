import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { documents, fileStore, matters } from "@/lib/storage";
import { MAX_DOCUMENTS_PER_USER } from "@/constants/portal";
import { documentSchema } from "@/lib/validation/document";
import { assertSameOrigin } from "@/lib/auth/csrf";

function safeMessage(status, message) {
  return NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  try { assertSameOrigin(request); } catch { return safeMessage(403, "Request origin could not be verified."); }
  const user = await requireUser({ redirectToLogin: false });
  if (!user) return safeMessage(401, "Please log in to upload documents.");

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return safeMessage(400, "Choose a document to upload.");
    const originalName = file.name.replace(/\\/g, "/").split("/").pop().replace(/[\u0000-\u001f\u007f]/g, "").trim();
    const extension = originalName.includes(".") ? originalName.split(".").pop().toLowerCase() : "";
    const matterIdValue = formData.get("matterId");
    const matterId = typeof matterIdValue === "string" ? matterIdValue.trim() : "";
    const parsed = documentSchema.safeParse({ originalName, extension, mimeType: file.type, size: file.size, matterId });
    if (!parsed.success) return safeMessage(400, parsed.error.issues[0]?.message ?? "The document details are invalid.");
    if (matterId && !await matters.findMatterForUser(matterId, user.id)) return safeMessage(400, "Choose one of your matters.");

    const id = randomUUID();
    const storedName = randomUUID();
    const metadata = {
      id,
      userId: user.id,
      matterId: matterId || null,
      originalName,
      storedName,
      mimeType: file.type,
      size: file.size,
      uploadedBy: "client",
      uploadedByAdminId: null,
      sharedWithClient: true,
      uploadedAt: new Date().toISOString(),
    };
    await fileStore.saveUpload(user.id, storedName, Buffer.from(await file.arrayBuffer()), file.type);
    try {
      const created = await documents.createDocument(metadata, MAX_DOCUMENTS_PER_USER);
      if (!created) {
        await fileStore.deleteUpload(user.id, storedName).catch(() => {});
        return safeMessage(400, "You have reached the 50-document limit.");
      }
    } catch (error) {
      await fileStore.deleteUpload(user.id, storedName).catch(() => {});
      throw error;
    }
    return NextResponse.json({ ok: true, document: metadata }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Document upload failed:", error.message);
    return safeMessage(500, "We could not upload the document. Please try again.");
  }
}
