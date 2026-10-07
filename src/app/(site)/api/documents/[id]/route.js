import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { documents, fileStore } from "@/lib/storage";
import { assertSameOrigin } from "@/lib/auth/csrf";

function safeMessage(status, message) {
  return NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(_request, { params }) {
  const user = await requireUser({ redirectToLogin: false });
  if (!user) return safeMessage(401, "Please log in to access documents.");
  const { id } = await params;
  try {
    const document = await documents.findDocumentForUser(id, user.id);
    if (!document) return safeMessage(404, "Document not found.");
    if (document.uploadedBy === "firm" && !document.sharedWithClient) return safeMessage(404, "Document not found.");
    const bytes = await fileStore.readUpload(user.id, document.storedName);
    const fallbackName = document.originalName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
    const encodedName = encodeURIComponent(document.originalName).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
    return new Response(bytes, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Length": String(document.size),
        "Content-Disposition": `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Document download failed:", error.message);
    return safeMessage(500, "We could not retrieve that document.");
  }
}

export async function DELETE(_request, { params }) {
  try { assertSameOrigin(_request); } catch { return safeMessage(403, "Request origin could not be verified."); }
  const user = await requireUser({ redirectToLogin: false });
  if (!user) return safeMessage(401, "Please log in to manage documents.");
  const { id } = await params;
  try {
    const record = await documents.findDocumentForUser(id, user.id);
    if (!record) return safeMessage(404, "Document not found.");
    if (record.uploadedBy === "firm") return safeMessage(403, "Firm documents cannot be deleted from the client portal.");
    await fileStore.deleteUpload(user.id, record.storedName);
    const removed = await documents.deleteDocumentForUser(id, user.id);
    if (!removed) return safeMessage(404, "Document not found.");
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Document deletion failed:", error.message);
    return safeMessage(500, "We could not delete that document.");
  }
}
