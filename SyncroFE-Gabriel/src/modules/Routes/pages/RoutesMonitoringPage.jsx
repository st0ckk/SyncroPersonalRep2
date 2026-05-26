// src/modules/Routes/pages/RoutesMonitoringPage.jsx
import "./RoutesMonitoringPage.css";
import Button from "../../../components/Button";
import { useEffect, useMemo, useState } from "react";
import { buildBackendFileUrl, getRoutes } from "../../../api/routes.api";
import { getUsers } from "../../../api/users.api";
import { routeStatusToEs, stopStatusToEs } from "../../../utils/routeStatus";
import { getActiveDriverLocations } from "../../../api/driverLocations.api";
import { getIncidents } from "../../../api/incidents.api";
import DriversLiveMap, { routeColor } from "../components/DriversLiveMap";

function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  if (typeof dateString === "string" && dateString.length === 10) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("es-CR");
  }
  return new Date(dateString).toLocaleDateString("es-CR");
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("es-CR");
}

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "inprogress") return "badge badge-blue";
  if (s === "completed") return "badge badge-green";
  if (s === "cancelled") return "badge badge-red";
  if (s === "scheduled") return "badge badge-gray";
  if (s === "draft") return "badge badge-gray";
  return "badge badge-gray";
}

function stopStatusClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "enroute") return "badge badge-blue";
  if (s === "delivered") return "badge badge-green";
  if (s === "cancelled") return "badge badge-red";
  if (s === "pending") return "badge badge-gray";
  return "badge badge-gray";
}

function computeProgress(stops = []) {
  const total = stops.length || 0;

  if (!total) {
    return {
      total: 0,
      delivered: 0,
      cancelled: 0,
      pending: 0,
      enroute: 0,
      percent: 0,
    };
  }

  const delivered = stops.filter(
    (s) => (s.status || "").toLowerCase() === "delivered"
  ).length;

  const cancelled = stops.filter(
    (s) => (s.status || "").toLowerCase() === "cancelled"
  ).length;

  const enroute = stops.filter(
    (s) => (s.status || "").toLowerCase() === "enroute"
  ).length;

  const pending = total - delivered - cancelled - enroute;

  const done = delivered + cancelled;
  const percent = Math.round((done / total) * 100);

  return { total, delivered, cancelled, pending, enroute, percent };
}

export default function RoutesMonitoringPage() {
  const [date, setDate] = useState(toISODate(new Date()));
  const [drivers, setDrivers] = useState([]);
  const [driverUserId, setDriverUserId] = useState("");
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedRouteId, setExpandedRouteId] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const loadDrivers = async () => {
    try {
      const res = await getUsers();
      const onlyDrivers = (res.data ?? []).filter(
        (u) => u.userRole === "Chofer"
      );
      setDrivers(onlyDrivers);
    } catch (err) {
      console.error("Error cargando choferes", err);
      setDrivers([]);
    }
  };

  const loadRoutes = async () => {
    try {
      setLoading(true);

      const params = { date, includeInactive: false };
      if (driverUserId) params.driverUserId = Number(driverUserId);

      const res = await getRoutes(params);
      setRoutes(res.data ?? []);
      setLastUpdatedAt(new Date());
    } catch (err) {
      console.error("Error cargando rutas", err);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    loadRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, driverUserId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const t = setInterval(() => {
      loadRoutes();
    }, 8000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, date, driverUserId]);

  // Polling de ubicaciones en vivo (cada 10 segundos)
  const loadDriverLocations = async () => {
    try {
      const res = await getActiveDriverLocations();
      setActiveDrivers(res.data ?? []);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    loadDriverLocations();
    const t = setInterval(loadDriverLocations, 10_000);
    return () => clearInterval(t);
  }, []);

  const loadIncidents = async () => {
    try {
      const res = await getIncidents({ date, driverUserId: driverUserId || undefined });
      setIncidents(res.data ?? []);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, driverUserId]);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(loadIncidents, 15_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, date, driverUserId]);

  const filteredRoutes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return routes;

    return routes.filter((r) => {
      const routeName = (r.routeName ?? "").toLowerCase();
      const driverName = (r.driverName ?? "").toLowerCase();
      const id = String(r.routeId ?? "");
      return (
        routeName.includes(q) ||
        driverName.includes(q) ||
        id.includes(q)
      );
    });
  }, [routes, search]);

  const toggleExpand = (routeId) => {
    setExpandedRouteId((prev) => (prev === routeId ? null : routeId));
  };

  const totals = useMemo(() => {
    const totalRoutes = filteredRoutes.length;

    const totalStops = filteredRoutes.reduce(
      (acc, r) => acc + (r.stopCount ?? (r.stops?.length ?? 0)),
      0
    );

    const deliveredStops = filteredRoutes.reduce((acc, r) => {
      const stops = r.stops ?? [];
      return (
        acc +
        stops.filter((s) => (s.status || "").toLowerCase() === "delivered")
          .length
      );
    }, 0);

    const cancelledStops = filteredRoutes.reduce((acc, r) => {
      const stops = r.stops ?? [];
      return (
        acc +
        stops.filter((s) => (s.status || "").toLowerCase() === "cancelled")
          .length
      );
    }, 0);

    const enrouteStops = filteredRoutes.reduce((acc, r) => {
      const stops = r.stops ?? [];
      return (
        acc +
        stops.filter((s) => (s.status || "").toLowerCase() === "enroute")
          .length
      );
    }, 0);

    const pendingStops = Math.max(
      0,
      totalStops - deliveredStops - cancelledStops - enrouteStops
    );

    return {
      totalRoutes,
      totalStops,
      deliveredStops,
      cancelledStops,
      enrouteStops,
      pendingStops,
    };
  }, [filteredRoutes]);

  return (
    <div className="monitor-page">
      <div className="monitor-card">
        <div className="monitor-toolbar">
          <div>
            <h2>Monitoreo de rutas</h2>
            <div className="monitor-subtitle">
              Fecha: <strong>{formatDate(date)}</strong>
              {lastUpdatedAt && (
                <>
                  {" "}
                  · Última actualización:{" "}
                  <strong>{lastUpdatedAt.toLocaleTimeString("es-CR")}</strong>
                </>
              )}
            </div>
          </div>

          <div className="monitor-actions">
            <Button variant="outline" onClick={loadRoutes}>
              Refrescar
            </Button>
          </div>
        </div>

        <div className="monitor-filters">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <select
            value={driverUserId}
            onChange={(e) => setDriverUserId(e.target.value)}
          >
            <option value="">Todos los choferes</option>
            {drivers.map((d) => (
              <option key={d.userId} value={d.userId}>
                {d.userName} {d.userLastname}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar por ruta, chofer o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <label className="monitor-checkbox">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto refrescar
          </label>
        </div>

        <div className="monitor-summary">
          <div className="summary-item">
            <div className="summary-label">Rutas</div>
            <div className="summary-value">{totals.totalRoutes}</div>
          </div>

          <div className="summary-item">
            <div className="summary-label">Paradas</div>
            <div className="summary-value">{totals.totalStops}</div>
          </div>

          <div className="summary-item">
            <div className="summary-label">En ruta</div>
            <div className="summary-value">{totals.enrouteStops}</div>
          </div>

          <div className="summary-item">
            <div className="summary-label">Entregadas</div>
            <div className="summary-value">{totals.deliveredStops}</div>
          </div>

          <div className="summary-item">
            <div className="summary-label">Canceladas</div>
            <div className="summary-value">{totals.cancelledStops}</div>
          </div>

          <div className="summary-item">
            <div className="summary-label">Pendientes</div>
            <div className="summary-value">{totals.pendingStops}</div>
          </div>
        </div>

        {/* Mapa unificado: rutas trazadas + choferes en tiempo real */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              Mapa de rutas
            </span>
            {activeDrivers.length > 0 && (
              <span style={{
                background: "rgba(34,197,94,0.15)",
                color: "#15803d",
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
              }}>
                {activeDrivers.length} chofer{activeDrivers.length !== 1 ? "es" : ""} en vivo
              </span>
            )}
          </div>

          <DriversLiveMap
            routes={filteredRoutes}
            drivers={activeDrivers}
            height="440px"
          />
        </div>

        {loading ? (
          <div className="loading">Cargando rutas...</div>
        ) : !filteredRoutes.length ? (
          <div className="empty-state">
            No hay rutas para los filtros seleccionados.
          </div>
        ) : (
          <div className="monitor-list">
            {filteredRoutes.map((r, idx) => {
              const stops = (r.stops ?? [])
                .slice()
                .sort((a, b) => a.stopOrder - b.stopOrder);

              const progress = computeProgress(stops);
              const color = routeColor(idx);

              return (
                <div key={r.routeId} className="monitor-route">
                  <div className="monitor-route-header">
                    <div className="monitor-route-main">
                      <div className="monitor-route-title">
                        {/* Punto de color que coincide con el mapa */}
                        <span style={{
                          display: "inline-block",
                          width: 12, height: 12,
                          borderRadius: 3,
                          background: color,
                          marginRight: 8,
                          verticalAlign: "middle",
                          flexShrink: 0,
                        }} />
                        <strong>#{r.routeId}</strong> — {r.routeName}
                      </div>

                      <div className="monitor-route-meta">
                        <span>
                          <strong>Chofer:</strong> {r.driverName || "-"}
                        </span>

                        <span>
                          <strong>Estado:</strong>{" "}
                          <span className={statusClass(r.status)}>
                            {routeStatusToEs(r.status)}
                          </span>
                        </span>

                        <span>
                          <strong>Inicio:</strong>{" "}
                          {formatDateTime(r.startAtPlanned)}
                        </span>

                        <span>
                          <strong>Paradas:</strong> {progress.total}
                        </span>
                      </div>
                    </div>

                    <div className="monitor-route-right">
                      <div className="progress-mini">
                        <div className="progress-label">
                          {progress.percent}%
                        </div>

                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>

                        <div className="progress-counts">
                          <span className="badge badge-blue">
                            En ruta: {progress.enroute}
                          </span>
                          <span className="badge badge-green">
                            Entregadas: {progress.delivered}
                          </span>
                          <span className="badge badge-red">
                            Canceladas: {progress.cancelled}
                          </span>
                          <span className="badge badge-gray">
                            Pendientes: {progress.pending}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => toggleExpand(r.routeId)}
                      >
                        {expandedRouteId === r.routeId
                          ? "Ocultar paradas"
                          : "Ver paradas"}
                      </Button>
                    </div>
                  </div>

                  {expandedRouteId === r.routeId && (
                    <div className="monitor-stops">
                      {stops.map((s) => {
                        const photoUrl = buildBackendFileUrl(
                          s.deliveryPhotoPath
                        );

                        return (
                          <div
                            key={s.routeStopId ?? `${s.clientId}-${s.stopOrder}`}
                            className="monitor-stop"
                          >
                            <div className="monitor-stop-left">
                              <div className="monitor-stop-title">
                                <strong>#{s.stopOrder}</strong>{" "}
                                {s.clientNameSnapshot}
                              </div>

                              <div className="monitor-stop-sub">
                                {s.addressSnapshot || "Sin dirección"}
                              </div>

                              {s.notes && (
                                <div className="monitor-stop-note">
                                  <strong>Nota:</strong> {s.notes}
                                </div>
                              )}
                            </div>

                            <div className="monitor-stop-right">
                              <span className={stopStatusClass(s.status)}>
                                {stopStatusToEs(s.status)}
                              </span>

                              <div className="monitor-stop-times">
                                <span>
                                  <strong>Llegada:</strong>{" "}
                                  {formatDateTime(s.plannedArrival)}
                                </span>

                                {s.deliveredAt && (
                                  <span>
                                    <strong>Entregada:</strong>{" "}
                                    {formatDateTime(s.deliveredAt)}
                                  </span>
                                )}

                                {s.deliveryPhotoUploadedAt && (
                                  <span>
                                    <strong>Foto subida:</strong>{" "}
                                    {formatDateTime(s.deliveryPhotoUploadedAt)}
                                  </span>
                                )}
                              </div>

                              <div className="monitor-stop-photo-actions">
                                {photoUrl ? (
                                  <a
                                    href={photoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-sm"
                                  >
                                    Ver foto
                                  </a>
                                ) : (
                                  <span className="badge badge-gray">
                                    Sin foto
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* ── Incidentes del día ── */}
        <div className="incidents-section">
          <h3 className="incidents-title">
            Incidentes del día
            {incidents.length > 0 && (
              <span className="incidents-count">{incidents.length}</span>
            )}
          </h3>

          {incidents.length === 0 ? (
            <div className="incidents-empty">Sin incidentes reportados para esta fecha.</div>
          ) : (
            <div className="incidents-list">
              {incidents.map((inc) => (
                <div key={inc.incidentId} className="incident-card">
                  <div className="incident-card-header">
                    <span className="incident-type">{inc.incidentType}</span>
                    <span className="incident-meta">
                      {inc.driverName} · {new Date(inc.occurredAt).toLocaleTimeString("es-CR")}
                    </span>
                  </div>
                  {inc.description && (
                    <p className="incident-desc">{inc.description}</p>
                  )}
                  {inc.routeId && (
                    <p className="incident-route">Ruta #{inc.routeId}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}