import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { headerFlag } from "./flags";

type HomeProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function HomePage({ header }: HomeProps) {
  return (
    <>
      <Head>
        <title>Basestack + Pages Router</title>
      </Head>

      <main style={{ margin: "0 auto", maxWidth: 640, padding: "3rem 1rem" }}>
        <h1>Vercel Flags via Basestack</h1>
        <p>
          The header flag is <strong>{header ? "enabled" : "off"}</strong>.
        </p>
      </main>
    </>
  );
}

export const getServerSideProps = (async ({ req }) => {
  const header = await headerFlag(req);
  return { props: { header } };
}) satisfies GetServerSideProps<{ header: boolean }>;
