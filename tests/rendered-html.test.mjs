import assert from "node:assert/strict";
import test from "node:test";

const routes = [
  "/",
  "/research-interests",
  "/publications",
  "/notes-talks",
  "/cv",
  "/persona",
];

test("all six routes render only the shared video background", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  for (const route of routes) {
    const response = await worker.fetch(
      new Request(`http://localhost${route}`, {
        headers: { accept: "text/html" },
      }),
      {
        ASSETS: {
          fetch: async () => new Response("Not found", { status: 404 }),
        },
      },
      {
        waitUntil() {},
        passThroughOnException() {},
      },
    );

    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.match(html, /<video\b/i, route);
    assert.match(html, /src=["']\/background\.mp4["']/i, route);
    assert.doesNotMatch(html, /<button\b|<a\b/i, route);
  }
});
