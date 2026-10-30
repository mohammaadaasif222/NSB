"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Paginated } from "@nsb/shared";
import { RequestError } from "@/lib/admin-client";

const DEBOUNCE_MS = 300;

/** The same query and page mean the same results, so they are not fetched twice. */
const requestKey = (q: string, page: number) => `${page}:${q}`;

/**
 * Search-as-you-type over a paged list: waits for a pause in typing, cancels the request a newer
 * one replaces, and skips a request for the results already shown. `fetchPage` must be stable
 * (useCallback). `change` is for the input, `submit` searches at once, even with an empty box.
 */
export function useLiveSearch<T>(fetchPage: (q: string, page: number, signal: AbortSignal) => Promise<Paginated<T>>) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ q: string; page: number; items: T[]; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inFlight = useRef<AbortController>(undefined);
  const lastKey = useRef<string>(undefined);

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    inFlight.current?.abort();
  }, []);

  useEffect(() => stop, [stop]);

  const load = useCallback(
    async (query: string, page: number) => {
      clearTimeout(timer.current);
      const key = requestKey(query, page);
      if (key === lastKey.current) return;
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;
      lastKey.current = key;
      setLoading(true);
      setError("");
      try {
        const res = await fetchPage(query, page, controller.signal);
        setResults((shown) => ({ q: query, page, total: res.total, items: page > 1 && shown ? [...shown.items, ...res.items] : res.items }));
      } catch (err) {
        if (controller.signal.aborted) return;
        lastKey.current = undefined;
        setError(err instanceof RequestError ? err.message : "Could not search. Please try again.");
      } finally {
        if (inFlight.current === controller) setLoading(false);
      }
    },
    [fetchPage],
  );

  const change = useCallback(
    (value: string) => {
      setQ(value);
      stop();
      const query = value.trim();
      if (query) {
        timer.current = setTimeout(() => void load(query, 1), DEBOUNCE_MS);
      } else {
        lastKey.current = undefined;
        setResults(null);
        setLoading(false);
      }
    },
    [load, stop],
  );

  const submit = useCallback(() => void load(q.trim(), 1), [load, q]);
  const loadMore = useCallback(() => {
    if (results) void load(results.q, results.page + 1);
  }, [load, results]);

  return { q, change, submit, loadMore, loading, error, items: results?.items ?? null, hasMore: !!results && results.items.length < results.total };
}
