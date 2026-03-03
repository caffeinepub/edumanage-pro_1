import { useMemo, useState } from "react";

export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
}

export function usePagination<T>(
  items: T[],
  pageSize = 15,
): { paged: T[]; pagination: PaginationState } {
  const [page, setPageRaw] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp page to valid range
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  const setPage = (p: number) =>
    setPageRaw(Math.min(Math.max(1, p), totalPages));
  const nextPage = () => setPage(safePage + 1);
  const prevPage = () => setPage(safePage - 1);
  const resetPage = () => setPageRaw(1);

  return {
    paged,
    pagination: {
      page: safePage,
      pageSize,
      totalPages,
      totalItems,
      hasPrev: safePage > 1,
      hasNext: safePage < totalPages,
      setPage,
      nextPage,
      prevPage,
      resetPage,
    },
  };
}
