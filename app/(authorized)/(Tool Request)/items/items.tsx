import { GetAllItems } from "@/actions/itemActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ShowAllItems = async () => {
  const items = await GetAllItems();

  if (!items) {
    return <div>No items found.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Items List</h1>
      <p>
        Total: <span className="text-red-600">{items.length}</span> {items.length === 1 ? "item" : "items"}
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-white rounded-lg drop-shadow-lg border-l-4 border-indigo-500 flex flex-col">
            <strong className="text-lg text-gray-900">{item.name}</strong>
            <p className="text-gray-600 mt-1">{item.description}</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Link href={`/items/edit/${item.id}`}>Edit Item</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowAllItems;
