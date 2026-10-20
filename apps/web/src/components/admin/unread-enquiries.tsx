"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { UnreadCount } from "@nsb/shared";
import { useToast } from "./toast";

const POLL_MS = 30_000;

const UnreadContext = createContext(0);

/**
 * Unread enquiry count for the bell and the nav badge. The panel layout passes the count it
 * rendered with (so it updates on every router.refresh); between renders it is polled while
 * the tab is visible, with a toast when new enquiries arrive.
 */
export function UnreadEnquiriesProvider({ initial, children }: { initial: number; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [source, setSource] = useState(initial);
  const [unread, setUnread] = useState(initial);
  const known = useRef(initial);
  if (initial !== source) {
    setSource(initial);
    setUnread(initial);
  }
  useEffect(() => {
    known.current = initial;
  }, [initial]);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/enquiries/unread-count", { cache: "no-store" });
      if (!res.ok) return;
      const { unread: count } = (await res.json()) as UnreadCount;
      const arrived = count - known.current;
      known.current = count;
      setUnread(count);
      if (arrived > 0) {
        toast.success(arrived === 1 ? "New enquiry received" : `${arrived} new enquiries received`);
        // Show them straight away where enquiries are listed.
        if (pathname === "/admin" || pathname === "/admin/enquiries") router.refresh();
      }
    } catch {
      // Offline or the API restarting: try again next time.
    }
  }, [pathname, router, toast]);

  useEffect(() => {
    const visible = () => document.visibilityState === "visible";
    const timer = setInterval(() => visible() && void poll(), POLL_MS);
    const onVisible = () => visible() && void poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [poll]);

  return <UnreadContext.Provider value={unread}>{children}</UnreadContext.Provider>;
}

export const useUnreadEnquiries = () => useContext(UnreadContext);

const label = (n: number) => (n > 99 ? "99+" : String(n));

/** Small count pill, e.g. next to "Enquiries" in the nav. */
export function UnreadBadge() {
  const unread = useUnreadEnquiries();
  if (!unread) return null;
  return (
    <span className="ml-auto rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white tabular-nums" aria-hidden>
      {label(unread)}
    </span>
  );
}
