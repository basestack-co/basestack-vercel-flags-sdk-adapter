import { describe, expect, it, vi } from "vitest";
import { BasestackFlagsClient } from "../src/client";
import { BasestackAdapterError } from "../src/errors";
import { createJsonResponse } from "./test-utils";

describe("BasestackFlagsClient", () => {
  const baseOptions = {
    projectKey: "proj",
    environmentKey: "env"
  };

  it("hits the /flags/:slug endpoint when fetching a single flag", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo) => {
      expect(String(url)).toBe("https://flags-api.basestack.co/v1/flags/path-check");

      return createJsonResponse(200, {
        slug: "path-check",
        enabled: true
      });
    });

    const client = new BasestackFlagsClient({ ...baseOptions, fetch: fetchMock as unknown as typeof fetch });

    await client.getFlag("path-check");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("hits the /flags endpoint when listing all flags", async () => {
    const fetchMock = vi.fn(async (url: RequestInfo) => {
      expect(String(url)).toBe("https://flags-api.basestack.co/v1/flags");

      return createJsonResponse(200, {
        flags: []
      });
    });

    const client = new BasestackFlagsClient({ ...baseOptions, fetch: fetchMock as unknown as typeof fetch });

    await client.listFlags();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retrieves and caches a flag", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(200, {
        slug: "cta",
        enabled: true,
        payload: "hi"
      })
    );

    const client = new BasestackFlagsClient({ ...baseOptions, fetch: fetchMock as unknown as typeof fetch });

    const first = await client.getFlag("cta");
    const second = await client.getFlag("cta");

    expect(first).toEqual({
      slug: "cta",
      enabled: true,
      payload: "hi",
      description: null,
      expiredAt: null,
      createdAt: null,
      updatedAt: null
    });
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns undefined for missing flags", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(404, { error: true, message: "missing" })
    );

    const client = new BasestackFlagsClient({ ...baseOptions, fetch: fetchMock as unknown as typeof fetch });
    const flag = await client.getFlag("unknown");

    expect(flag).toBeUndefined();
  });

  it("caches results after listing all flags", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(200, {
        flags: [
          { slug: "prefetched", enabled: true }
        ]
      })
    );

    const client = new BasestackFlagsClient({ ...baseOptions, fetch: fetchMock as unknown as typeof fetch });

    await client.listFlags();
    const value = await client.getFlag("prefetched");

    expect(value?.slug).toBe("prefetched");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("applies custom headers to outgoing requests", async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("x-project-key")).toBe("proj");
      expect(headers.get("x-environment-key")).toBe("env");
      expect(headers.get("accept")).toBe("application/json");
      expect(headers.get("x-extra")).toBe("1");

      return createJsonResponse(200, { slug: "header", enabled: true });
    });

    const client = new BasestackFlagsClient({
      ...baseOptions,
      headers: { "x-extra": "1" },
      fetch: fetchMock as unknown as typeof fetch
    });

    await client.getFlag("header");
  });

  it("throws when the slug is empty", async () => {
    const client = new BasestackFlagsClient({ ...baseOptions, fetch: vi.fn() as unknown as typeof fetch });

    await expect(client.getFlag(""))
      .rejects.toBeInstanceOf(BasestackAdapterError);
  });

  it("surfaces API failures as BasestackAdapterError", async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(500, { error: true, message: "boom" })
    );

    const client = new BasestackFlagsClient({ ...baseOptions, fetch: fetchMock as unknown as typeof fetch });

    await expect(client.getFlag("boom")).rejects.toMatchObject({
      status: 500,
      responseBody: { error: true, message: "boom" }
    });
  });
});
