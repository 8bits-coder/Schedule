import { cancelRequestByUserId, getAllTimeOffRequests } from "@/actions/timeOffActions";
import ContentWrapper from "@/components/custom_ui/BodyWrapper";
import { Links } from "@/utility/classes/Links";
import { statusStyles } from "@/utility/Status";
import Link from "next/link";

export default async function TimeRequestPage() {
  const { data: timeOffRequestsData, serverError } = await getAllTimeOffRequests();

  if (serverError) {
    return <div>{serverError || "Failed to fetch time off requests."}</div>;
  }

  if (!timeOffRequestsData) {
    return <div>{"No time off requests found."}</div>;
  }

  return (
    <ContentWrapper>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Time Off Requests</h1>
          <p className="mt-1 text-sm text-gray-500">View all submitted and processed time off requests.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Request Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {timeOffRequestsData.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{request.user.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {request.createdAt.toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      year: "numeric",
                      month: "2-digit",
                      day: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{request.type}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    {request.startDate.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{request.endDate.toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{request.hours}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[request.status]}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-600">{request.reason || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                    <div className="flex">
                      <form
                        action={async () => {
                          "use server";
                          await cancelRequestByUserId(request.id);
                        }}>
                        <button
                          type="submit"
                          className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">
                          Cancel
                        </button>
                      </form>
                      <Link
                        href={Links["All Requests"] + `/edit/${request.id}`}
                        className="ml-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ContentWrapper>
  );
}
