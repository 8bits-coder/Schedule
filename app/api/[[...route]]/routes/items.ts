import { requireAuthenticatedUserId } from "@/actions/user";
import prisma from "@/lib/prisma";
import { Hono } from "hono";

const app = new Hono();

const items = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
  { id: 3, name: "Item 3" },
];

app.get("/", (c) => c.json({ message: "list items", items }));
app.post("/", (c) => c.json({ message: "create an item" }, 201));
app.get("/:id", (c) => c.json({ message: `get ItemID: ${c.req.param("id")}` }));

app.post("/receipt", async (c) => {
  const formData = await c.req.json();
  const userId = await requireAuthenticatedUserId();

  const result = await prisma.deliveryReceipt.create({
    data: {
      itemId: formData.itemId,
      itemSerialNumber: formData.itemSerialNumber,
      workLocationId: formData.workLocationId,
      quantity: formData.quantity,
      receivedPersonId: formData.receivedPersonId,
      receivedPersonTitle: formData.receivedPersonTitle,
      deliveryPersonId: userId,
      deliveryDate: formData.deliveryDate,
    },
  });

  return c.json(result, 201);
});

export default app;
