import "server-only";
import { readJson, updateJson } from "./jsonFile";

const FILE = "otps.json";

export async function getOtp(email) {
  const records = await readJson(FILE);
  return records.find((record) => record.email === email) ?? null;
}

export function saveOtp(record) {
  return updateJson(FILE, [], (records) => ({
    data: [...records.filter((entry) => entry.email !== record.email), record],
    result: true,
  }));
}

export function updateOtp(email, updater) {
  return updateJson(FILE, [], (records) => {
    let result = null;
    const nextRecords = records.map((record) => {
      if (record.email !== email) return record;
      result = updater(record);
      return result;
    });
    return { data: nextRecords, result };
  });
}

export function deleteOtp(email) {
  return updateJson(FILE, [], (records) => ({
    data: records.filter((record) => record.email !== email),
    result: true,
  }));
}
