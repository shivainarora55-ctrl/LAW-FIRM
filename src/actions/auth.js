"use server";

import "server-only";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { users } from "@/lib/storage";
import { clearRegistrationCookie, setSessionCookie } from "@/lib/auth/session";
import { clearLoginFailures, isRateLimited, loginRateLimitKey, recordLoginFailure } from "@/lib/auth/rateLimit";
import { loginSchema, registrationSchema } from "@/lib/validation/auth";
import { fieldErrorsFromZod } from "@/lib/validation";

const EMPTY_ERRORS = {};
const GENERIC_LOGIN_ERROR = "Invalid email or password";

function failure(message, errors = EMPTY_ERRORS) {
  return { ok: false, message, errors };
}

export async function register(_previousState, formData) {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return failure("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));

  let userId = null;
  try {
    const { name, email, phone, password } = parsed.data;
    if (await users.findUserByEmail(email)) return failure("An account already exists for this email. Please log in.", { email: "This email is already registered." });

    const now = new Date().toISOString();
    const result = await users.createUser({
      id: randomUUID(),
      name,
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      emailVerifiedAt: now,
      address: "",
      city: "",
      state: "",
      createdAt: now,
      updatedAt: now,
    });
    if (!result.created) return failure("An account already exists for this email. Please log in.", { email: "This email is already registered." });
    userId = result.user.id;
    await setSessionCookie(userId);
    await clearRegistrationCookie();
  } catch (error) {
    console.error("Account registration failed:", error.message);
    return failure("Registration is temporarily unavailable. Please try again.");
  }
  redirect("/portal");
}

export async function login(_previousState, formData) {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return failure("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));

  let destination = false;
  try {
    const { email, password } = parsed.data;
    const key = await loginRateLimitKey(email);
    if (isRateLimited(key)) return failure(GENERIC_LOGIN_ERROR);

    const authRecord = await users.getAuthRecordByEmail(email);
    const valid = authRecord ? await bcrypt.compare(password, authRecord.passwordHash) : false;
    if (!valid || !authRecord.emailVerifiedAt) {
      recordLoginFailure(key);
      return failure(GENERIC_LOGIN_ERROR);
    }

    clearLoginFailures(key);
    await setSessionCookie(authRecord.id);
    await clearRegistrationCookie();
    destination = true;
  } catch (error) {
    console.error("Login failed:", error.message);
    return failure("Login is temporarily unavailable. Please try again.");
  }

  if (destination) redirect("/portal");
  return failure(GENERIC_LOGIN_ERROR);
}

