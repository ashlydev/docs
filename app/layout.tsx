import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Docs-Based Support Bot for Scheduling SaaS",
  description:
    "Docs-based support bot pilot for scheduling and booking SaaS teams with citations, fallback, escalation, and analytics."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
