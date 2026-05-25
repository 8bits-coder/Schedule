"use server";

import ItemForm from "./form";
import ShowAllItems from "./items";

export default async function ItemsPage() {
  return (
    <div className="container mx-auto py-8 not-sm:px-2 space-y-8">
      <ItemForm />
      <ShowAllItems />
    </div>
  );
}
