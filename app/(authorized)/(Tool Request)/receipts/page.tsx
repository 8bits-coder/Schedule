"use client";

import { DeliveryReceiptType, GetDeliveryReceipts } from "@/actions/deliveryActions";
import { useState, useEffect } from "react";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<DeliveryReceiptType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    async function fetchReceipts() {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const receipts = await GetDeliveryReceipts(); // Replace with actual API call
      setReceipts(receipts);
      setLoading(false);
    }
    fetchReceipts();
  }, []);

  if (loading) {
    return <div className="p-8">Loading receipts...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Receipts</h1>

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
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{receipt.deliveryDate}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {receipt.receivedPersonTitle} {receipt.receivedPerson?.name}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">{receipt.workLocation?.name}</td>
                <td className="border border-gray-300 px-4 py-2">{receipt.item?.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{receipt.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{receipt.itemSerialNumber}</td>
                {/* <td className="border border-gray-300 px-4 py-2 text-center">
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      receipt.workLocationId === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {receipt.itemSerialNumber}
                  </span>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {receipts.length === 0 && <p className="text-center text-gray-500 mt-4">No receipts found.</p>}
    </div>
  );
}
