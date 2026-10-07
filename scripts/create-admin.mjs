import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

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

    const admins = await readAdmins();
    const existingIndex = admins.findIndex((admin) => admin.email === email);
    if (existingIndex >= 0) {
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
    const record = existingIndex >= 0
      ? { ...admins[existingIndex], name, email, role: "lawyer", passwordHash }
      : { id: randomUUID(), name, email, role: "lawyer", passwordHash, createdAt: now };
    admins[existingIndex >= 0 ? existingIndex : admins.length] = record;
    await writeAdminsAtomically(admins);
    console.log(`Admin ${existingIndex >= 0 ? "password updated" : "created"} for ${email}.`);
  } finally {
    prompt.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
