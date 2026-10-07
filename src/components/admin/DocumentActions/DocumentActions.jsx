"use client";

import { useState } from "react";

export default function DocumentActions({ documentId, uploadedBy }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function removeDocument() {
    if (uploadedBy !== "firm" || !window.confirm("Delete this firm-uploaded document?")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) setMessage(result.message || "Unable to delete document.");
      else window.location.reload();
    } catch {
      setMessage("Unable to delete document.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex items-center gap-3">
      {uploadedBy === "firm" && <button type="button" onClick={removeDocument} disabled={busy} className="min-h-11 text-sm text-muted transition-colors hover:text-brand-red disabled:opacity-60">{busy ? "Deleting..." : "Delete"}</button>}
      {message && <span role="alert" className="text-xs text-brand-red">{message}</span>}
    </div>
  );
}
