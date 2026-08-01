import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json("list items"));
app.post("/", (c) => c.json("create an item", 201));
app.get("/:id", (c) => c.json(`get ItemID: ${c.req.param("id")}`));

export default app;
