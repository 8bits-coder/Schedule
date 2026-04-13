import { pipe, string, nonEmpty, email, object, InferOutput } from "valibot";

export const LoginSchema = object({
  email: pipe(
    string(),
    nonEmpty("Please enter your email."),
    email("The email address is badly formatted."),
  ),
  password: pipe(string(), nonEmpty("Please enter your password.")),
});

export type Schema = InferOutput<typeof LoginSchema>;
