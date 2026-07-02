"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ApiResponse, PaginatedResponse } from "@/lib/types";

interface UseApiOptions {
  enabled?: boolean;
  dependencies?: unknown[];
}

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Generic data fetching hook
export function useApi<T>(
  url: string | null,
  options: UseApiOptions = {}
): UseApiState<T> {
  const { enabled = true, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) {
      setIsLoading(false);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      });
      const json: ApiResponse<T> = await res.json();

      if (!json.success) {
        setError(json.error || "An error occurred");
        setData(null);
      } else {
        setData(json.data ?? null);
        setError(null);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch");
      setData(null);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [url, enabled]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData, ...dependencies]);

  return { data, isLoading, error, refetch: fetchData };
}

// Paginated data hook
export function usePaginatedApi<T>(
  baseUrl: string,
  page = 1,
  pageSize = 20,
  filters: Record<string, string | undefined> = {}
): UseApiState<PaginatedResponse<T>> & {
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
} {
  const [currentPage, setCurrentPage] = useState(page);
  const params = new URLSearchParams();
  params.set("page", String(currentPage));
  params.set("pageSize", String(pageSize));
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });

  const url = `${baseUrl}?${params.toString()}`;
  const result = useApi<PaginatedResponse<T>>(url, {
    dependencies: [currentPage, pageSize, JSON.stringify(filters)],
  });

  return {
    ...result,
    page: currentPage,
    pageSize,
    setPage: setCurrentPage,
  };
}

// Mutation hook (POST/PUT/PATCH/DELETE)
export function useMutation<T, Body = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST"
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(
    async (body?: Body): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });
        const json: ApiResponse<T> = await res.json();
        if (!json.success) {
          setError(json.error || "Mutation failed");
          return null;
        }
        setData(json.data ?? null);
        return json.data ?? null;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [url, method]
  );

  return { mutate, data, isLoading, error };
}
