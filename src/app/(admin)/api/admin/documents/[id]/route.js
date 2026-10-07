import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/adminGuard";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { audit, documents, fileStore } from "@/lib/storage";

function response(status, message) {
  return NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(_request, { params }) {
  await requireAdmin();
  const { id } = await params;
  try {
    const document = await documents.findById(id);
    if (!document) return response(404, "Document not found.");
    const bytes = await fileStore.readUpload(document.userId, document.storedName);
    const fallback = document.originalName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
    const encoded = encodeURIComponent(document.originalName).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
    return new Response(bytes, { headers: { "Content-Type": document.mimeType, "Content-Length": String(document.size), "Content-Disposition": `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin document download failed:", error.message);
    return response(500, "We could not retrieve that document.");
  }
}

export async function DELETE(request, { params }) {
  try { assertSameOrigin(request); } catch { return response(403, "Request origin could not be verified."); }
  const admin = await requireAdmin();
  const { id } = await params;
  try {
    const document = await documents.findById(id);
    if (!document) return response(404, "Document not found.");
    if (document.uploadedBy !== "firm") return response(403, "Lawyers can only delete documents uploaded by the firm.");
    await fileStore.deleteUpload(document.userId, document.storedName);
    const removed = await documents.deleteDocumentForUser(document.id, document.userId);
    if (!removed) return response(404, "Document not found.");
    await audit.record({ adminId: admin.id, action: "document.delete", entity: "document", entityId: id });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Admin document deletion failed:", error.message);
    return response(500, "We could not delete that document.");
  }
}
