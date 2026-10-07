"use client";

import { useState } from "react";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";
import { formatDateTime } from "@/lib/format";

const formatBytes = (size) => size < 1024 * 1024 ? `${Math.ceil(size / 1024)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;

export default function DocumentManager({ initialDocuments, matters }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function uploadDocument(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setMessage("");
    setBusy(true);
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/documents", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "We could not upload that document.");
        return;
      }
      setDocuments((current) => [result.document, ...current]);
      formElement.reset();
      setMessage("Document uploaded.");
    } catch {
      setMessage("We could not upload that document. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteDocument(documentId) {
    if (!window.confirm("Delete this document? This cannot be undone.")) return;
    setMessage("");
    try {
      const response = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "We could not delete that document.");
        return;
      }
      setDocuments((current) => current.filter((document) => document.id !== documentId));
      setMessage("Document deleted.");
    } catch {
      setMessage("We could not delete that document. Please try again.");
    }
  }

  return (
    <>
      <form onSubmit={uploadDocument} className="mb-10 max-w-3xl space-y-5 border border-line p-5 sm:p-6">
        {message && <p role="status" aria-live="polite" className="border-l-4 border-brand-red bg-soft-gray px-4 py-3 text-sm">{message}</p>}
        <FormField label="Choose a document" name="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required />
        <FormField label="Link to matter (optional)" name="matterId" as="select"><option value="">No related matter</option>{matters.map((matter) => <option key={matter.id} value={matter.id}>{matter.ref} · {matter.title}</option>)}</FormField>
        <SubmitButton pendingText="Uploading..." disabled={busy}>{busy ? "Uploading..." : "Upload document"}</SubmitButton>
      </form>
      {documents.length === 0 ? <div className="border-t border-line py-7"><p className="text-sm text-muted">No documents have been uploaded.</p></div> : (
        <ul className="divide-y divide-line border-y border-line">
          {documents.map((document) => {
            const linkedMatter = matters.find((matter) => matter.id === document.matterId);
            return <li key={document.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="break-words font-medium">{document.originalName}{document.uploadedBy === "firm" && <span className="ml-2 border border-line px-2 py-0.5 text-xs text-muted">From firm</span>}</p><p className="mt-1 text-xs text-muted">{linkedMatter ? `${linkedMatter.ref} · ${linkedMatter.title}` : "No linked matter"} · {formatBytes(document.size)} · {formatDateTime(document.uploadedAt)}</p></div><div className="flex shrink-0 gap-4 text-sm font-medium"><a href={`/api/documents/${document.id}`} className="min-h-11 inline-flex items-center text-brand-red hover:text-brand-red-dark">Download</a>{document.uploadedBy !== "firm" && <button type="button" onClick={() => deleteDocument(document.id)} className="min-h-11 text-muted hover:text-brand-red">Delete</button>}</div></li>;
          })}
        </ul>
      )}
    </>
  );
}
