"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminGetTimeOffRequestById, adminUpdateTimeOffRequestById } from "@/actions/timeOffActions";
import { TimeOffStatus, TimeOffType } from "@/prisma/generated/prisma/enums";
import { authClient } from "@/lib/auth-client";
import Container from "@/components/custom_ui/Container";
import ContentWrapper from "@/components/custom_ui/BodyWrapper";
import { Button } from "@base-ui/react/button";
import { useAction } from "next-safe-action/hooks";
import { FieldErrors, TimeOffFormValues } from "@/utility/schema/timeOffRequestSchema";
import { getFieldErrors } from "@/utility/Errors";
import { Links } from "@/utility/classes/Links";
import { resolve } from "node:dns";

const initialForm: TimeOffFormValues = {
  type: "VACATION",
  startDate: "",
  endDate: "",
  hours: "",
  reason: "",
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export default function EditTimeOffRequestPage() {
  const params = useParams();
  const router = useRouter();
  const userName = authClient.useSession().data?.user.name;
  const [formData, setFormData] = useState<TimeOffFormValues>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const id = params.id as string;

  const { executeAsync, isExecuting } = useAction(adminUpdateTimeOffRequestById, {
    onSuccess: () => {
      toast.success(`Request submitted successfully.`);
      router.push(Links["All Requests"]);
    },
    onError(args) {
      if (args.error?.validationErrors) {
        setFieldErrors(getFieldErrors({ validationErrors: args.error.validationErrors.formData || {} }));
      }

      if (args.error?.serverError) toast.error(args.error.serverError);
    },
  });

  const getInputStateClassName = (field: keyof TimeOffFormValues, extraClassName = "") => {
    const invalidClassName = fieldErrors[field]
      ? "border border-rose-500! bg-rose-50! text-rose-900! placeholder:text-rose-300! focus:border-rose-500! focus:ring-rose-500/20!"
      : "";

    return `${inputClassName}${invalidClassName}${extraClassName ? ` ${extraClassName}` : ""}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data, serverError } = await adminGetTimeOffRequestById({ requestId: id });
      if (serverError) {
        toast.error("Failed to load time off request");
      } else if (data) {
        setFormData({
          ...data,
          startDate: new Date(data.startDate).toISOString().split("T")[0] || "",
          endDate: new Date(data.endDate).toISOString().split("T")[0] || "",
          type: data.type || "",
          hours: data.hours || "",
          reason: data.reason || "",
        });
      }
    };
    fetchData();
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFieldErrors((current) => {
      const updated = { ...current };
      if (value) {
        delete updated[name as keyof FieldErrors];
      }
      return updated;
    });
    setFormData((prev) => (prev ? { ...prev, [name]: value } : ({} as TimeOffFormValues)));
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeAsync({ requestId: id, formData });
  };

  if (!formData) {
    return <div className="flex items-center justify-center min-h-screen">Request not found</div>;
  }

  return (
    <ContentWrapper>
      <Container>
        <h1 className="mb-6 text-3xl font-bold">Edit Time Off Request</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Request Type</label>
              <select
                name="type"
                value={formData.type || ""}
                onChange={handleChange}
                className={getInputStateClassName("type")}>
                {Object.values(TimeOffType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={getInputStateClassName("startDate")}
              />
              {fieldErrors.startDate ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.startDate}</p> : null}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={getInputStateClassName("endDate")}
              />
              {fieldErrors.endDate ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.endDate}</p> : null}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Total hours</label>
            <input
              name="hours"
              type="number"
              value={formData.hours || ""}
              onChange={handleChange}
              className={getInputStateClassName("hours")}
            />
            {fieldErrors.hours ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.hours}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status || ""}
                onChange={handleChange}
                className={getInputStateClassName("status")}>
                {Object.values(TimeOffStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {fieldErrors.status ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.status}</p> : null}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Approved By</label>
              <input
                type="text"
                name="reviewedBy"
                disabled
                value={userName || ""}
                onChange={handleChange}
                className={getInputStateClassName("reviewedBy", "disabled:text-gray-500 disabled:cursor-not-allowed")}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Reason</label>
            <textarea
              name="reason"
              value={formData.reason || ""}
              onChange={handleChange}
              rows={3}
              className={getInputStateClassName("reason")}
            />
            {fieldErrors.reason ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.reason}</p> : null}
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Review Note</label>
            <textarea
              name="reviewNote"
              value={formData.reviewNote || ""}
              onChange={handleChange}
              rows={3}
              className={getInputStateClassName("reviewNote")}
            />
            {fieldErrors.reviewNote ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.reviewNote}</p> : null}
          </div>

          <div className="flex justify-end gap-4">
            <Button onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-gray-100">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isExecuting || Object.keys(fieldErrors).length > 0}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">
              {isExecuting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Container>
    </ContentWrapper>
  );
}
