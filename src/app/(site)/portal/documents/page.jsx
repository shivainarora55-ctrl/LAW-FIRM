import PageHeading from "@/components/portal/PageHeading/PageHeading";
import DocumentManager from "@/components/portal/DocumentManager/DocumentManager";
import { requireUser } from "@/lib/auth";
import { documents, matters } from "@/lib/storage";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const user = await requireUser();
  const [userDocuments, userMatters] = await Promise.all([
    documents.listDocumentsForUser(user.id),
    matters.listMattersForUser(user.id),
  ]);
  return <><PageHeading title="Documents" description="Upload and retrieve documents related to your legal matters." /><DocumentManager initialDocuments={userDocuments} matters={userMatters.map(({ id, ref, title }) => ({ id, ref, title }))} /></>;
}
