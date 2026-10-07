import { redirect } from "next/navigation";
import Container from "@/components/ui/Container/Container";
import Section from "@/components/ui/Section/Section";
import LoginForm from "@/components/auth/LoginForm/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Client Login" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/portal");
  return (
    <Section tone="gray" className="!min-h-[65vh] !pt-32">
      <Container className="max-w-xl px-0 sm:px-0">
        <div className="border border-line bg-white p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Client access</p>
          <h1 className="mt-2 text-3xl font-medium">Log in to your account</h1>
          <p className="mt-3 mb-7 text-sm leading-relaxed text-muted">View your matters, documents and requests in one secure place.</p>
          <LoginForm />
        </div>
      </Container>
    </Section>
  );
}
