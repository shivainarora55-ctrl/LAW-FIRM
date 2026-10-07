import { z } from "zod";
import { passwordSchema } from "./auth";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100, "Name must be 100 characters or fewer."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(24, "Phone number is too long.").regex(/^[+()\d\s.-]+$/, "Enter a valid phone number."),
  address: z.string().trim().max(200, "Address must be 200 characters or fewer."),
  city: z.string().trim().max(100, "City must be 100 characters or fewer."),
  state: z.string().trim().max(100, "State must be 100 characters or fewer."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: passwordSchema,
});
