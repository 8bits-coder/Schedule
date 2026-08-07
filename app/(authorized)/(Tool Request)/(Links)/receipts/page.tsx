import { DeliveryReceiptTypeData, FetchAllDeliveryReceipts } from "@/actions/deliveryActions";
import ContentWrapper from "@/components/custom_ui/BodyWrapper";
import { Spinner } from "@/components/ui/spinner";
import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        <TableActions data={data} />
      )}
    </ContentWrapper>
  );
}

function TableActions({ data }: { data: DeliveryReceiptTypeData }) {
  return (
    <Table className="border bg-white">
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Received Person</TableHead>
          <TableHead>Work Location</TableHead>
          <TableHead>Item</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Serial Number</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data!.map((receipt) => (
          <TableRow>
            <TableCell className="font-medium">{receipt.deliveryDate}</TableCell>
            <TableCell>
              {receipt.receivedPerson?.name} ({receipt.receivedPersonTitle})
            </TableCell>
            <TableCell>{receipt.workLocation?.name}</TableCell>
            <TableCell>{receipt.item?.name}</TableCell>
            <TableCell>{receipt.quantity}</TableCell>
            <TableCell>{receipt.itemSerialNumber}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
