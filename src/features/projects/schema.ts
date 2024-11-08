import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
  workspaceId: z.string().min(1, "WorkspaceId is required"),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Minimum one character required").optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
  docs: z.string().optional(),
  canvas: z.string().optional(),
  isDocCreated: z.string().optional(),
});
