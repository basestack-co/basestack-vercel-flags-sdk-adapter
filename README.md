# Basestack adapter for the Vercel Flags SDK

A tiny helper that connects [Basestack's Feature Flags API](https://flags-api.basestack.co/v1) to the
[Vercel Flags SDK](https://flags-sdk.com). It exposes a ready-to-use adapter so you can keep using the
SDK primitives you already know while letting Basestack act as your remote flag source.

## Features

- ✅ Ships as an [adapter](https://flags-sdk.com/docs/adapters) the SDK can plug into immediately
- 🚀 Bundled with [tsdown](https://tsdown.dev) for small ESM/CJS artifacts and `.d.ts` files
- 🧪 Tested with Vitest and formatted/linted with Biome
- ⚙️ Supports payload or boolean style flags with customizable value resolvers
- 🧠 Uses a tiny cache and optional warm-up to avoid calling your API more than needed

## Installation

```bash
bun add @basestack/vercel-flags-sdk
# or npm/pnpm/yarn if you prefer
```

## Usage

Create a single adapter instance and reuse it across your `flag()` definitions. Provide your Basestack
project/environment keys and (optionally) a `resolveValue` callback to coerce the API payload to the
shape your application expects.

```ts
// app/flags.ts
import { flag } from "flags/next";
import { createBasestackAdapter } from "@basestack/vercel-flags-sdk";

const basestack = createBasestackAdapter<boolean>({
  projectKey: process.env.BASESTACK_PROJECT_KEY!,
  environmentKey: process.env.BASESTACK_ENVIRONMENT_KEY!,
  resolveValue: (flag) => flag.enabled
});

export const onboardingFlowFlag = flag<boolean>({
  key: "onboarding-flow",
  adapter: basestack,
  defaultValue: false,
  description: "Enables the streamlined onboarding journey"
});
```

Whenever the SDK evaluates `onboardingFlowFlag()` it will call your Basestack API at
`https://flags-api.basestack.co/v1/flags/{slug}`. Successful responses are cached for 30 seconds by default,
so subsequent evaluations during a single request won't issue extra network calls.

### Adapter options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `projectKey` | `string` | — | Required. Basestack project key sent via the `x-project-key` header. |
| `environmentKey` | `string` | — | Required. Basestack environment key sent via the `x-environment-key` header. |
| `endpoint` | `string` | `https://flags-api.basestack.co/v1` | Override when pointing to a different deployment (provide the API base; the client appends `/flags` paths automatically). |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Provide a custom fetch implementation (e.g. undici) when running outside Node 18+/Bun. |
| `resolveValue` | `(flag) => Value` | `flag.payload ?? flag.enabled` | Maps the raw Basestack flag document to the value returned by the SDK. |
| `cacheTtlMs` | `number` | `30_000` | Amount of time (ms) a resolved flag should be cached in memory. Set to `0` to disable. |
| `requestTimeoutMs` | `number` | — | Aborts fetch calls after the configured timeout. |
| `headers` | `HeadersInit` | — | Additional headers merged into every request. |
| `prefetch` | `'none' | 'all'` | `'none'` | Prefetch every flag during the adapter's `initialize` hook. |
| `onError` | `(error) => void` | — | Observe API/transform errors (the adapter still resolves `undefined` so the SDK can fall back to defaults). |
| `identify` | `Identify<Entities>` | — | Pass-through to the SDK when you also need custom entity detection logic. |

### Working with payloads

Basestack flags can store arbitrary JSON payloads. You can keep them as-is, transform them, or only look
at the `enabled` state depending on the needs of each flag.

```ts
const productCopyAdapter = createBasestackAdapter<string>({
  projectKey,
  environmentKey,
  resolveValue: (flag) => String(flag.payload ?? "")
});

export const productCopy = flag<string>({
  key: "product-copy",
  adapter: productCopyAdapter,
  defaultValue: ""
});
```

### Using the client directly

If you ever need raw access to the API (for example to seed server components) you can import the
`BasestackFlagsClient` directly:

```ts
import { BasestackFlagsClient } from "@basestack/vercel-flags-sdk";

const client = new BasestackFlagsClient({ projectKey, environmentKey });
const flags = await client.listFlags();
```

The client uses the same headers/caching behavior as the adapter and is fully typed.

## Development

This repository is set up with Bun `1.3.2` as the package manager/runtime and comes with everything
needed to ship a polished package.

```bash
bun install        # install dependencies
bun run lint:all   # run Biome linting
bun run format     # format the codebase
bun run test       # execute the Vitest suite
bun run build      # build the distributable with tsdown
```

The output of `bun run build` lives in `dist/` and includes both ESM (`.mjs`), CJS (`.cjs`), and `d.ts`
artifacts ready to be published to npm under the MIT license.

## Framework examples

Need a starting point? Check the framework-specific snippets under [`examples/`](examples):

- `next-app-router` – evaluates flags inside React Server Components
- `next-pages-router` – passes the classic `req` object into the SDK
- `svelte-kit` – resolves flags during `+page.server.ts` loads
