"use server";

import BodyWrapper from "@/components/custom_ui/BodyWrapper";
import ItemForm from "./form";
import ShowAllItems from "./items";

export default async function ItemsPage() {
  return (
    <BodyWrapper>
      <ItemForm />
      <ShowAllItems />
    </BodyWrapper>
  );
}
