"use client";

import { adminGetTimeOffRequestById, adminUpdateTimeOffRequestById } from "@/actions/timeOffActions";
import ContentWrapper from "@/components/custom_ui/BodyWrapper";
import { TimeOffStatus, TimeOffType } from "@/prisma/generated/prisma/browser";
import React from "react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { getFieldErrors } from "@/utility/Errors";
import { FieldErrors, TimeOffFormValues } from "@/utility/schema/timeOffRequestSchema";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Links } from "@/utility/classes/Links";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const initialForm: TimeOffFormValues = {
  type: "VACATION",
  startDate: "",
  endDate: "",
  hours: "",
  reason: "",
  status: "PENDING",
  reviewNote: "",
  reviewedBy: "",
};

function parseLocalDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function countCalendarDays(startValue: string, endValue: string) {
  const start = parseLocalDate(startValue);
  const end = parseLocalDate(endValue);

  if (!start || !end || start > end) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

  return Math.floor((endTime - startTime) / msPerDay) + 1;
}

function getNextDay(value: string) {
  const date = parseLocalDate(value);

  if (!date) return null;

  const cursor = new Date(date);
  cursor.setDate(cursor.getDate() + 1);

  return cursor;
}

function formatDisplayDate(value: string) {
  const date = parseLocalDate(value);

  if (!date) return "Not selected";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDisplayDateFromDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatDays(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function EditTimeOffRequestPage() {
  const [form, setForm] = React.useState<TimeOffFormValues>(initialForm);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const userName = authClient.useSession().data?.user.name;

  const { isExecuting, executeAsync, hasSucceeded } = useAction(adminUpdateTimeOffRequestById, {
    onSuccess: () => {
      toast.success(`Request submitted successfully.`);
      router.push(Links["All Requests"]);
    },
    onError(args) {
      if (args.error?.validationErrors) {
        console.log("Validation errors:", args.error.validationErrors);
        setFieldErrors(getFieldErrors({ validationErrors: args.error.validationErrors }));
      }

      if (args.error?.serverError) toast.error(args.error.serverError);
    },
  });

  const dateError = React.useMemo(() => {
    if (!form.startDate || !form.endDate) return "";

    const start = parseLocalDate(form.startDate);
    const end = parseLocalDate(form.endDate);

    if (!start || !end) return "Enter valid start and end dates.";
    if (start > end) return "The end date must be on or after the start date.";

    return "";
  }, [form.startDate, form.endDate]);

  const duration = React.useMemo(() => countCalendarDays(form.startDate, form.endDate), [form.endDate, form.startDate]);

  const estimatedHours = duration > 0 ? duration * 8 : 0;

  const updateField = <K extends keyof TimeOffFormValues>(field: K, value: TimeOffFormValues[K]) => {
    setFieldErrors((current) => ({ ...current, [field]: value ? "" : current[field] }));
    setForm((current) => ({ ...current, [field]: value }));
  };

  const getInputStateClassName = (field: keyof TimeOffFormValues, extraClassName = "") => {
    const invalidClassName = fieldErrors[field]
      ? "border border-rose-500! bg-rose-50! text-rose-900! placeholder:text-rose-300! focus:border-rose-500! focus:ring-rose-500/20!"
      : "";

    return `${inputClassName}${invalidClassName}${extraClassName ? ` ${extraClassName}` : ""}`;
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeAsync({ requestId: params.id as string, formData: form });
  };

  const returnDate = getNextDay(form.endDate);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, serverError } = await adminGetTimeOffRequestById({ requestId: params.id as string });
      if (serverError) {
        toast.error("Failed to load time off request");
      }
      if (data) {
        setForm({
          ...data,
          startDate: data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : "",
          type: data.type || "",
          hours: data.hours || "",
          reason: data.reason || "",
        });
      }
    };
    fetchData().finally(() => setLoading(false));
  }, [params.id, toast]);

  if (!params.id || !form) {
    return <div>Invalid request ID</div>;
  }

  if (loading) return null;

  return (
    <ContentWrapper>
      <div className="max-w-4xl mx-auto py-4 text-slate-900">
        {hasSucceeded && (
          <div
            aria-live="polite"
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            Request prepared successfully for {form.hours ?? 0} hours. Connect the submit handler to the API or workflow
            when ready.
          </div>
        )}

        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <SectionCard
              title="Request details"
              subtitle="Choose the leave type, define the schedule, and submit the request.">
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Start date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => updateField("startDate", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.startDate)}
                    className={getInputStateClassName("startDate")}
                  />
                  {fieldErrors.startDate ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.startDate}</p> : null}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">End date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => updateField("endDate", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.endDate)}
                    className={getInputStateClassName("endDate")}
                  />
                  {fieldErrors.endDate ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.endDate}</p> : null}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Leave type</label>
                  <select
                    value={form.type}
                    onChange={(event) => updateField("type", event.target.value as TimeOffType)}
                    aria-invalid={Boolean(fieldErrors.type)}
                    className={getInputStateClassName("type")}>
                    {Object.values(TimeOffType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.type && <p className="mt-2 text-xs text-rose-600">{fieldErrors.type}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Total hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.hours}
                    onChange={(event) => updateField("hours", event.target.value)}
                    placeholder="8"
                    aria-invalid={Boolean(fieldErrors.hours)}
                    className={getInputStateClassName("hours")}
                  />
                  {fieldErrors.hours && <p className="mt-2 text-xs text-rose-600">{fieldErrors.hours}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select
                    name="status"
                    value={form.status || ""}
                    onChange={(event) => updateField("status", event.target.value as TimeOffStatus)}
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
                  <label className="text-sm font-medium text-slate-700">Approved By</label>
                  <input
                    type="text"
                    name="reviewedBy"
                    disabled
                    value={userName || ""}
                    className={getInputStateClassName(
                      "reviewedBy",
                      "disabled:text-gray-500 disabled:cursor-not-allowed",
                    )}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Note for manager</label>
                  <textarea
                    value={form.reason}
                    onChange={(event) => updateField("reason", event.target.value)}
                    rows={3}
                    disabled
                    placeholder="Optional context or scheduling notes."
                    aria-invalid={Boolean(fieldErrors.reason)}
                    className={getInputStateClassName("reason", "disabled:text-gray-500 disabled:cursor-not-allowed")}
                  />
                  {fieldErrors.reason && <p className="mt-2 text-xs text-rose-600">{fieldErrors.reason}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-green-700">Review Note (optional)</label>
                  <textarea
                    name="reviewNote"
                    value={form.reviewNote || ""}
                    onChange={(event) => updateField("reviewNote", event.target.value)}
                    rows={3}
                    className={getInputStateClassName("reviewNote", "border-green-700!")}
                  />
                  {fieldErrors.reviewNote ? (
                    <p className="mt-2 text-xs text-rose-600">{fieldErrors.reviewNote}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Request timing</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Duration is calculated in calendar days, including weekends.
                    </p>
                  </div>
                  <div className="text-sm text-slate-700">
                    {form.startDate && form.endDate
                      ? `${formatDisplayDate(form.startDate)} → ${formatDisplayDate(form.endDate)}`
                      : "Select a date range"}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  {dateError ? (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                      {dateError}
                    </span>
                  ) : null}
                  {!dateError && duration > 0 && returnDate ? (
                    <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">
                      Return date: {formatDisplayDateFromDate(returnDate)}
                    </span>
                  ) : null}
                  {!dateError &&
                  duration > 0 &&
                  (estimatedHours < Number(form.hours) || estimatedHours > Number(form.hours)) ? (
                    <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-pink-700">
                      Estimated hours for {duration} {duration > 1 ? "days" : "day"}: {estimatedHours}{" "}
                      {estimatedHours > 1 ? "hours" : "hour"}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Submission status:{" "}
                  <span className="font-medium text-slate-700">
                    {isExecuting ? "Submitting" : hasSucceeded ? "Submitted" : "Ready"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isExecuting}
                    className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70">
                    {isExecuting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </SectionCard>
          </form>
        </div>
      </div>
    </ContentWrapper>
  );
}
