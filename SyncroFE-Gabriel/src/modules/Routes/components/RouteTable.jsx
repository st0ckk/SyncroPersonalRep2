import { Fragment, useState } from "react";
import RouteMapPreview from "./RouteMapPreview";
import { routeStatusToEs } from "../../../utils/routeStatus";
import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

export default function RouteTable({
  routes,
  onEdit,
  onDeactivate,
  onActivate,
}) {
  const [expandedRouteId, setExpandedRouteId] = useState(null);
  const pagination = usePagination(routes);

  const toggleMoreInfo = (id) => {
    setExpandedRouteId((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-CR");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-CR");
  };

  const statusBadgeClass = (status) => {
    const s = String(status ?? "").toLowerCase();
    if (s === "scheduled") return "route-status active";
    if (s === "inprogress") return "route-status pending";
    if (s === "completed") return "route-status active";
    if (s === "cancelled") return "route-status inactive";
    if (s === "draft") return "route-status inactive";
    return "route-status inactive";
  };

  if (!routes.length) {
    return <div className="empty-state">No hay rutas registradas</div>;
  }

  return (
    <>
    <table className="routes-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Fecha</th>
          <th>Chofer</th>
          <th>Estado</th>
          <th>Paradas</th>
          <th>Inicio</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {pagination.paginatedData.map((r) => (
          <Fragment key={r.routeId}>
            <tr>
              <td>{r.routeId}</td>
              <td className="number">{r.routeName}</td>
              <td>{formatDate(r.routeDate)}</td>
              <td>{r.driverName || "-"}</td>

              <td>
                <span className={statusBadgeClass(r.status)}>
                  {routeStatusToEs(r.status)} {r.isActive ? "" : "(Inactiva)"}
                </span>
              </td>

              <td>{r.stopCount}</td>
              <td>{formatDateTime(r.startAtPlanned)}</td>

              <td className="actions">
                <button
                  className="btn btn-outline"
                  onClick={() => toggleMoreInfo(r.routeId)}
                >
                  Más información
                </button>

                <button
                  className="btn btn-outline"
                  onClick={() => onEdit(r)}
                >
                  Editar
                </button>

                {r.isActive ? (
                  <button
                    className="btn btn-danger"
                    onClick={() => onDeactivate(r.routeId)}
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={() => onActivate(r.routeId)}
                  >
                    Activar
                  </button>
                )}
              </td>
            </tr>

            {expandedRouteId === r.routeId && (
              <tr className="route-extra">
                <td colSpan={8}>
                  <div className="route-extra-grid">
                    <div>
                      <h4>Información general</h4>
                      <p><strong>Nombre:</strong> {r.routeName}</p>
                      <p><strong>Fecha:</strong> {formatDate(r.routeDate)}</p>
                      <p><strong>Chofer:</strong> {r.driverName || "-"}</p>
                      <p><strong>Estado:</strong> {routeStatusToEs(r.status)}</p>
                      <p><strong>Notas:</strong> {r.notes || "N/A"}</p>
                    </div>

                    <div>
                      <h4>Paradas</h4>
                      <div className="route-stops-list">
                        {(r.stops ?? [])
                          .slice()
                          .sort((a, b) => a.stopOrder - b.stopOrder)
                          .map((s) => (
                            <div
                              key={s.routeStopId || `${s.clientId}-${s.stopOrder}`}
                              className="route-stop-item"
                            >
                              <strong>#{s.stopOrder}</strong> {s.clientNameSnapshot}
                              <br />
                              <span>{s.addressSnapshot || "Sin dirección"}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <RouteMapPreview stops={r.stops ?? []} />
                  </div>
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
    <PaginationControls {...pagination} />
    </>
  );
}
