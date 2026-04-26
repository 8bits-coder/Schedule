"use server";

import ShowAllItems from "./items";

export default async function ItemsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Items List</h1>
      <ShowAllItems />
    </div>
  );
}
