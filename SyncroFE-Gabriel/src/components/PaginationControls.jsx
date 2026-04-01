import "./PaginationControls.css";

/**
 * Controles de paginación reutilizables.
 * Props vienen directamente del hook usePagination.
 */
export default function PaginationControls({
  page,
  pageSize,
  totalItems,
  totalPages,
  goToPage,
  changePageSize,
}) {
  const start = totalItems === 0 ? 0 : pageSize === 0 ? 1 : (page - 1) * pageSize + 1;
  const end = pageSize === 0 ? totalItems : Math.min(page * pageSize, totalItems);

  // Genera los botones de página con elipsis para listas largas
  const pageButtons = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages]);
    for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) {
      pages.add(i);
    }

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result = [];

    for (let i = 0; i < sorted.length; i++) {
      result.push(sorted[i]);
      if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
        result.push("...");
      }
    }

    return result;
  };

  return (
    <div className="pagination">
      <div className="pagination-size">
        <span>Mostrar</span>
        <select
          value={pageSize}
          onChange={(e) => changePageSize(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={0}>Todos</option>
        </select>
        <span>por página</span>
      </div>

      <div className="pagination-info">
        {totalItems === 0
          ? "Sin resultados"
          : `${start}–${end} de ${totalItems}`}
      </div>

      {pageSize > 0 && totalPages > 1 && (
        <div className="pagination-nav">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
            ‹
          </button>

          {pageButtons().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="pagination-ellipsis">
                …
              </span>
            ) : (
              <button
                key={p}
                className={p === page ? "active" : ""}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
