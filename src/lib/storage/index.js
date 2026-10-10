import "server-only";
import * as json from "./json/index";
import * as supabase from "./supabase/index";

const selectedDriver = process.env.STORAGE_DRIVER === "supabase" ? supabase : json;

export const users = selectedDriver.users;
export const otps = selectedDriver.otps;
export const matters = selectedDriver.matters;
export const documents = selectedDriver.documents;
export const requests = selectedDriver.requests;
export const fileStore = selectedDriver.fileStore;
export const admins = selectedDriver.admins;
export const appointments = selectedDriver.appointments;
export const notes = selectedDriver.notes;
export const posts = selectedDriver.posts;
export const audit = selectedDriver.audit;
