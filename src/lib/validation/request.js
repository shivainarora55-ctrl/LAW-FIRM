import { z } from "zod";
import { REQUEST_TYPES } from "@/constants/portal";

export const requestSchema = z.object({
  type: z.string().refine((value) => REQUEST_TYPES.includes(value), "Choose a request type."),
  matterId: z.string().trim(),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(1000, "Message must be 1000 characters or fewer."),
});
