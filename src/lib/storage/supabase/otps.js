import "server-only";
import { randomUUID } from "node:crypto";
import { db, execute } from "./shared";

function otpRow(record) {
  return { email: record.email, code_hash: record.codeHash, attempts: record.attempts, expires_at: record.expiresAt, last_sent_at: record.lastSentAt };
}

function mapOtp(row) {
  return { email: row.email, codeHash: row.code_hash, attempts: row.attempts, expiresAt: row.expires_at, lastSentAt: row.last_sent_at };
}

export async function getOtp(email) {
  const rows = await findOtpRows(email);
  return rows[0] ? mapOtp(rows[0]) : null;
}

function findOtpRows(email) {
  return execute(db().from("email_otps").select("*").ilike("email", email).order("created_at", { ascending: false }).limit(1), "otps.getOtp");
}

export async function saveOtp(record) {
  const inserted = await execute(db().from("email_otps").insert({ id: randomUUID(), ...otpRow(record) }).select("id").single(), "otps.saveOtp");
  await execute(db().from("email_otps").delete().ilike("email", record.email).neq("id", inserted.id), "otps.saveOtp.replace");
  return true;
}

export async function updateOtp(email, updater) {
  const rows = await findOtpRows(email);
  if (!rows[0]) return null;
  const updated = updater(mapOtp(rows[0]));
  await execute(db().from("email_otps").update(otpRow(updated)).eq("id", rows[0].id), "otps.updateOtp");
  return updated;
}

export async function deleteOtp(email) {
  await execute(db().from("email_otps").delete().ilike("email", email), "otps.deleteOtp");
  return true;
}
