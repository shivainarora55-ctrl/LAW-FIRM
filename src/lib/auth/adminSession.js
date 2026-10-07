import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env";

export const ADMIN_SESSION_COOKIE = "lf_admin_session";
const ISSUER = "lawfirm-site";
const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

function adminKey() {
  const secret = getEnv().ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is required. Set it in .env.local.");
  return new TextEncoder().encode(secret);
}

export async function setAdminSession(adminId) {
  const token = await new SignJWT({ sub: adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience("admin")
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_SECONDS}s`)
    .sign(adminKey());
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
}

export async function readAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, adminKey(), { algorithms: ["HS256"], issuer: ISSUER, audience: "admin" });
    return typeof payload.sub === "string" ? { adminId: payload.sub } : null;
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}
