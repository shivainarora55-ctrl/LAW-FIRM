import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user: user ? { name: user.name, email: user.email } : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
