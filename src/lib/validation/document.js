import { z } from "zod";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/constants/portal";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

export const documentSchema = z.object({
  originalName: z.string().trim().min(1).max(255),
  extension: z.string().toLowerCase().refine((value) => ALLOWED_UPLOAD_TYPES.includes(value), "Choose a PDF, DOC, DOCX, JPG, JPEG or PNG file."),
  mimeType: z.string().refine((value) => allowedMimeTypes.has(value), "The file type is not supported."),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "Files must be 4 MB or smaller."),
  matterId: z.string().trim(),
}).refine((value) => {
  const pairs = {
    pdf: ["application/pdf"],
    doc: ["application/msword"],
    docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
  };
  return pairs[value.extension]?.includes(value.mimeType) ?? false;
}, { path: ["mimeType"], message: "The file extension and content type do not match." });
