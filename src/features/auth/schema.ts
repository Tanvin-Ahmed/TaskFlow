import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Enter valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(255, { message: "Password must be less than 255 characters" }),
});

export const signUpSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Enter valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(255, { message: "Password must be less than 255 characters" }),
});
