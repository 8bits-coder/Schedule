import { executeTaskFn } from "@/actions/functions";
import { FetchAllItems } from "@/actions/itemActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ShowAllItems = async () => {
  try {
    const response = await executeTaskFn(FetchAllItems);

    if (!response.success || !response.data || response.data.length === 0) {
      return <div className="text-sm text-muted-foreground">No items found.</div>;
    }

    return (
      <div className="space-y-6">
        <p>
          Total: <span className="text-red-600">{response.data.length}</span>{" "}
          {response.data.length === 1 ? "item" : "items"}
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {response.data.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white rounded-lg shadow-md border-l-4 border-indigo-500 flex flex-col justify-between space-y-4">
              <strong className="text-lg text-gray-900">{item.name}</strong>
              <p className="text-gray-600">{item.description}</p>
              <Link href={`/items/edit/${item.id}`}>
                <Button variant="outline" className="w-full">
                  Edit Item
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return <div className="text-sm text-destructive">{error instanceof Error ? error.message : "Unknown error"}</div>;
  }
};

export default ShowAllItems;
