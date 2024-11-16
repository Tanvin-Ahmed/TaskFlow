import { z } from "zod";

export const updateDocAccessSchema = z.object({
  emails: z
    .array(z.string().trim().email("Invalid email address"))
    .nonempty("At least one email is required"),
  userType: z.enum(["viewer", "editor"]),
  updatedBy: z.object({
    name: z.string().trim().min(1, "Updated by name is required"),
    email: z.string().trim().email("Updated by email is required"),
  }),
});
