import { z } from "zod";
import { EXPERTISE } from "@/constants/expertise";
import { PREFERRED_CONTACT_OPTIONS, URGENCY_OPTIONS } from "@/constants/portal";

export const matterSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters.").max(120, "Title must be 120 characters or fewer."),
  practiceArea: z.string().refine((value) => EXPERTISE.some((item) => item.slug === value), "Choose an available practice area."),
  description: z.string().trim().min(20, "Description must be at least 20 characters.").max(3000, "Description must be 3000 characters or fewer."),
  urgency: z.string().refine((value) => URGENCY_OPTIONS.includes(value), "Choose a valid urgency."),
  preferredContact: z.string().refine((value) => PREFERRED_CONTACT_OPTIONS.includes(value), "Choose phone or email."),
  opposingParty: z.string().trim().max(160, "Opposing party must be 160 characters or fewer."),
});
