import { documents, matters, users } from "@/lib/storage";
import { formatDateTime } from "@/lib/format";
import FirmDocumentUpload from "@/components/admin/FirmDocumentUpload/FirmDocumentUpload";
import Pagination from "@/components/admin/Pagination/Pagination";
import DocumentActions from "@/components/admin/DocumentActions/DocumentActions";

export const metadata = { title: "Documents" };
const PAGE_SIZE = 20;

export default async function AdminDocumentsPage({ searchParams }) {
  const query = await searchParams;
  const term = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
  const filterClient = typeof query.client === "string" ? query.client : "";
  const filterMatter = typeof query.matter === "string" ? query.matter : "";
  const uploadedBy = typeof query.uploadedBy === "string" ? query.uploadedBy : "";
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const [allDocuments, clients, allMatters] = await Promise.all([documents.listAll(), users.listAll(), matters.listAll()]);
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const matterMap = new Map(allMatters.map((matter) => [matter.id, matter]));
  const filtered = allDocuments.filter((document) => {
    const client = clientMap.get(document.userId);
    const matchesText = !term || `${document.originalName} ${client?.name ?? ""} ${client?.email ?? ""}`.toLowerCase().includes(term);
    return matchesText && (!filterClient || document.userId === filterClient) && (!filterMatter || document.matterId === filterMatter) && (!uploadedBy || document.uploadedBy === uploadedBy);
  }).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  const pageDocuments = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <div className="mb-7 border-b border-line pb-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Staff portal</p><h1 className="mt-2 text-3xl font-medium">Documents</h1></div>
      <details className="mb-8 border-b border-line pb-6"><summary className="cursor-pointer text-lg font-medium">Upload for client</summary><div className="pt-5"><FirmDocumentUpload clients={clients} matters={allMatters.map(({ id, userId, ref, title }) => ({ id, userId, ref, title }))} /></div></details>
      <form action="/admin/documents" className="mb-5 grid gap-3 sm:grid-cols-3">
        <label className="text-sm sm:col-span-3">Search documents or clients<input type="search" name="q" defaultValue={term} className="mt-1 min-h-11 w-full border border-line px-3" /></label>
        <label className="text-sm">Client<select name="client" defaultValue={filterClient} className="mt-1 min-h-11 w-full border border-line bg-white px-3"><option value="">All clients</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
        <label className="text-sm">Matter<select name="matter" defaultValue={filterMatter} className="mt-1 min-h-11 w-full border border-line bg-white px-3"><option value="">All matters</option>{allMatters.map((matter) => <option key={matter.id} value={matter.id}>{matter.ref}</option>)}</select></label>
        <label className="text-sm">Uploaded by<select name="uploadedBy" defaultValue={uploadedBy} className="mt-1 min-h-11 w-full border border-line bg-white px-3"><option value="">Anyone</option><option value="client">Client</option><option value="firm">Firm</option></select></label>
        <button className="min-h-11 bg-brand-black px-5 text-sm font-medium text-white transition-colors hover:bg-brand-red sm:col-start-3">Apply filters</button>
      </form>
      {filtered.length === 0 ? <p className="border-t border-line py-7 text-sm text-muted">No documents match these filters.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[48rem] border-collapse text-left text-sm"><thead><tr className="border-y border-line text-xs uppercase tracking-wide text-muted"><th className="py-3 pr-4 font-medium">Document</th><th className="py-3 pr-4 font-medium">Client</th><th className="py-3 pr-4 font-medium">Matter</th><th className="py-3 pr-4 font-medium">Uploaded by</th><th className="py-3 pr-4 font-medium">Date</th><th className="py-3 font-medium">Actions</th></tr></thead><tbody>{pageDocuments.map((item) => <tr key={item.id} className="border-b border-line"><td className="max-w-xs break-words py-4 pr-4 font-medium">{item.originalName}</td><td className="py-4 pr-4">{clientMap.get(item.userId)?.name ?? "Client"}</td><td className="py-4 pr-4">{matterMap.get(item.matterId)?.ref ?? "—"}</td><td className="py-4 pr-4 capitalize">{item.uploadedBy}</td><td className="py-4 pr-4 text-muted">{formatDateTime(item.uploadedAt)}</td><td className="py-4"><div className="flex items-center gap-3"><a href={`/api/admin/documents/${item.id}`} className="text-brand-red hover:text-brand-red-dark">Download</a><DocumentActions documentId={item.id} uploadedBy={item.uploadedBy} /></div></td></tr>)}</tbody></table></div>}
      <Pagination page={page} total={filtered.length} pathname="/admin/documents" preserve={{ client: filterClient, matter: filterMatter, uploadedBy }} search={term} />
    </>
  );
}
