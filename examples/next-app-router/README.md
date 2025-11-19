# Next.js 16 App Router example

This example shows how to evaluate Basestack-backed flags inside an App Router route. The `flag()` calls
run in React Server Components and automatically pick up the incoming `headers`/`cookies` from Next.js.

```bash
# inside the repo root
cd examples/next-app-router
bun install
bun run dev
```

Make sure to expose the following environment variables when running `next dev` or building for
production:

```bash
export BASESTACK_PROJECT_KEY="pk_live_..."
export BASESTACK_ENVIRONMENT_KEY="env_prod_..."
export FLAGS_SECRET="$(node -e "console.log(crypto.randomBytes(32).toString('base64url'))")"
```
