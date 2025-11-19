import { headerFlag } from "./flags";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const showHeader = await headerFlag();

  return (
    <main className="page">
      <section className="card muted">
        <h1>
          {showHeader ? "New header experience" : "Default header experience"}
        </h1>
        <p>Powered by Basestack + Vercel Flags.</p>
      </section>
    </main>
  );
}
