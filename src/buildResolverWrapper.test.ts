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
  const withDelay = buildResolverWrapper(async () => await delay(200));

  const handler = http.get(
    defaultUrl,
    withDelay(() => HttpResponse.text("hello world"))
  );
  server.use(handler);
  expect((await fetch(defaultUrl)).status).toBe(200);
});

it("TEMP: Even without access to request object, short-circuit responses work", async () => {
  const withDelay = buildResolverWrapper(async () => HttpResponse.text("pre"));

  const handler = http.get(
    defaultUrl,
    withDelay(() => HttpResponse.text("hello world"))
  );
  server.use(handler);
  const response = await fetch(defaultUrl);
  expect(await response.text()).toBe("pre");
});

it("works with validation", async () => {
  const isHelloWorld = (value: unknown): value is { hello: "world" } => {
    return (
      typeof value === "object" &&
      value !== null &&
      "hello" in value &&
      value.hello === "world"
    );
  };
  const withValidation = buildResolverWrapper(async ({ request }) => {
    const body = await request.clone().json();
    if (!isHelloWorld(body)) {
      return HttpResponse.text("Invalid body");
    }
  });

  const handler = http.post(
    defaultUrl,
    withValidation(async () => {
      return HttpResponse.text("hello world");
    })
  );
  server.use(handler);
  const response = await fetch(defaultUrl, {
    method: "POST",
    body: JSON.stringify({ hello: "world" }),
  });
  expect(await response.text()).toBe("hello world");

  const response2 = await fetch(defaultUrl, {
    method: "POST",
    body: JSON.stringify({ hello: "not world" }),
  });
  expect(await response2.text()).toBe("Invalid body");
});
