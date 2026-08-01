import { describe, it, expect, test } from "vitest";
import app from "../../route";

// Always test both GET and HEAD responses
describe("GET /api/items", () => {
  it("should return a list of items", async () => {
    const res = await app.request("/api/items");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual("list items");
  });
});

describe("POST /api/items", () => {
  it("should create an item", async () => {
    const res = await app.request("/api/items", {
      method: "POST",
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toEqual("create an item");
  });
});

test("GET /api/items/:id", async () => {
  const res = await app.request("/api/items/123");
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data).toEqual("get ItemID: 123");
});
