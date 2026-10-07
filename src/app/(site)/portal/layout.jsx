import Container from "@/components/ui/Container/Container";
import PortalNav from "@/components/portal/PortalNav/PortalNav";
import { requireUser } from "@/lib/auth";

export const metadata = { title: { template: "%s | Client Portal", default: "Client Portal" } };

export default async function PortalLayout({ children }) {
  await requireUser();
  return (
    <div className="min-h-[65vh] bg-white pt-20">
      <div className="border-b border-line bg-soft-gray py-6 sm:py-8">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">Secure client access</p>
          <p className="mt-1 font-heading text-2xl font-medium">Client portal</p>
        </Container>
      </div>
      <Container className="px-0 sm:px-0 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12 lg:py-8">
        <div className="lg:sticky lg:top-6 lg:self-start"><PortalNav /></div>
        <div className="min-w-0 px-4 py-7 sm:px-6 lg:px-0 lg:py-4">{children}</div>
      </Container>
    </div>
  );
}
