import { useState, useEffect } from "react";
import { Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import { fetchOsrmRoute } from "../../../utils/osrmRoute";

/**
 * Icono de etiqueta para el tramo entre dos paradas.
 * Muestra duración y distancia centrado en el punto medio del tramo.
 */
function makeLegIcon(durationMin, distanceKm, color) {
  return L.divIcon({
    className: "",
    // transform: translate(-50%, -50%) centra el div sobre la coordenada exacta
    html: `<div style="
      transform: translate(-50%, -50%);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #fff;
      color: #1e293b;
      border: 1.5px solid ${color};
      border-left: 4px solid ${color};
      padding: 2px 8px 2px 6px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 1px 6px rgba(0,0,0,0.18);
      pointer-events: none;
      line-height: 1.6;
    ">⏱ ${durationMin} min &nbsp;·&nbsp; ${distanceKm} km</div>`,
    iconSize: [0, 0],   // sin tamaño fijo — el div se expande por su contenido
    iconAnchor: [0, 0], // el translate(-50%,-50%) hace el centrado real
  });
}

/**
 * Componente que dibuja la ruta OSRM sobre el mapa y etiquetas de tiempo/distancia
 * por tramo. Se coloca dentro de un <MapContainer>.
 *
 * @param {{ points: {lat:number, lng:number}[], color?: string }} props
 */
export default function RouteLayer({ points, color = "#6366f1" }) {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!points || points.length < 2) {
      setRouteData(null);
      return;
    }

    setLoading(true);
    fetchOsrmRoute(points)
      .then(setRouteData)
      .finally(() => setLoading(false));
  }, [JSON.stringify(points)]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !routeData) return null;

  return (
    <>
      <Polyline
        positions={routeData.polyline}
        pathOptions={{ color, weight: 5, opacity: 0.75 }}
      />

      {routeData.legs.map((leg, i) => (
        <Marker
          key={i}
          position={[leg.midLat, leg.midLng]}
          icon={makeLegIcon(leg.durationMin, leg.distanceKm, color)}
          interactive={false}
          zIndexOffset={1000}
        />
      ))}
    </>
  );
}
