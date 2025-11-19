import { RequestCookies } from "@edge-runtime/cookies";
import { HeadersAdapter, RequestCookiesAdapter } from "flags";
import { describe, expect, it, vi } from "vitest";
import { createBasestackAdapter } from "../src";
import { createJsonResponse } from "./test-utils";

const createDecideContext = () => ({
  headers: HeadersAdapter.seal(new Headers()),
  cookies: RequestCookiesAdapter.seal(new RequestCookies(new Headers()))
});

describe("createBasestackAdapter", () => {
  it("fetches a single flag and resolves its payload", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo) => {
      expect(String(url)).toBe("https://flags-api.basestack.co/v1/flags/example-flag");

      return createJsonResponse(200, {
        slug: "example-flag",
        enabled: true,
        payload: { headline: "Ship it" }
      });
    });

    const adapter = createBasestackAdapter<{ headline: string }>({
      projectKey: "proj",
      environmentKey: "env",
      fetch: fetchMock as unknown as typeof fetch,
      resolveValue: (flag) => flag.payload as { headline: string }
    });

    const { headers, cookies } = createDecideContext();
    const value = await adapter.decide({ key: "example-flag", headers, cookies });

    expect(value).toEqual({ headline: "Ship it" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to the enabled flag status when no payload is provided", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(200, {
        slug: "boolean-flag",
        enabled: false
      })
    );

    const adapter = createBasestackAdapter<boolean>({
      projectKey: "proj",
      environmentKey: "env",
      fetch: fetchMock as unknown as typeof fetch,
      resolveValue: (flag) => flag.enabled
    });

    const { headers, cookies } = createDecideContext();
    const value = await adapter.decide({ key: "boolean-flag", headers, cookies });

    expect(value).toBe(false);
  });

  it("caches results within the configured TTL", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(200, {
        slug: "cached-flag",
        enabled: true,
        payload: "first-response"
      })
    );

    const adapter = createBasestackAdapter<string>({
      projectKey: "proj",
      environmentKey: "env",
      fetch: fetchMock as unknown as typeof fetch,
      cacheTtlMs: 1000,
      resolveValue: (flag) => flag.payload as string
    });

    const context = createDecideContext();

    expect(
      await adapter.decide({ key: "cached-flag", ...context })
    ).toBe("first-response");

    expect(
      await adapter.decide({ key: "cached-flag", ...context })
    ).toBe("first-response");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns undefined and reports an error when the API call fails", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(500, {
        error: true,
        message: "boom"
      })
    );
    const onError = vi.fn();

    const adapter = createBasestackAdapter<string>({
      projectKey: "proj",
      environmentKey: "env",
      fetch: fetchMock as unknown as typeof fetch,
      onError
    });

    const context = createDecideContext();
    const value = await adapter.decide({ key: "broken", ...context });

    expect(value).toBeUndefined();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("supports prefetching all flags during initialization", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo) => {
      if (String(url).endsWith("/cached")) {
        return createJsonResponse(200, {
          slug: "cached",
          enabled: true,
          payload: "ready"
        });
      }

      return createJsonResponse(200, {
        flags: [
          {
            slug: "cached",
            enabled: true,
            payload: "warm"
          }
        ]
      });
    });

    const adapter = createBasestackAdapter<string>({
      projectKey: "proj",
      environmentKey: "env",
      fetch: fetchMock as unknown as typeof fetch,
      prefetch: "all",
      resolveValue: (flag) => flag.payload as string
    });

    await adapter.initialize?.();

    const context = createDecideContext();
    const value = await adapter.decide({ key: "cached", ...context });

    expect(value).toBe("warm");
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the prefetch call is needed
  });
});
