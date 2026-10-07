import { NextResponse } from "next/server";
import { fileStore } from "@/lib/storage";

export async function GET(_request, { params }) {
  const { file } = await params;
  if (!/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/i.test(file)) return NextResponse.json({ message: "Image not found." }, { status: 404 });
  try {
    const bytes = await fileStore.readBlogImage(file);
    const mimeType = file.endsWith(".png") ? "image/png" : file.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return new Response(bytes, { headers: { "Content-Type": mimeType, "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return NextResponse.json({ message: "Image not found." }, { status: 404 });
  }
}
