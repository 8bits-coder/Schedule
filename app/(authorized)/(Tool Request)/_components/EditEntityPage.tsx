"use client";

import { executeTask, FunctionName, FunctionResult } from "@/actions/functions";
import BackButton from "@/components/custom/BackButton";
import BodyWrapper from "@/components/custom_ui/BodyWrapper";
import { Spinner } from "@/components/ui/spinner";
import { push } from "@/lib/router";
import { useParams } from "next/navigation";
import { type ChangeEvent, type SubmitEvent, type ReactNode, useEffect, useEffectEvent, useState } from "react";
import { toast } from "sonner";

type EditableEntity = {
  id: string;
  name: string;
};

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

type EditEntityPageProps<T extends EditableEntity> = {
  title: string;
  redirectPath: string;
  saveSuccessMessage: string;
  deleteSuccessMessage: string;
  deleteConfirmationMessage: string;
  loadEntity: { functionName: FunctionName; payload?: FunctionResult<FunctionName> };
  saveEntity: { functionName: FunctionName; payload?: FunctionResult<FunctionName> };
  deleteEntity: { name: FunctionName; payload?: FunctionResult<FunctionName> };
  renderFields: (args: { formData: T; handleChange: (event: FieldChangeEvent) => void; loading: boolean }) => ReactNode;
};

export default function EditEntityPage<T extends EditableEntity>({
  title,
  redirectPath,
  saveSuccessMessage,
  deleteSuccessMessage,
  deleteConfirmationMessage,
  loadEntity,
  saveEntity,
  deleteEntity,
  renderFields,
}: EditEntityPageProps<T>) {
  const params = useParams<{ id: string | string[] }>();
  const idParam = params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [formData, setFormData] = useState<T>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCurrentEntity = useEffectEvent(async () => {
    if (!id) {
      setError("Missing entity id");
      return;
    }

      setError("");
      setFormData(undefined);
      const {data, error} = await executeTask(
        loadEntity?.functionName as FunctionName,
        { id, formData: loadEntity?.payload } as any,
      );
      // const response = await executeTask(funcName as any, { id });
      if (!error) setFormData(data as unknown as T);
      else setError(error);
  });

  useEffect(() => {
    loadCurrentEntity();
  }, [id]);

  function handleChange(event: FieldChangeEvent) {
    const { name, value } = event.target;

    setFormData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [name]: value,
      } as T;
    });
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!formData) {
      setError("Form data is not loaded");
      setLoading(false);
      return;
    }

    const { success, error } = await executeTask(
      saveEntity?.functionName as FunctionName,
      { id: formData.id, name: formData.name, formData: saveEntity?.payload } as any,
    );

    if (success) {
      toast.success(saveSuccessMessage);
      push(redirectPath);
    }

    if (error) setError(error);
    
    setLoading(false);
  }

  async function handleDelete() {
    if (!formData || !confirm(deleteConfirmationMessage)) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await executeTask(deleteEntity.name as FunctionName, { id: formData.id } as any);
      toast.success(deleteSuccessMessage);
      push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BodyWrapper>
      <BackButton />
      <div className="bg-white max-w-lg mx-auto p-8 rounded-lg shadow">
        <div className="flex gap-x-2 items-center">
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
        </div>

        {!formData ? (
          error ? (
            <div className="text-red-600 mb-4">{error}</div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Spinner className="size-8" />
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? <div className="text-red-600">{error}</div> : null}
            {renderFields({ formData, handleChange, loading })}
            <div className="flex gap-x-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-50 ring py-2 rounded-md hover:shadow-md hover:shadow-blue-300 text-blue-600 disabled:opacity-50">
                {loading ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full bg-red-50 ring py-2 rounded-md hover:shadow-md hover:shadow-red-300 text-red-600 disabled:opacity-50">
                Delete
              </button>
            </div>
          </form>
        )}
      </div>
    </BodyWrapper>
  );
}
