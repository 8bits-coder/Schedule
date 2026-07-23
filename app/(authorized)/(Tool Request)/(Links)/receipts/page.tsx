import { FetchAllDeliveryReceipts } from "@/actions/deliveryActions";
import ContentWrapper from "@/components/custom_ui/BodyWrapper";
import { Spinner } from "@/components/ui/spinner";

export default async function ReceiptsPage() {
  const { data, serverError } = await FetchAllDeliveryReceipts();

  if (serverError) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-500">{serverError}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <ContentWrapper>
      <h1 className="text-3xl font-bold mb-6">Receipts</h1>

      {data.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">No receipts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Received Person</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Work Location</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Serial Number</th>
              </tr>
            </thead>
            <tbody>
              {data.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{receipt.deliveryDate}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {receipt.receivedPerson?.name} - ({receipt.receivedPersonTitle})
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{receipt.workLocation?.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{receipt.item?.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{receipt.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{receipt.itemSerialNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ContentWrapper>
  );
}
