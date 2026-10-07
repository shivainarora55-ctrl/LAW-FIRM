import "server-only";
import { redirect } from "next/navigation";
import { admins } from "@/lib/storage";
import { readAdminSession } from "./adminSession";

export async function getCurrentAdmin() {
  const session = await readAdminSession();
  return session ? admins.findById(session.adminId) : null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
