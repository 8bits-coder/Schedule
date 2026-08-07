import { RetrieveDeliveryEntities } from "@/actions/deliveryActions";
import DeliveryForm from "./delivery-form";

export default async function DeliveryPage() {
  const { users, items, workLocations } = await RetrieveDeliveryEntities();

  return <DeliveryForm users={users} items={items} workLocations={workLocations} />;
}
