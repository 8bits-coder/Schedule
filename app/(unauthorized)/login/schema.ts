import { pipe, string, nonEmpty, email, object, InferOutput } from "valibot";

export const Schema = object({
  email: pipe(
    string(),
    nonEmpty("Please enter your email."),
    email("The email address is badly formatted."),
  ),
  password: pipe(string(), nonEmpty("Please enter your password.")),
});

export type LoginSchema = InferOutput<typeof Schema>;
