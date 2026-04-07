import {
  pipe,
  string,
  nonEmpty,
  email,
  object,
  minLength,
  InferOutput,
} from "valibot";

export const LoginSchema = object({
  email: pipe(
    string("Your email must be a string."),
    nonEmpty("Please enter your email."),
    email("The email address is badly formatted."),
  ),
  password: pipe(
    string("Your password must be a string."),
    nonEmpty("Please enter your password."),
    minLength(8, "Your password must have 8 characters or more."),
  ),
});

export type Schema = InferOutput<typeof LoginSchema>;
