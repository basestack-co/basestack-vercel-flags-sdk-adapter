import { flag } from "flags/next";
import { createBasestackAdapter } from "../../../dist";

const basestack = createBasestackAdapter<boolean>({
  endpoint: "https://flags-api.basestack.co/v1",
  projectKey: "cmi66kums00020mpq5rw7ezx9",
  environmentKey: "cmi66kumz00040mpqps87kxn8",
  resolveValue: (flag) => flag.enabled,
});

export const headerFlag = flag<boolean>({
  key: "header",
  adapter: basestack,
  defaultValue: false,
  description: "Shows the next generation header experience",
});
