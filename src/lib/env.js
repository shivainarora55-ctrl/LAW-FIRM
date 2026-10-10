import "server-only";
import { z } from "zod";

const optionalValue = z.preprocess((value) => value === "" ? undefined : value, z.string().optional());
const optionalUrl = z.preprocess((value) => value === "" ? undefined : value, z.string().url().optional());

const environmentSchema = z.object({
  STORAGE_DRIVER: z.enum(["json", "supabase"]).default("json"),
  SUPABASE_URL: optionalUrl,
  SUPABASE_SECRET_KEY: optionalValue,
  SESSION_SECRET: optionalValue,
  ADMIN_SESSION_SECRET: optionalValue,
  DATA_DIR: z.string().trim().default("./data"),
  SMTP_HOST: optionalValue,
  SMTP_PORT: z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().int().positive().optional()),
  SMTP_USER: optionalValue,
  SMTP_PASS: optionalValue,
  MAIL_FROM: optionalValue,
});

export function getEnv() {
  const result = environmentSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid environment configuration: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  }

  const env = result.data;
  if (env.STORAGE_DRIVER === "supabase" && (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY)) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required when STORAGE_DRIVER=supabase.");
  }
  if (process.env.NODE_ENV === "production" && !env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required in production. Set it to at least 32 random bytes encoded as hexadecimal.");
  }
  if (env.SESSION_SECRET && !/^(?:[a-fA-F0-9]{2}){32,}$/.test(env.SESSION_SECRET)) {
    throw new Error("SESSION_SECRET must contain at least 32 random bytes encoded as hexadecimal.");
  }
  if (process.env.NODE_ENV === "production" && !env.ADMIN_SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET is required in production for lawyer admin sessions.");
  }
  if (env.ADMIN_SESSION_SECRET && !/^(?:[a-fA-F0-9]{2}){32,}$/.test(env.ADMIN_SESSION_SECRET)) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 random bytes encoded as hexadecimal.");
  }

  return env;
}

export function hasSmtpConfiguration(env = getEnv()) {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.MAIL_FROM);
}
