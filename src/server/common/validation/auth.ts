import * as z from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string({
    required_error: "Password is required."
  }).min(4, { message: "Password must contain at least 4 character(s)." }).max(12, { message: "Password must be 12 or fewer characters long."}),
});

export const signUpSchema = signInSchema.extend({
  name: z.string({
    required_error: "Name is required.",
  }).min(1, { message: "Name is required." }),
});

// not use yet
export type ILogin = z.infer<typeof signInSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;
