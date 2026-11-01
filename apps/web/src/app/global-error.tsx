"use client";

import { useEffect } from "react";

/** Replaces the root layout when it fails, so it brings its own document and styles. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);

  return (
    <html lang="en-IN">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", color: "#111827" }}>
        <title>Something went wrong | Noida Super Bazaar</title>
        <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, margin: 0 }}>We could not load this page. Please try again in a moment.</p>
          <button type="button" onClick={() => retry()} style={{ padding: "10px 20px", font: "inherit", fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
