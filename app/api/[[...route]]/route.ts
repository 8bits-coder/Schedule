import { Hono } from "hono";
import { handle } from "hono/vercel";
import items from "./routes/items";
import users from "./routes/users";

const app = new Hono().basePath("/api");

// app.route("/users", users);
// app.route("/items", items);

const routes = app.route("/users", users).route("/items", items);

app.get("/hello", (c) => {
  return c.json({
    message: "Hello Next.js!",
  });
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export default app;
export type AppType = typeof routes;
