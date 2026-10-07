import "server-only";
import { readJson, updateJson } from "./jsonFile";

const FILE = "admins.json";

function publicAdmin(admin) {
  if (!admin) return null;
  const result = { ...admin };
  delete result.passwordHash;
  return result;
}

export async function list() {
  return (await readJson(FILE)).map(publicAdmin);
}

export async function findById(id) {
  return publicAdmin((await readJson(FILE)).find((admin) => admin.id === id));
}

export async function findAuthByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const admin = (await readJson(FILE)).find((entry) => entry.email === normalizedEmail);
  return admin ? { id: admin.id, name: admin.name, email: admin.email, role: admin.role, passwordHash: admin.passwordHash } : null;
}

export function update(id, patchFn) {
  return updateJson(FILE, [], async (admins) => {
    let updated = null;
    const nextAdmins = await Promise.all(admins.map(async (admin) => {
      if (admin.id !== id) return admin;
      updated = await patchFn({ ...admin });
      return updated;
    }));
    return { data: nextAdmins, result: publicAdmin(updated) };
  });
}
