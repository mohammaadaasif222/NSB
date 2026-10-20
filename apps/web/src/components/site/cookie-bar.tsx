"use client";

import { useSyncExternalStore } from "react";

const KEY = "nsb-cookies";
const listeners = new Set<() => void>();
let dismissedThisView = false;

function readChoice(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function choose(choice: "allow" | "deny" | "close") {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // Storage blocked: the bar just closes for this page view.
  }
  dismissedThisView = true;
  listeners.forEach((l) => l());
}

export function CookieBar() {
  // Server render assumes "dismissed" so the bar never flashes for returning visitors.
  const dismissed = useSyncExternalStore(
    subscribe,
    () => dismissedThisView || readChoice() !== null,
    () => true,
  );
  if (dismissed) return null;

  return (
    <div className="sticky bottom-0 z-50 bg-[rgba(30,41,59,0.95)] px-4 py-2 backdrop-blur-[4px]">
      <div className="mx-auto flex max-w-[1536px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] leading-[15px] text-white">
          This website uses cookies, pixel tags, and local storage for performance, personalization, and marketing
          purposes. We use our own cookies and some from third parties.{" "}
          <a href="#" className="underline">
            Cookies settings
          </a>
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <button type="button" onClick={() => choose("deny")} className="text-[10px] leading-[15px] text-white">
            Do not allow cookies
          </button>
          <button
            type="button"
            onClick={() => choose("allow")}
            className="rounded bg-brand px-3 py-1 text-[10px] leading-[15px] font-bold text-white hover:bg-brand-dark"
          >
            Allow all cookies
          </button>
          <button
            type="button"
            onClick={() => choose("close")}
            aria-label="Close"
            className="text-[10px] leading-[15px] text-[#9ca3af] hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
