import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import RouteLayer from "./RouteLayer";

const DEFAULT_CENTER = [9.9281, -84.0907];

/** Paleta de colores — uno por ruta */
export const ROUTE_COLORS = [
  "#2563eb", // corporate blue
  "#f59e0b", // ámbar
  "#ec4899", // rosa
  "#14b8a6", // teal
  "#f97316", // naranja
  "#3b82f6", // blue
  "#06b6d4", // cian
  "#84cc16", // lima
  "#ef4444", // rojo
  "#0ea5e9", // azul cielo
];

export function routeColor(index) {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
}

// ─── Iconos ────────────────────────────────────────────────────────────────

function makeStopIcon(order, color, status) {
  const s = String(status ?? "").toUpperCase();
  const isDone = s === "DELIVERED" || s === "CANCELLED";

  return L.divIcon({
    className: "",
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:${isDone ? "#94a3b8" : color};
      border:2px solid #fff;
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:11px;font-weight:700;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      opacity:${isDone ? 0.55 : 1};
    ">${order}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16],
  });
}

function makeDriverIcon(name, secondsAgo) {
  const isRecent = secondsAgo < 30;
  const dotColor = isRecent ? "#22c55e" : secondsAgo < 120 ? "#f59e0b" : "#6b7280";
  const pulse = isRecent
    ? `<span style="
        position:absolute;inset:-5px;border-radius:50%;
        border:2px solid ${dotColor};opacity:0.5;
        animation:driver-pulse 1.4s ease-out infinite;
      "></span>`
    : "";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return L.divIcon({
    className: "",
    html: `
      <style>
        @keyframes driver-pulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.9);opacity:0}}
      </style>
      <div style="position:relative;width:38px;height:38px;">
        ${pulse}
        <div style="
          width:38px;height:38px;border-radius:50%;
          background:${dotColor};border:2.5px solid #fff;
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:13px;font-weight:800;letter-spacing:-0.5px;
          box-shadow:0 2px 10px rgba(0,0,0,0.4);position:relative;z-index:1;
        ">${initials}</div>
      </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -24],
  });
}

// ─── FitBounds ─────────────────────────────────────────────────────────────

function FitAll({ allPoints }) {
  const map = useMap();
  const didFit = useRef(false);

  useEffect(() => {
    if (didFit.current || !allPoints.length) return;
    setTimeout(() => {
      map.invalidateSize();
      if (allPoints.length === 1) {
        map.setView(allPoints[0], 13);
      } else {
        map.fitBounds(allPoints, { padding: [50, 50] });
      }
      didFit.current = true;
    }, 200);
  }, [map, allPoints]);

  return null;
}

// ─── Leyenda ───────────────────────────────────────────────────────────────

function Legend({ routes }) {
  if (!routes.length) return null;

  return (
    <div style={{
      position: "absolute",
      bottom: 12,
      left: 12,
      zIndex: 1000,
      background: "rgba(255,255,255,0.93)",
      borderRadius: 10,
      padding: "8px 12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      fontSize: 12,
      maxWidth: 220,
      pointerEvents: "none",
    }}>
      {routes.map((r, i) => (
        <div key={r.routeId} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: i < routes.length - 1 ? 5 : 0 }}>
          <span style={{
            width: 12, height: 12, borderRadius: 2,
            background: routeColor(i),
            flexShrink: 0,
            display: "inline-block",
          }} />
          <span style={{ color: "#1e293b", fontWeight: 600, lineHeight: 1.3 }}>
            {r.routeName || `Ruta #${r.routeId}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────

/**
 * Mapa de monitoreo unificado:
 *  - Rutas trazadas (OSRM) con colores distintos
 *  - Paradas numeradas por ruta
 *  - Choferes en tiempo real con animación de pulso
 *
 * @param {{
 *   routes: RouteDto[],
 *   drivers: DriverLocation[],
 *   height?: string
 * }} props
 */
export default function DriversLiveMap({ routes = [], drivers = [], height = "420px" }) {
  // Todos los puntos para el fitBounds inicial
  const allPoints = [
    ...routes.flatMap((r) =>
      (r.stops ?? [])
        .filter((s) => s.latitude != null && s.longitude != null)
        .map((s) => [Number(s.latitude), Number(s.longitude)])
    ),
    ...drivers.map((d) => [d.latitude, d.longitude]),
  ];

  return (
    <div style={{ position: "relative" }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={8}
        scrollWheelZoom
        style={{
          height,
          width: "100%",
          borderRadius: "12px",
          border: "1px solid var(--border)",
        }}
      >
        <FitAll allPoints={allPoints} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Una capa OSRM + paradas por cada ruta */}
        {routes.map((route, idx) => {
          const color = routeColor(idx);
          const stops = (route.stops ?? [])
            .filter((s) => s.latitude != null && s.longitude != null)
            .sort((a, b) => a.stopOrder - b.stopOrder);

          const points = stops.map((s) => ({
            lat: Number(s.latitude),
            lng: Number(s.longitude),
          }));

          return (
            <span key={route.routeId}>
              {/* Ruta trazada por carretera */}
              <RouteLayer points={points} color={color} />

              {/* Marcadores de paradas */}
              {stops.map((s) => (
                <Marker
                  key={s.routeStopId ?? `${route.routeId}-${s.stopOrder}`}
                  position={[Number(s.latitude), Number(s.longitude)]}
                  icon={makeStopIcon(s.stopOrder, color, s.status)}
                  zIndexOffset={500}
                >
                  <Popup>
                    <div style={{ minWidth: 190, fontFamily: "inherit" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
                      }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: color, flexShrink: 0,
                        }} />
                        <span style={{ fontWeight: 700, fontSize: 13 }}>
                          {route.routeName || `Ruta #${route.routeId}`}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>
                        #{s.stopOrder} — {s.clientNameSnapshot}
                      </div>
                      {s.addressSnapshot && (
                        <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
                          {s.addressSnapshot}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: "#777" }}>
                        Chofer: <strong>{route.driverName || "—"}</strong>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </span>
          );
        })}

        {/* Marcadores de choferes en tiempo real (encima de todo) */}
        {drivers.map((d) => (
          <Marker
            key={d.driverId}
            position={[d.latitude, d.longitude]}
            icon={makeDriverIcon(d.driverName, d.secondsAgo)}
            zIndexOffset={2000}
          >
            <Popup>
              <div style={{ minWidth: 180, fontFamily: "inherit" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                  {d.driverName}
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>
                  Actualizado hace{" "}
                  <strong>
                    {d.secondsAgo < 60
                      ? `${d.secondsAgo}s`
                      : `${Math.round(d.secondsAgo / 60)}min`}
                  </strong>
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>
                  {d.latitude.toFixed(5)}, {d.longitude.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Leyenda de rutas — fuera del MapContainer para no afectar z-index */}
      <div style={{
        position: "absolute",
        bottom: 12,
        left: 12,
        zIndex: 1000,
        background: "rgba(255,255,255,0.93)",
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        fontSize: 12,
        maxWidth: 220,
        pointerEvents: "none",
      }}>
        {routes.map((r, i) => (
          <div key={r.routeId} style={{
            display: "flex", alignItems: "center", gap: 7,
            marginBottom: i < routes.length - 1 ? 5 : 0,
          }}>
            <span style={{
              width: 14, height: 5, borderRadius: 3,
              background: routeColor(i), flexShrink: 0, display: "inline-block",
            }} />
            <span style={{ color: "#1e293b", fontWeight: 600, lineHeight: 1.3 }}>
              {r.routeName || `Ruta #${r.routeId}`}
            </span>
          </div>
        ))}
        {drivers.length > 0 && (
          <div style={{
            marginTop: routes.length ? 8 : 0,
            paddingTop: routes.length ? 7 : 0,
            borderTop: routes.length ? "1px solid #e2e8f0" : "none",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <span style={{
              width: 14, height: 14, borderRadius: "50%",
              background: "#22c55e", border: "2px solid #fff",
              boxShadow: "0 0 0 2px rgba(34,197,94,0.35)",
              flexShrink: 0, display: "inline-block",
            }} />
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              Chofer en vivo
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
