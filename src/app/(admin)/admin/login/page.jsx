import { redirect } from "next/navigation";
import Container from "@/components/ui/Container/Container";
import Section from "@/components/ui/Section/Section";
import AdminLoginForm from "@/components/admin/AdminLoginForm/AdminLoginForm";
import { getCurrentAdmin } from "@/lib/auth/adminGuard";

export const metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  return (
    <Section tone="gray" className="!min-h-[65vh] !pt-28">
      <Container className="max-w-xl px-0 sm:px-0">
        <div className="border border-line bg-white p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Staff access</p>
          <h1 className="mt-2 text-3xl font-medium">Lawyer portal</h1>
          <p className="mt-3 mb-7 text-sm text-muted">Authorised staff only</p>
          <AdminLoginForm />
        </div>
      </Container>
    </Section>
  );
}
