import "server-only";
import { redirect } from "next/navigation";
import { users } from "@/lib/storage";
import { readSession } from "./session";

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;
  return users.findUserById(session.userId);
}

export async function requireUser({ redirectToLogin = true } = {}) {
  const user = await getCurrentUser();
  if (!user && redirectToLogin) redirect("/login");
  return user;
}
