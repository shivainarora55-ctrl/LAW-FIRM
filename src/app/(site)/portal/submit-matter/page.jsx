import PageHeading from "@/components/portal/PageHeading/PageHeading";
import MatterForm from "@/components/portal/MatterForm/MatterForm";

export const metadata = { title: "Submit Matter" };

export default async function SubmitMatterPage() {
  return (
    <>
      <PageHeading title="Submit a matter" description="Share the details securely. The office will review your submission and follow up using your preferred contact method." />
      <MatterForm />
    </>
  );
}
