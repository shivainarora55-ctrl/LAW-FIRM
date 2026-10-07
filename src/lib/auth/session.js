import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env";

export const SESSION_COOKIE = "lf_session";
export const REGISTRATION_COOKIE = "registration";
const ISSUER = "lawfirm-site";
const SESSION_AGE_SECONDS = 7 * 24 * 60 * 60;
const REGISTRATION_AGE_SECONDS = 15 * 60;

function signingKey() {
  const secret = getEnv().SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required. Add a 32-byte hex secret to .env.local.");
  return new TextEncoder().encode(secret);
}

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

async function signClaims(claims, lifetime, audience = "client") {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(`${lifetime}s`)
    .sign(signingKey());
}

export async function setSessionCookie(userId) {
  const token = await signClaims({ sub: userId, purpose: "session" }, SESSION_AGE_SECONDS);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(SESSION_AGE_SECONDS));
}

export async function setRegistrationCookie(registration) {
  const token = await signClaims({ ...registration, purpose: "registration" }, REGISTRATION_AGE_SECONDS, "client");
  (await cookies()).set(REGISTRATION_COOKIE, token, cookieOptions(REGISTRATION_AGE_SECONDS));
}

async function verifyToken(token, audience, purpose) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"], issuer: ISSUER, audience });
    return payload.purpose === purpose ? payload : null;
  } catch {
    return null;
  }
}

export async function readSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = await verifyToken(token, "client", "session");
  return typeof payload?.sub === "string" ? { userId: payload.sub } : null;
}

export async function readRegistration() {
  const token = (await cookies()).get(REGISTRATION_COOKIE)?.value;
  const payload = await verifyToken(token, "client", "registration");
  if (typeof payload?.email !== "string" || typeof payload?.name !== "string" || typeof payload?.phone !== "string") return null;
  return { email: payload.email, name: payload.name, phone: payload.phone };
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(REGISTRATION_COOKIE);
}

export async function clearRegistrationCookie() {
  (await cookies()).delete(REGISTRATION_COOKIE);
}
