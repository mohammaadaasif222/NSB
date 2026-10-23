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
    // Phones and tablets: a floating card above the bottom tab bar (or the vendor page's Enquire bar).
    <div className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[70] rounded-2xl bg-[rgba(30,41,59,0.95)] px-4 py-3 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] backdrop-blur-[4px] lg:sticky lg:inset-x-auto lg:bottom-0 lg:z-50 lg:rounded-none lg:py-2 lg:shadow-none">
      <div className="mx-auto flex max-w-[1536px] flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between lg:gap-2">
        <p className="text-[11px] leading-4 text-white lg:text-[10px] lg:leading-[15px]">
          This website uses cookies, pixel tags, and local storage for performance, personalization, and marketing
          purposes. We use our own cookies and some from third parties.{" "}
          <a href="#" className="underline">
            Cookies settings
          </a>
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <button type="button" onClick={() => choose("deny")} className="py-1.5 text-xs text-white lg:py-0 lg:text-[10px] lg:leading-[15px]">
            Do not allow cookies
          </button>
          <button
            type="button"
            onClick={() => choose("allow")}
            className="rounded-lg bg-brand px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-dark lg:rounded lg:px-3 lg:py-1 lg:text-[10px] lg:leading-[15px]"
          >
            Allow all cookies
          </button>
          <button
            type="button"
            onClick={() => choose("close")}
            aria-label="Close"
            className="ml-auto p-1.5 text-xs text-[#9ca3af] hover:text-white lg:ml-0 lg:p-0 lg:text-[10px] lg:leading-[15px]"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
