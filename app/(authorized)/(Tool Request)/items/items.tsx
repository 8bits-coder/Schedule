import { GetAllItems, ItemResponse } from "@/actions/itemActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ShowAllItems = async () => {
  const items = await GetAllItems();

  if (!items) {
    return <div>No items found.</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-white rounded-lg shadow border-l-4 border-blue-500">
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
