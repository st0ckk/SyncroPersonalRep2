import { Fragment, useState } from "react";
import { usePagination } from "../hooks/usePagination";
import PaginationControls from "./PaginationControls";
import "./DataTable.css";

/**
 * Generic data table with pagination and optional expandable rows.
 *
 * @param {Array} columns - Column definitions: { key, header, render?(row, idx) }
 * @param {Array} data - Full data array (pagination handled internally)
 * @param {string} emptyMessage - Shown when data is empty
 * @param {function} renderExpanded - (row) => JSX for expanded content (optional)
 * @param {string} rowKey - Property name to use as unique key per row
 */
export default function DataTable({
  columns,
  data,
  emptyMessage = "Sin resultados",
  renderExpanded,
  rowKey = "id",
  className = "",
}) {
  const pagination = usePagination(data);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!data.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <>
      <div className="table-scroll">
        <table className={`data-table ${className}`.trim()}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagination.paginatedData.map((row, idx) => {
              const id = row[rowKey] ?? idx;
              const isExpanded = expandedId === id;

              return (
                <Fragment key={id}>
                  <tr>
                    {columns.map((col) => (
                      <td key={col.key} className={col.className || ""}>
                        {col.render
                          ? col.render(row, { idx, isExpanded, toggleExpand: () => toggleExpand(id) })
                          : row[col.key]}
                      </td>
                    ))}
                  </tr>

                  {renderExpanded && isExpanded && (
                    <tr className="expanded-row">
                      <td colSpan={columns.length}>
                        {renderExpanded(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationControls {...pagination} />
    </>
  );
}
