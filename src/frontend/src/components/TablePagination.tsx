import { Button } from "@/components/ui/button";
import type { PaginationState } from "@/hooks/usePagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  pagination: PaginationState;
  className?: string;
}

export function TablePagination({ pagination, className = "" }: Props) {
  const {
    page,
    totalPages,
    totalItems,
    pageSize,
    hasPrev,
    hasNext,
    setPage,
    prevPage,
    nextPage,
  } = pagination;

  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  // Build page number buttons (at most 5 visible)
  const pageNums: number[] = [];
  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  for (let i = startPage; i <= endPage; i++) pageNums.push(i);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border ${className}`}
    >
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {start}–{end}
        </span>{" "}
        of <span className="font-medium text-foreground">{totalItems}</span>{" "}
        records
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={prevPage}
          disabled={!hasPrev}
          data-ocid="pagination.prev"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => setPage(1)}
              aria-label="Page 1"
            >
              1
            </Button>
            {startPage > 2 && (
              <span className="text-muted-foreground text-xs px-1">…</span>
            )}
          </>
        )}

        {pageNums.map((n) => (
          <Button
            key={n}
            variant={n === page ? "default" : "outline"}
            size="sm"
            className="h-7 w-7 p-0 text-xs"
            onClick={() => setPage(n)}
            aria-label={`Page ${n}`}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="text-muted-foreground text-xs px-1">…</span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => setPage(totalPages)}
              aria-label={`Page ${totalPages}`}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={nextPage}
          disabled={!hasNext}
          data-ocid="pagination.next"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
