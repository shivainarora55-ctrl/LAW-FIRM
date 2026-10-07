import AdminShell from "@/components/admin/AdminShell/AdminShell";
import { requireAdmin } from "@/lib/auth/adminGuard";

export const metadata = { title: { template: "%s | Staff Portal", default: "Staff Portal" } };

export default async function ProtectedAdminLayout({ children }) {
  const admin = await requireAdmin();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
