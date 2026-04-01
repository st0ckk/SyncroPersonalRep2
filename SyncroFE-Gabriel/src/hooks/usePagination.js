import { useState, useMemo, useEffect } from "react";

/**
 * Hook de paginación reutilizable.
 * @param {Array} data - Array completo de datos a paginar
 * @param {number} defaultPageSize - Tamaño de página inicial (default 10)
 */
export function usePagination(data, defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Resetear a página 1 cuando cambian los datos (filtros aplicados)
  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const totalItems = data.length;
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedData = useMemo(() => {
    if (pageSize === 0) return data;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const goToPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  return {
    paginatedData,
    page,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    changePageSize,
  };
}
