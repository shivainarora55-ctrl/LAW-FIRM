import { redirect } from "next/navigation";
import Container from "@/components/ui/Container/Container";
import Section from "@/components/ui/Section/Section";
import RegistrationFlow from "@/components/auth/RegistrationFlow/RegistrationFlow";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Client Registration" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/portal");
  return (
    <Section tone="gray" className="!min-h-[65vh] !pt-32">
      <Container className="max-w-xl px-0 sm:px-0">
        <div className="border border-line bg-white p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Client access</p>
          <h1 className="mt-2 text-3xl font-medium">Create your account</h1>
          <p className="mt-3 mb-7 text-sm leading-relaxed text-muted">Verify your email to access your secure client portal.</p>
          <RegistrationFlow />
        </div>
      </Container>
    </Section>
  );
}
