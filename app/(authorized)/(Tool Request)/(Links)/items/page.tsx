"use server";

import ContentWrapper from "@/components/custom_ui/BodyWrapper";
import ItemForm from "./form";
import ShowAllItems from "./items";

export default async function ItemsPage() {
  return (
    <ContentWrapper>
      <ItemForm />
      <ShowAllItems />
    </ContentWrapper>
  );
}
