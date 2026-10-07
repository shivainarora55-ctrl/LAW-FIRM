import "server-only";
import { updateJson, readJson } from "./jsonFile";

const FILE = "users.json";

export async function listAll() {
  return (await readJson(FILE)).map(toPublicUser).sort((a, b) => a.name.localeCompare(b.name));
}

export function toPublicUser(user) {
  if (!user) return null;
  const publicUser = { ...user };
  delete publicUser.passwordHash;
  return publicUser;
}

export async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readJson(FILE);
  return toPublicUser(users.find((user) => user.email === normalizedEmail));
}

export async function getAuthRecordByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readJson(FILE);
  const user = users.find((entry) => entry.email === normalizedEmail);
  return user ? { id: user.id, email: user.email, passwordHash: user.passwordHash, emailVerifiedAt: user.emailVerifiedAt } : null;
}

export async function getAuthRecordById(id) {
  const users = await readJson(FILE);
  const user = users.find((entry) => entry.id === id);
  return user ? { id: user.id, email: user.email, passwordHash: user.passwordHash } : null;
}

export async function findUserById(id) {
  const users = await readJson(FILE);
  return toPublicUser(users.find((user) => user.id === id));
}

export function createUser(user) {
  return updateJson(FILE, [], (users) => {
    if (users.some((entry) => entry.email === user.email)) {
      return { data: users, result: { created: false, user: null } };
    }
    const nextUsers = [...users, user];
    return { data: nextUsers, result: { created: true, user: toPublicUser(user) } };
  });
}

export function updateUser(id, changes) {
  return update(id, (user) => ({ ...user, ...changes, id: user.id, email: user.email, passwordHash: user.passwordHash }));
}

export function update(id, patchFn) {
  return updateJson(FILE, [], async (records) => {
    let updated = null;
    const nextUsers = await Promise.all(records.map(async (user) => {
      if (user.id !== id) return user;
      updated = await patchFn({ ...user });
      return updated;
    }));
    return { data: nextUsers, result: toPublicUser(updated) };
  });
}

export function updatePasswordHash(id, passwordHash) {
  return update(id, (user) => ({ ...user, passwordHash, updatedAt: new Date().toISOString() })).then(Boolean);
}
