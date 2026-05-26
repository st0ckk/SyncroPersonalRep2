import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { stopStatusToEs } from "../../../utils/routeStatus";
import RouteLayer from "./RouteLayer";

const DEFAULT_CENTER = [9.9281, -84.0907];

const navLinkStyle = (color) => ({
  display: "block",
  padding: "5px 10px",
  borderRadius: 6,
  background: color,
  color: "#fff",
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 600,
  textAlign: "center",
});

const stopStatusColor = (status) => {
  const s = String(status ?? "").toUpperCase();
  if (s === "PENDING")   return { bg: "rgba(234,179,8,0.15)",  color: "#92400e", dot: "#f59e0b" };
  if (s === "ENROUTE")   return { bg: "rgba(59,130,246,0.15)", color: "#1e40af", dot: "#3b82f6" };
  if (s === "DELIVERED") return { bg: "rgba(34,197,94,0.15)",  color: "#15803d", dot: "#22c55e" };
  if (s === "CANCELLED") return { bg: "rgba(239,68,68,0.15)",  color: "#b91c1c", dot: "#ef4444" };
  return { bg: "rgba(107,114,128,0.15)", color: "#374151", dot: "#6b7280" };
};

function makeStopIcon(order, status) {
  const { dot } = stopStatusColor(status);
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 30px;
      height: 30px;
      background: ${dot};
      border: 2px solid #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    ">${order}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();

      if (!points.length) {
        map.setView(DEFAULT_CENTER, 8);
        return;
      }

      if (points.length === 1) {
        map.setView([points[0].lat, points[0].lng], 14);
        return;
      }

      const bounds = points.map((p) => [p.lat, p.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }, 200);
  }, [map, points]);

  return null;
}

export default function PendingStopsMap({ stops, height = "330px" }) {
  const points = (stops ?? [])
    .map((s) => ({
      ...s,
      lat: Number(s.latitude),
      lng: Number(s.longitude),
    }))
    .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));

  // Puntos solo con coordenadas para la ruta OSRM
  const routePoints = points.map((p) => ({ lat: p.lat, lng: p.lng }));

  return (
    <div style={{ width: "100%" }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={8}
        scrollWheelZoom={false}
        style={{
          height,
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        <FitBounds points={points} />

        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; OpenStreetMap contributors'
        />

        {/* Ruta trazada con etiquetas de tiempo/distancia por tramo */}
        <RouteLayer points={routePoints} color="#818cf8" />

        {points.map((p) => {
          const coords = `${p.lat},${p.lng}`;
          const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}&travelmode=driving&dir_action=navigate`;
          const wazeUrl = `https://waze.com/ul?ll=${encodeURIComponent(coords)}&navigate=yes`;
          const statusStyle = stopStatusColor(p.status);

          return (
            <Marker
              key={`${p.routeId}-${p.routeStopId}`}
              position={[p.lat, p.lng]}
              icon={makeStopIcon(p.stopOrder, p.status)}
            >
              <Popup>
                <div style={{ minWidth: "210px", fontFamily: "inherit" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    #{p.stopOrder} — {p.clientNameSnapshot}
                  </div>

                  {p.addressSnapshot && (
                    <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
                      {p.addressSnapshot}
                    </div>
                  )}

                  <div style={{ marginBottom: 10 }}>
                    <span style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {stopStatusToEs(p.status)}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <a
                      href={googleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={navLinkStyle("#4285F4")}
                    >
                      🗺 Google Maps
                    </a>
                    <a
                      href={wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={navLinkStyle("#33CCFF")}
                    >
                      🚗 Waze
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
