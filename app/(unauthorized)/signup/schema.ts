import {
  pipe,
  string,
  nonEmpty,
  email,
  object,
  minLength,
  InferOutput,
} from "valibot";

export const SignUpSchema = object({
  name: pipe(
    string("Your name must be a string."),
    nonEmpty("Please enter your full name."),
  ),
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

export type Schema = InferOutput<typeof SignUpSchema>;
