// src/modules/Routes/components/MyRoutesDriverView.jsx
import { Fragment, useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { routeStatusToEs, stopStatusToEs } from "../../../utils/routeStatus";

import {
  buildBackendFileUrl,
  getMyRoutesToday,
  getMyRouteDates,
  updateMyStopStatus,
  uploadMyStopPhoto,
} from "../../../api/routes.api";

import PendingStopsMap from "./PendingStopsMap";

// Helpers fecha
function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseLocalDate(yyyyMMdd) {
  return new Date(`${yyyyMMdd}T00:00:00`);
}

function formatDate(dateString) {
  if (!dateString) return "-";
  if (typeof dateString === "string" && dateString.length === 10) {
    return parseLocalDate(dateString).toLocaleDateString("es-CR");
  }
  return new Date(dateString).toLocaleDateString("es-CR");
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("es-CR");
}

// Links navegación
function buildGoogleMapsUrl(lat, lng) {
  const coords = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    coords
  )}&travelmode=driving&dir_action=navigate`;
}

function buildWazeUrl(lat, lng) {
  const coords = `${lat},${lng}`;
  return `https://waze.com/ul?ll=${encodeURIComponent(coords)}&navigate=yes`;
}

export default function MyRoutesDriverView() {
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Información extendida
  const [expandedSaleId, setExpandedSaleId] = useState(null);

  // Fecha seleccionada
  const [selectedDay, setSelectedDay] = useState(new Date());
  const routeDate = useMemo(() => toISODate(selectedDay), [selectedDay]);

  // Mes visible del calendario
  const [month, setMonth] = useState(new Date());

  // Días con rutas del mes visible
  const [routeDays, setRouteDays] = useState([]);

  // Estado de actualización de botón
  const [updating, setUpdating] = useState({
    routeId: null,
    stopId: null,
    status: null,
  });

  // Estado de subida de foto
  const [uploadingPhotoStopId, setUploadingPhotoStopId] = useState(null);

  // Formateo de fechas
  const formatSaleDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-CR");
  };

  // Formateo de moneda
  const formatCurrency = (amount) =>
    `₡ ${parseFloat(amount || 0).toFixed(2)}`;

  const loadMyRoutes = async (dateStr) => {
    try {
      setLoadingRoutes(true);
      const res = await getMyRoutesToday(dateStr);
      setRoutes(res.data ?? []);
    } catch (err) {
      console.error("Error cargando mis rutas", err);
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const loadMonthRouteDates = async (m) => {
    try {
      const from = new Date(m.getFullYear(), m.getMonth(), 1);
      const to = new Date(m.getFullYear(), m.getMonth() + 1, 0);

      const res = await getMyRouteDates(toISODate(from), toISODate(to));
      const list = res.data ?? [];
      setRouteDays(list.map(parseLocalDate));
    } catch (err) {
      console.error("Error cargando días con rutas", err);
      setRouteDays([]);
    }
  };

  useEffect(() => {
    loadMyRoutes(routeDate);
  }, [routeDate]);

  useEffect(() => {
    loadMonthRouteDates(month);
  }, [month]);

  const setStopStatus = async (routeId, stopId, status, note = null) => {
    try {
      setUpdating({ routeId, stopId, status });
      await updateMyStopStatus(routeId, stopId, status, note);
      await loadMyRoutes(routeDate);
    } catch (err) {
      console.error("Error actualizando estado", err);
      alert(err?.response?.data || "No se pudo actualizar el estado.");
    } finally {
      setUpdating({ routeId: null, stopId: null, status: null });
    }
  };

  const confirmCancel = async (routeId, stopId) => {
    const note = prompt("Motivo de cancelación (obligatorio):");
    if (!note || !note.trim()) {
      alert("Debes escribir un motivo para cancelar.");
      return;
    }
    await setStopStatus(routeId, stopId, "Cancelled", note.trim());
  };

  const handlePhotoChange = async (routeId, stopId, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      setUploadingPhotoStopId(stopId);
      await uploadMyStopPhoto(routeId, stopId, file);
      await loadMyRoutes(routeDate);
    } catch (err) {
      console.error("Error subiendo foto de entrega", err);
      alert(err?.response?.data || "No se pudo guardar la foto de la entrega.");
    } finally {
      setUploadingPhotoStopId(null);
    }
  };

  // Paradas pendientes/en ruta para el mapa
  const pendingStopsForMap = useMemo(() => {
    const list = [];

    for (const r of routes ?? []) {
      for (const s of r.stops ?? []) {
        const st = (s.status || "").toLowerCase();
        if (st === "pending" || st === "enroute") {
          list.push({
            ...s,
            routeId: r.routeId,
            routeName: r.routeName,
          });
        }
      }
    }

    return list.sort((a, b) => {
      if (a.routeId !== b.routeId) return a.routeId - b.routeId;
      return (a.stopOrder ?? 0) - (b.stopOrder ?? 0);
    });
  }, [routes]);

  return (
    <div className="routes-page">
      <div className="routes-card">
        <div className="routes-toolbar">
          <h2>Mis rutas asignadas</h2>
          <div style={{ color: "var(--text-secondary)" }}>
            {formatDate(routeDate)}
          </div>
        </div>

        <div className="driver-top-grid">
          <div className="driver-calendar-card">
            <DayPicker
              mode="single"
              selected={selectedDay}
              onSelect={(d) => d && setSelectedDay(d)}
              month={month}
              onMonthChange={setMonth}
              locale={es}
              modifiers={{ hasRoute: routeDays }}
              modifiersClassNames={{ hasRoute: "dp-hasRoute" }}
            />
            <div className="driver-calendar-hint">
              Los días marcados en azul tienen rutas asignadas.
            </div>
          </div>

          <div className="driver-map-card">
            <div className="driver-map-title">
              Pendientes / En ruta ({pendingStopsForMap.length})
            </div>

            {loadingRoutes ? (
              <div className="loading">Cargando mapa...</div>
            ) : pendingStopsForMap.length === 0 ? (
              <div className="empty-state">
                No hay paradas pendientes para esta fecha.
              </div>
            ) : (
              <PendingStopsMap stops={pendingStopsForMap} height="340px" />
            )}
          </div>
        </div>

        {loadingRoutes ? (
          <div className="loading">Cargando mis rutas...</div>
        ) : !routes.length ? (
          <div className="empty-state">
            No tienes rutas asignadas para esta fecha.
          </div>
        ) : (
          <div className="driver-routes-list">
            {routes.map((route) => (
              <div key={route.routeId} className="driver-route-card">
                <div className="driver-route-header">
                  <div>
                    <h3>{route.routeName}</h3>
                    <p>
                      <strong>Fecha:</strong> {formatDate(route.routeDate)}
                    </p>
                    <p>
                      <strong>Estado:</strong> {routeStatusToEs(route.status)}
                    </p>
                    <p>
                      <strong>Inicio:</strong>{" "}
                      {formatDateTime(route.startAtPlanned)}
                    </p>
                    <p>
                      <strong>Paradas:</strong> {route.stopCount}
                    </p>
                  </div>
                </div>

                <div className="driver-route-stops">
                  {(route.stops ?? [])
                    .slice()
                    .sort((a, b) => a.stopOrder - b.stopOrder)
                    .map((stop) => {
                      const lat = Number(stop.latitude);
                      const lng = Number(stop.longitude);

                      const googleMapsUrl = buildGoogleMapsUrl(lat, lng);
                      const wazeUrl = buildWazeUrl(lat, lng);
                      const photoUrl = buildBackendFileUrl(
                        stop.deliveryPhotoPath
                      );

                      const isUpdating =
                        updating.routeId === route.routeId &&
                        updating.stopId === stop.routeStopId;

                      const isUploadingPhoto =
                        uploadingPhotoStopId === stop.routeStopId;

                      return (
                        <div
                          key={
                            stop.routeStopId ??
                            `${stop.clientId}-${stop.stopOrder}`
                          }
                          className="driver-stop-card"
                        >
                          <div>
                            <strong>
                              #{stop.stopOrder} - {stop.clientNameSnapshot}
                            </strong>

                            <p>{stop.addressSnapshot || "Sin dirección"}</p>

                            <p>
                              <strong>Estado:</strong>{" "}
                              {stopStatusToEs(stop.status)}
                            </p>

                            <p>
                              <strong>Llegada:</strong>{" "}
                              {formatDateTime(stop.plannedArrival)}
                            </p>

                            {stop.deliveredAt && (
                              <p>
                                <strong>Entregada:</strong>{" "}
                                {formatDateTime(stop.deliveredAt)}
                              </p>
                            )}

                            {stop.notes && (
                              <p>
                                <strong>Notas:</strong> {stop.notes}
                              </p>
                            )}

                            {photoUrl && (
                              <div className="delivery-photo-meta">
                                <span>
                                  <strong>Foto de entrega:</strong>{" "}
                                  {stop.deliveryPhotoUploadedAt
                                    ? formatDateTime(
                                        stop.deliveryPhotoUploadedAt
                                      )
                                    : "Guardada"}
                                </span>

                                <a
                                  href={photoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline btn-sm"
                                >
                                  Ver foto
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="driver-stop-actions">
                            <label
                              className={`btn btn-outline file-upload-btn ${
                                isUploadingPhoto ? "is-disabled" : ""
                              }`}
                            >
                              {isUploadingPhoto
                                ? "Subiendo foto..."
                                : stop.deliveryPhotoPath
                                ? "Cambiar foto"
                                : "Tomar foto"}

                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                hidden
                                disabled={isUploadingPhoto || isUpdating}
                                onChange={(e) =>
                                  handlePhotoChange(
                                    route.routeId,
                                    stop.routeStopId,
                                    e
                                  )
                                }
                              />
                            </label>

                            <button
                              className="btn btn-outline"
                              disabled={isUpdating || isUploadingPhoto}
                              onClick={() =>
                                setStopStatus(
                                  route.routeId,
                                  stop.routeStopId,
                                  "EnRoute"
                                )
                              }
                              title="Marcar como En ruta"
                            >
                              {isUpdating && updating.status === "EnRoute"
                                ? "Actualizando..."
                                : "En ruta"}
                            </button>

                            <button
                              className="btn btn-success"
                              disabled={isUpdating || isUploadingPhoto}
                              onClick={() =>
                                setStopStatus(
                                  route.routeId,
                                  stop.routeStopId,
                                  "Delivered"
                                )
                              }
                              title="Marcar como Entregado"
                            >
                              {isUpdating && updating.status === "Delivered"
                                ? "Actualizando..."
                                : "Entregado"}
                            </button>

                            <button
                              className="btn btn-danger"
                              disabled={isUpdating || isUploadingPhoto}
                              onClick={() =>
                                confirmCancel(route.routeId, stop.routeStopId)
                              }
                              title="Cancelar (requiere motivo)"
                            >
                              {isUpdating && updating.status === "Cancelled"
                                ? "Actualizando..."
                                : "Cancelado"}
                            </button>

                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline"
                            >
                              Google Maps
                            </a>

                            <a
                              href={wazeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary"
                            >
                              Waze
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <table className="ventas-table">
                  <thead>
                    <tr>
                      <th>Numero de orden</th>
                      <th>Cliente</th>
                      <th>Vendedor</th>
                      <th>Emision</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(route.purchases ?? []).length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          No hay órdenes asociadas a esta ruta.
                        </td>
                      </tr>
                    ) : (
                      (route.purchases ?? []).map((s) => (
                        <Fragment key={s.purchaseId}>
                          <tr>
                            <td className="number">{s.purchaseOrderNumber}</td>
                            <td>{s.clientName}</td>
                            <td>{s.userName}</td>
                            <td>{formatSaleDate(s.purchaseDate)}</td>
                            <td className="actions">
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() =>
                                  setExpandedSaleId(
                                    expandedSaleId === s.purchaseId
                                      ? null
                                      : s.purchaseId
                                  )
                                }
                              >
                                {expandedSaleId === s.purchaseId
                                  ? "Ocultar"
                                  : "Detalle"}
                              </button>
                            </td>
                          </tr>

                          {expandedSaleId === s.purchaseId && (
                            <tr className="ventas-extra">
                              <td colSpan={5}>
                                <section className="ventas-details">
                                  <span>
                                    <table>
                                      <thead>
                                        <tr>
                                          <th>Producto</th>
                                          <th>Precio unitario</th>
                                          <th>Cantidad</th>
                                          <th>Total línea</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(s.saleDetails ?? []).map((d) => (
                                          <tr key={d.saleDetailId}>
                                            <td>{d.productName}</td>
                                            <td>
                                              {formatCurrency(d.unitPrice)}
                                            </td>
                                            <td>{d.quantity}</td>
                                            <td>
                                              {formatCurrency(d.lineTotal)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </span>
                                </section>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}