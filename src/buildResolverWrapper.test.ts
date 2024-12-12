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
  const withDelay = buildResolverWrapper(async (ms: number) => await delay(ms))(
    200
  );

  const handler = http.get(
    defaultUrl,
    withDelay(({ request }) => HttpResponse.text("hello world"))
  );
  server.use(handler);
  expect((await fetch(defaultUrl)).status).toBe(200);
});

it("Enables short-circuit responses (e.g. for validations)", async () => {
  const isHelloWorld = (body: unknown): body is { hello: "world" } => {
    return (
      typeof body === "object" &&
      body !== null &&
      "hello" in body &&
      body.hello === "world"
    );
  };

  const withValidation = buildResolverWrapper(() => async ({ request }) => {
    const body = await request.clone().json();
    if (!isHelloWorld(body)) {
      return HttpResponse.text("Invalid body", { status: 400 });
    }
  });

  server.use(
    http.post(
      defaultUrl,
      withValidation(async () => {
        return HttpResponse.text("Hello, world!");
      })
    )
  );
});
