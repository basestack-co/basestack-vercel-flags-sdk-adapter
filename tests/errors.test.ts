import { describe, expect, it } from "vitest";
import { BasestackAdapterError, isBasestackAdapterError } from "../src/errors";

describe("BasestackAdapterError", () => {
  it("stores metadata on the error instance", () => {
    const inner = new Error("nested");
    const error = new BasestackAdapterError("boom", {
      status: 502,
      responseBody: { message: "bad gateway" },
      cause: inner
    });

    expect(error.name).toBe("BasestackAdapterError");
    expect(error.status).toBe(502);
    expect(error.responseBody).toEqual({ message: "bad gateway" });
    expect(error.cause).toBe(inner);
  });

  it("is matched by the type guard", () => {
    const error = new BasestackAdapterError("boom");

    expect(isBasestackAdapterError(error)).toBe(true);
    expect(isBasestackAdapterError(new Error("other"))).toBe(false);
  });
});
