import { describe, expectTypeOf, it } from "vitest";
import type {
  BasestackAdapterOptions,
  BasestackFlag,
  BasestackFlagValueResolver,
  BasestackFlagsClientOptions,
  JsonValue
} from "../src/types";

describe("types", () => {
  it("describes the Basestack flag and options shapes", () => {
    type Entities = { userId: string };
    const options: BasestackAdapterOptions<boolean, Entities> = {
      projectKey: "proj",
      environmentKey: "env",
      resolveValue: (flag) => flag.enabled,
      identify: async () => ({ userId: "123" })
    };

    expectTypeOf(options.projectKey).toBeString();
    expectTypeOf<BasestackFlagsClientOptions>().toMatchTypeOf<{
      projectKey: string;
      environmentKey: string;
    }>();

    const resolver: BasestackFlagValueResolver<JsonValue> = (flag) => flag.payload;
    expectTypeOf(resolver).toBeFunction();

    const flag: BasestackFlag = {
      slug: "example",
      enabled: false,
      payload: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiredAt: null
    };

    expectTypeOf(flag.payload).toMatchTypeOf<JsonValue | null>();
  });
});
