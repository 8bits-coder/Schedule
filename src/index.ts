import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api", (c) => {
  return c.json({ message: "Hello from the API!" });
});

app.get(
  "/static/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/static/, "/statics"),
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`);
    },
  }),
);

app.notFound((c) => {
  return c.text("Custom 404 Message", 404);
});

app.get("/user/:name", async (c) => {
  const name = c.req.param("name");
  // ...
  return c.text(`Hello, ${name}!`);
});

export default {
  port: 3001,
  fetch: app.fetch,
};
