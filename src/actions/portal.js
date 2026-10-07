"use server";

import "server-only";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { matters, requests, users } from "@/lib/storage";
import { requireUser } from "@/lib/auth";
import { changePasswordSchema, profileSchema } from "@/lib/validation/profile";
import { matterSchema } from "@/lib/validation/matter";
import { requestSchema } from "@/lib/validation/request";
import { fieldErrorsFromZod } from "@/lib/validation";
import { headers } from "next/headers";

function failure(message, errors = {}) {
  return { ok: false, message, errors };
}

function formValue(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function assertActionOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!origin || !host || new URL(origin).host.toLowerCase() !== host.toLowerCase()) {
    throw new Error("Request origin could not be verified.");
  }
}

export async function updateProfile(_previousState, formData) {
  await assertActionOrigin();
  const user = await requireUser();
  try {
    const parsed = profileSchema.safeParse({
      name: formValue(formData, "name"),
      phone: formValue(formData, "phone"),
      address: formValue(formData, "address"),
      city: formValue(formData, "city"),
      state: formValue(formData, "state"),
    });
    if (!parsed.success) return failure("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));
    await users.updateUser(user.id, { ...parsed.data, updatedAt: new Date().toISOString() });
    revalidatePath("/portal");
    revalidatePath("/portal/profile");
    return { ok: true, message: "Your profile has been updated.", errors: {} };
  } catch (error) {
    console.error("Profile update failed:", error.message);
    return failure("We could not update your profile right now.");
  }
}

export async function changePassword(_previousState, formData) {
  await assertActionOrigin();
  const user = await requireUser();
  try {
    const parsed = changePasswordSchema.safeParse({
      currentPassword: formValue(formData, "currentPassword"),
      newPassword: formValue(formData, "newPassword"),
    });
    if (!parsed.success) return failure("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));

    const authRecord = await users.getAuthRecordById(user.id);
    if (!authRecord || !await bcrypt.compare(parsed.data.currentPassword, authRecord.passwordHash)) {
      return failure("The current password is incorrect.", { currentPassword: "The current password is incorrect." });
    }
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await users.updatePasswordHash(user.id, passwordHash);
    return { ok: true, message: "Your password has been changed.", errors: {} };
  } catch (error) {
    console.error("Password change failed:", error.message);
    return failure("We could not change your password right now.");
  }
}

export async function submitMatter(_previousState, formData) {
  await assertActionOrigin();
  const user = await requireUser();
  let createdMatter = null;
  try {
    const parsed = matterSchema.safeParse({
      title: formValue(formData, "title"),
      practiceArea: formValue(formData, "practiceArea"),
      description: formValue(formData, "description"),
      urgency: formValue(formData, "urgency"),
      preferredContact: formValue(formData, "preferredContact"),
      opposingParty: formValue(formData, "opposingParty"),
    });
    if (!parsed.success) return failure("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));

    createdMatter = await matters.createMatter({
      userId: user.id,
      ...parsed.data,
      opposingParty: parsed.data.opposingParty || "",
    });
    revalidatePath("/portal");
    revalidatePath("/portal/submit-matter");
  } catch (error) {
    console.error("Matter submission failed:", error.message);
    return failure("We could not submit your matter right now.");
  }

  if (createdMatter) return { ok: true, message: "Your matter has been submitted.", reference: createdMatter.ref, errors: {} };
  return failure("We could not submit your matter right now.");
}

export async function submitRequest(_previousState, formData) {
  await assertActionOrigin();
  const user = await requireUser();
  try {
    const parsed = requestSchema.safeParse({
      type: formValue(formData, "type"),
      matterId: formValue(formData, "matterId"),
      message: formValue(formData, "message"),
    });
    if (!parsed.success) return failure("Check the highlighted fields.", fieldErrorsFromZod(parsed.error));

    let matterId = null;
    if (parsed.data.matterId) {
      const ownMatter = await matters.findMatterForUser(parsed.data.matterId, user.id);
      if (!ownMatter) return failure("Choose one of your matters.", { matterId: "Choose one of your matters." });
      matterId = ownMatter.id;
    }
    await requests.createRequest({ userId: user.id, matterId, type: parsed.data.type, message: parsed.data.message });
    revalidatePath("/portal/requests");
    revalidatePath("/portal");
    return { ok: true, message: "Your request has been submitted.", errors: {} };
  } catch (error) {
    console.error("Request submission failed:", error.message);
    return failure("We could not submit your request right now.");
  }
}

export async function logout() {
  await assertActionOrigin();
  await requireUser();
  const { clearSessionCookies } = await import("@/lib/auth/session");
  await clearSessionCookies();
  redirect("/login");
}
