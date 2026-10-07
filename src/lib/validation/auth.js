import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
});

export const registrationStartSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100, "Name must be 100 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(24, "Phone number is too long.").regex(/^[+()\d\s.-]+$/, "Enter a valid phone number."),
});

export const otpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export const passwordSchema = z.string()
  .min(8, "Use at least 8 characters.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/\d/, "Include at least one number.");

export const completeRegistrationSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

export const registrationSchema = registrationStartSchema.extend({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Enter your password."),
});
