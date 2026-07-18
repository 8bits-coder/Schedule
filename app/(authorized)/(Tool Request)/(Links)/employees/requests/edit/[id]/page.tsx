"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminGetTimeOffRequestById, adminUpdateTimeOffRequestById } from "@/actions/timeOffActions";
import { TimeOffStatus, TimeOffType } from "@/prisma/generated/prisma/enums";
import { TimeOffRequest } from "@/prisma/generated/prisma/browser";
import { authClient } from "@/lib/auth-client";

export default function EditTimeOffRequestPage() {
  const params = useParams();
  const router = useRouter();
  const userName = authClient.useSession().data?.user.name;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<TimeOffRequest>({} as TimeOffRequest);

  const id = params.id as string;

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await adminGetTimeOffRequestById(id);
        if (!response) throw new Error("Failed to fetch request");
        setFormData(response);
      } catch (error) {
        toast.error("Failed to load time off request");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRequest();
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await adminUpdateTimeOffRequestById(id, formData);

      if (!response) throw new Error("Failed to update request");

      toast.success("Time off request updated successfully");

      router.back();
    } catch (error) {
      toast.error("Failed to update time off request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!formData) {
    return <div className="flex justify-center items-center min-h-screen">Request not found</div>;
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Time Off Request</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Request Type</label>
            <select
              name="type"
              value={formData.type || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded">
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
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate ? new Date(formData.startDate).toISOString().split("T")[0] : ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate ? new Date(formData.endDate).toISOString().split("T")[0] : ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Total hours</label>
          <input
            name="hours"
            type="number"
            value={formData.hours || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded">
              {Object.values(TimeOffStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Approved By</label>
            <input
              type="text"
              name="reviewedBy"
              disabled
              value={userName || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reason</label>
          <textarea
            name="reason"
            value={formData.reason || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Review Note</label>
          <textarea
            name="reviewNote"
            value={formData.reviewNote || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex gap-4 justify-end">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
