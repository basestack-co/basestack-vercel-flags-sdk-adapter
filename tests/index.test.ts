import { describe, expect, it } from "vitest";
import * as entry from "../src";
import { BasestackFlagsClient } from "../src/client";
import { BasestackAdapterError } from "../src/errors";
import { createBasestackAdapter as adapterFactory } from "../src/adapter";
import type { BasestackFlag } from "../src/types";

describe("package entry", () => {
  it("re-exports the primary factories", () => {
    expect(entry.createBasestackAdapter).toBe(adapterFactory);
    expect(entry.BasestackFlagsClient).toBe(BasestackFlagsClient);
    expect(entry.BasestackAdapterError).toBe(BasestackAdapterError);
    expect(typeof entry.isBasestackAdapterError).toBe("function");
  });

  it("re-exports types", () => {
    const flag: entry.BasestackFlag = {
      slug: "home",
      enabled: true,
      payload: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiredAt: null
    } satisfies BasestackFlag;

    expect(flag.slug).toBe("home");
  });
});
