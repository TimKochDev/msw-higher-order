import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { buildResolverWrapper } from "./buildResolverWrapper";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer();
const defaultUrl = "http://localhost";

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

it("Works with simple delay", async () => {
  const withDelay = buildResolverWrapper(async () => await delay(200))

  const handler = http.get(
    defaultUrl,
    withDelay(() => HttpResponse.text("hello world"))
  );
  server.use(handler);
  expect((await fetch(defaultUrl)).status).toBe(200);
});

it("TEMP: Even without access to request object, short-circuit responses work", async () => {
  const withDelay = buildResolverWrapper(async () =>
    HttpResponse.text("pre")
  )

  const handler = http.get(
    defaultUrl,
    withDelay(() => HttpResponse.text("hello world"))
  );
  server.use(handler);
  const response = await fetch(defaultUrl);
  expect(await response.text()).toBe("pre");
});
