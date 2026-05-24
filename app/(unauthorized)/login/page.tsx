"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, useForm } from "react-hook-form";
import { Schema, LoginSchema } from "./schema";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/components/context/AuthContext";

export default function LoginPage() {
  const { login, isRequestSubmitting, loginError } = useAuth();
  const form = useForm<Schema>({
    mode: "onChange",
    resolver: valibotResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: Schema) => {
    login(data.email, data.password);
  };

  return (
    <div className="min-w-4/5 grid justify-items-center place-content-center">
      <Card className={`w-full min-w-md ${loginError ? "animate-shake" : ""}`}>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-email">Email</FieldLabel>
                    <Input {...field} id="form-rhf-demo-email" aria-invalid={fieldState.invalid} placeholder="john@example.com" autoComplete="off" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="space-y-2">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-password">Password</FieldLabel>
                    <Input {...field} id="form-rhf-demo-password" type="password" aria-invalid={fieldState.invalid} placeholder="••••••••" autoComplete="off" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            {loginError && <div className="bg-red-100 p-3 rounded-lg text-red-500 mb-4">{loginError}</div>}
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isRequestSubmitting}>
                {isRequestSubmitting ? "Signing in..." : "Sign In"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => form.reset()}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* Shake keyframe via inline style tag */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  );
}
