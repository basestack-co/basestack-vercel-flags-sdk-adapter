import { flag } from "flags/next";
import { createBasestackAdapter } from "../../../dist";

const basestack = createBasestackAdapter<boolean>({
  endpoint: "http://localhost:4000/v1/flags",
  projectKey: "cmhj9vgjl000svj8oed92qi9u",
  environmentKey: "cmhj9vgjo000uvj8ogf2m2fug",
  cacheTtlMs: 15_000,
  resolveValue: (flag) => flag.enabled,
});

export const headerFlag = flag<boolean>({
  key: "header",
  adapter: basestack,
  defaultValue: false,
  description: "Shows the next generation header experience",
});
