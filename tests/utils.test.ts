import { describe, expect, it } from "vitest";
import {
  DEFAULT_ENDPOINT,
  isErrorResponse,
  isFlagsResponse,
  isRawFlag,
  isRecord,
  normalizeFlag,
  parseJson,
  trimTrailingSlash
} from "../src/utils";
import type { BasestackRawFlag } from "../src/types";

describe("utils", () => {
  it("trims trailing slashes", () => {
    expect(trimTrailingSlash("https://api.test/foo//")).toBe("https://api.test/foo");
  });

  it("detects plain records", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord("foo")).toBe(false);
  });

  it("parses JSON defensively", () => {
    expect(parseJson("{\"a\":1}")).toEqual({ a: 1 });
    expect(parseJson("not json")).toBeUndefined();
    expect(parseJson("" as string)).toBeUndefined();
  });

  it("identifies API error payloads", () => {
    expect(isErrorResponse({ error: true, message: "nope" })).toBe(true);
    expect(isErrorResponse({ error: false })).toBe(false);
  });

  it("normalizes raw flags into runtime objects", () => {
    const now = new Date().toISOString();
    const raw: BasestackRawFlag = {
      slug: "release",
      enabled: false,
      payload: { copy: "hello" },
      description: null,
      createdAt: now,
      updatedAt: now,
      expiredAt: null
    };

    const normalized = normalizeFlag(raw);

    expect(normalized.slug).toBe("release");
    expect(normalized.enabled).toBe(false);
    expect(normalized.payload).toEqual({ copy: "hello" });
    expect(normalized.createdAt).toBeInstanceOf(Date);
    expect(normalized.updatedAt).toBeInstanceOf(Date);
    expect(normalized.expiredAt).toBeNull();
  });

  it("guards raw flag shapes", () => {
    expect(isRawFlag({ slug: "release", enabled: true })).toBe(true);
    expect(isRawFlag({ slug: 1, enabled: true })).toBe(false);
  });

  it("guards list responses", () => {
    const raw = { flags: [{ slug: "a", enabled: true }] };
    expect(isFlagsResponse(raw)).toBe(true);
    expect(isFlagsResponse({ flags: [{ slug: 1 }] })).toBe(false);
  });

  it("exposes the default endpoint constant", () => {
    expect(DEFAULT_ENDPOINT).toBe("https://flags-api.basestack.co/v1");
  });
});
