"use client";

import { toast } from "sonner";

type SubmitAction = (formData: FormData) => Promise<unknown>;

type CreateFormSubmitHandlerOptions = {
  action: SubmitAction;
  successMessage: string;
  errorPrefix: string;
  onSuccess?: () => void;
};

export function createFormSubmitHandler({
  action,
  successMessage,
  errorPrefix,
  onSuccess,
}: CreateFormSubmitHandlerOptions) {
  return async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      await action(formData);
      toast.success(successMessage);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorPrefix + errorMessage);
    }
  };
}
