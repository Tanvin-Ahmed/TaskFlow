import { z } from "zod";

export const updateDocAccessSchema = z.object({
  emails: z
    .array(z.string().trim().email("Invalid email address"))
    .nonempty("At least one email is required"),
  userType: z.enum(["viewer", "editor"]),
  updatedBy: z.string().trim().email("Invalid email address"),
});
