"use server";

import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { admins } from "@/lib/storage";
import { clearAdminSession, setAdminSession } from "@/lib/auth/adminSession";
import { clearLoginFailures, isRateLimited, loginRateLimitKey, recordLoginFailure } from "@/lib/auth/rateLimit";
import { requireAdmin } from "@/lib/auth/adminGuard";
import { adminLoginSchema } from "@/lib/validation/admin";
import { fieldErrorsFromZod } from "@/lib/validation";

const GENERIC_ERROR = "Invalid email or password";

export async function adminLogin(_previousState, formData) {
  const parsed = adminLoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, message: "Check the highlighted fields.", errors: fieldErrorsFromZod(parsed.error) };

  let authenticatedAdminId = null;
  try {
    const { email, password } = parsed.data;
    const key = await loginRateLimitKey(email);
    if (isRateLimited(key)) return { ok: false, message: GENERIC_ERROR, errors: {} };
    const record = await admins.findAuthByEmail(email);
    const valid = record ? await bcrypt.compare(password, record.passwordHash) : false;
    if (!valid || record.role !== "lawyer") {
      recordLoginFailure(key);
      return { ok: false, message: GENERIC_ERROR, errors: {} };
    }
    clearLoginFailures(key);
    await setAdminSession(record.id);
    authenticatedAdminId = record.id;
  } catch (error) {
    console.error("Admin login failed:", error.message);
    return { ok: false, message: "Staff login is temporarily unavailable.", errors: {} };
  }

  if (authenticatedAdminId) redirect("/admin");
  return { ok: false, message: GENERIC_ERROR, errors: {} };
}

export async function adminLogout() {
  await requireAdmin();
  await clearAdminSession();
  redirect("/admin/login");
}
