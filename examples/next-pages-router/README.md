# Next.js 16 Pages Router example

The Pages Router requires you to provide a `headers`/`cookies` implementation to the Vercel Flags SDK.
This example wraps the incoming `req` object so Basestack-powered flags can be resolved inside
`getServerSideProps` (or API routes, middleware, etc.).

```bash
cd examples/next-pages-router
bun install
bun run dev
```

Required environment variables:

```bash
export BASESTACK_PROJECT_KEY="pk_live_..."
export BASESTACK_ENVIRONMENT_KEY="env_prod_..."
export FLAGS_SECRET="..."
```
