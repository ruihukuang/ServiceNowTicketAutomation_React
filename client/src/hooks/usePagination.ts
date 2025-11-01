import { useState, useCallback } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  canNext: boolean;
  canPrev: boolean;
}

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotalItems] = useState(totalItems);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(Math.max(1, size));
    // Reset to first page when page size changes
    setCurrentPage(1);
  }, []);

  const handleSetTotalItems = useCallback((total: number) => {
    setTotalItems(Math.max(0, total));
  }, []);

  return {
    currentPage,
    pageSize,
    totalItems: total,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    setPageSize: handleSetPageSize,
    setTotalItems: handleSetTotalItems,
    canNext: currentPage < totalPages,
    canPrev: currentPage > 1
  };
};