import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const dataDirectory = resolve(process.cwd(), process.env.DATA_DIR || "./data");
const adminsPath = join(dataDirectory, "admins.json");

// Keep this record schema in sync with src/lib/storage/admins.js.
function validPassword(password) {
  return password.length >= 10 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

async function readAdmins() {
  try {
    const parsed = JSON.parse(await readFile(adminsPath, "utf8"));
    if (!Array.isArray(parsed)) throw new Error("admins.json must contain a JSON array.");
    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw new Error(`Could not read ${adminsPath}: ${error.message}`);
  }
}

async function writeAdminsAtomically(admins) {
  await mkdir(dirname(adminsPath), { recursive: true });
  const temporaryPath = `${adminsPath}.${randomUUID()}.tmp`;
  const handle = await open(temporaryPath, "wx");
  try {
    await handle.writeFile(JSON.stringify(admins, null, 2), "utf8");
    await handle.sync();
    await handle.close();
    await rename(temporaryPath, adminsPath);
  } catch (error) {
    await handle.close().catch(() => {});
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
}

function readHidden(prompt) {
  return new Promise((resolvePassword, reject) => {
    stdout.write(prompt);
    const input = stdin;
    let password = "";
    const wasRaw = Boolean(input.isTTY && input.isRaw);
    if (input.isTTY) input.setRawMode(true);
    input.resume();
    const onData = (chunk) => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") {
          finish();
          reject(new Error("Cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          resolvePassword(password);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          password = password.slice(0, -1);
          continue;
        }
        if (character >= " ") {
          password += character;
          stdout.write("*");
        }
      }
    };
    function finish() {
      input.removeListener("data", onData);
      if (input.isTTY) input.setRawMode(wasRaw);
      stdout.write("\n");
    }
    input.on("data", onData);
  });
}

async function main() {
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    const name = (await prompt.question("Lawyer name: ")).trim();
    const email = (await prompt.question("Lawyer email: ")).trim().toLowerCase();
    prompt.close();
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid name and email address.");

    const driver = process.env.STORAGE_DRIVER || "json";
    if (!["json", "supabase"].includes(driver)) throw new Error("STORAGE_DRIVER must be json or supabase.");
    let supabase;
    if (driver === "supabase") {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required when STORAGE_DRIVER=supabase.");
      supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    }
    const admins = driver === "json" ? await readAdmins() : null;
    let existingIndex = driver === "json" ? admins.findIndex((admin) => admin.email === email) : -1;
    let existingAdmin = existingIndex >= 0 ? admins[existingIndex] : null;
    if (driver === "supabase") {
      const { data, error } = await supabase.from("admins").select("id,name,email,role,password_hash,created_at").ilike("email", email).limit(1);
      if (error) throw new Error("Could not look up the lawyer in Supabase.");
      existingAdmin = data[0] ? { id: data[0].id, name: data[0].name, email: data[0].email, role: data[0].role, passwordHash: data[0].password_hash, createdAt: data[0].created_at } : null;
    }
    if (existingAdmin) {
      const confirmPrompt = createInterface({ input: stdin, output: stdout });
      const confirmation = await confirmPrompt.question(`An admin already exists for ${email}. Update this password? (y/N) `);
      confirmPrompt.close();
      if (confirmation.trim().toLowerCase() !== "y") {
        console.log("No changes made.");
        return;
      }
    }

    let password = await readHidden("Password (hidden): ");
    if (!validPassword(password)) throw new Error("Password must be at least 10 characters and include a letter and a number.");

    const passwordHash = await bcrypt.hash(password, 12);
    password = "";
    const now = new Date().toISOString();
    const record = existingAdmin
      ? { ...existingAdmin, name, email, role: "lawyer", passwordHash }
      : { id: randomUUID(), name, email, role: "lawyer", passwordHash, createdAt: now };
    if (driver === "json") {
      admins[existingIndex >= 0 ? existingIndex : admins.length] = record;
      await writeAdminsAtomically(admins);
    } else {
      const databaseRecord = { name: record.name, email: record.email, role: "lawyer", password_hash: record.passwordHash };
      const result = existingAdmin
        ? await supabase.from("admins").update(databaseRecord).eq("id", existingAdmin.id)
        : await supabase.from("admins").insert({ id: record.id, ...databaseRecord });
      if (result.error) {
        console.error("Supabase admin write failed", { code: result.error.code || "unknown" });
        if (result.error.code === "23505") throw new Error("A lawyer already exists for this email.");
        if (result.error.code === "23503") throw new Error("A related record is unavailable.");
        throw new Error("Could not save the lawyer to Supabase.");
      }
    }
    console.log(`Admin ${existingAdmin ? "password updated" : "created"} for ${email}.`);
  } finally {
    prompt.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
