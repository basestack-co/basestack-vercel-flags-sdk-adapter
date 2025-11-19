import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Basestack + App Router",
  description: "Example Vercel Flags adapter wired to Basestack"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
