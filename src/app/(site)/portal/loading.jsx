import Container from "@/components/ui/Container/Container";

export default function PortalLoading() {
  return <Container className="py-12" aria-busy="true"><p className="text-sm text-muted">Loading your portal...</p></Container>;
}
