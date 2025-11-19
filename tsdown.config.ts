import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  platform: "neutral",
  target: "es2022",
  outDir: "dist",
  sourcemap: false,
  dts: true,
  clean: true,
  treeshake: true,
  minify: true,
});
