import { http, HttpResponse } from "msw";
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { withPreResolver } from "./withPreResolver";
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

it("calls the main resolver when pre-resolver returns undefined", async () => {
  server.use(
    http.get(
      defaultUrl,
      withPreResolver(
        async () => undefined,
        async () => HttpResponse.text("main")
      )
    )
  );
  const response = await fetch(defaultUrl);

  expect(await response.text()).toBe("main");
});

it("returns pre-resolver response when it returns a response", async () => {
  server.use(
    http.get(
      defaultUrl,
      withPreResolver(
        async () => HttpResponse.text("pre"),
        async () => HttpResponse.text("main")
      )
    )
  );
  const response = await fetch(defaultUrl);

  expect(await response.text()).toBe("pre");
});

it("narrows the types through the pre-resolver", async () => {
  function isHelloWorld(value: unknown): value is { hello: "world" } {
    return (
      typeof value === "object" &&
      value !== null &&
      "hello" in value &&
      value.hello === "world"
    );
  }
  server.use(
    http.post(
      defaultUrl,
      withPreResolver(
        async (props) => {
          const body = await props.request.clone().json();
          if (!isHelloWorld(body)) {
            return HttpResponse.json(
              { error: "Invalid body" },
              { status: 400 }
            );
          }
          return undefined;
        },
        async ({ request }) => {
          const body = await request.clone().json();
          return HttpResponse.text("main");
        }
      )
    )
  );
  const response = await fetch(defaultUrl, {
    method: "POST",
    body: JSON.stringify({ hello: "world" }),
  });

  expect(await response.text()).toBe("main");
});
