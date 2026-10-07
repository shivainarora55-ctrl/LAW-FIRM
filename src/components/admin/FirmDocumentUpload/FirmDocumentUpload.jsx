"use client";

import { useState } from "react";
import FormField from "@/components/forms/FormField/FormField";
import SubmitButton from "@/components/forms/SubmitButton/SubmitButton";

export default function FirmDocumentUpload({ clients, matters }) {
  const [selectedClient, setSelectedClient] = useState("");
  const [message, setMessage] = useState("");
  const clientMatters = matters.filter((matter) => matter.userId === selectedClient);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await fetch("/api/admin/documents", { method: "POST", body: new FormData(form) });
    const result = await response.json();
    setMessage(response.ok ? "Document uploaded." : result.message || "Upload failed.");
    if (response.ok) form.reset();
  }
  return (
    <form onSubmit={submit} className="mb-8 max-w-3xl space-y-5 border border-line p-5 sm:p-6">
      {message && <p role="status" aria-live="polite" className="border-l-4 border-brand-red bg-soft-gray px-4 py-3 text-sm">{message}</p>}
      <FormField label="Client" name="clientId" as="select" required onChange={(event) => setSelectedClient(event.target.value)}><option value="">Choose client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name} · {client.email}</option>)}</FormField>
      <FormField label="Link to matter (optional)" name="matterId" as="select"><option value="">No linked matter</option>{clientMatters.map((matter) => <option key={matter.id} value={matter.id}>{matter.ref} · {matter.title}</option>)}</FormField>
      <FormField label="Document" name="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required />
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="sharedWithClient" defaultChecked className="h-4 w-4 accent-brand-red" />Visible to client</label>
      <SubmitButton pendingText="Uploading...">Upload for client</SubmitButton>
    </form>
  );
}
