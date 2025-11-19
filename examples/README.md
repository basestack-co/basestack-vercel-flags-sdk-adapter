# Framework examples

The `examples/` directory demonstrates how to drop the Basestack adapter into the frameworks officially
supported by the Vercel Flags SDK. Each example is intentionally tiny—copy the files directly into your
application and wire up your own flag slugs.

## Prerequisites

1. From the repository root, run `bun install` followed by `bun run build` once. This creates the
   `dist/` artifacts consumed by the examples via the local `file:` dependency on
   `@basestack/vercel-flags-sdk-adapter`.
2. For each example, change into its directory and run `bun install` to pull the framework-specific
   dependencies.

All examples expect the following environment variables to be available at build/runtime:

- `BASESTACK_PROJECT_KEY`
- `BASESTACK_ENVIRONMENT_KEY`
- `FLAGS_SECRET` (required by the Vercel Flags SDK for overrides)

Each example README explains how to run the framework locally. Feel free to swap Bun with
npm/pnpm/yarn if you prefer, but Bun 1.3.2 is configured in the package metadata for consistency.
