const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

/**
 * Consulta OSRM para obtener la ruta real por carretera entre una lista de puntos.
 * @param {Array<{lat: number, lng: number}>} points - Puntos en orden de visita
 * @returns {Promise<{polyline: [number,number][], legs: LegInfo[]} | null>}
 */
export async function fetchOsrmRoute(points) {
  if (!points || points.length < 2) return null;

  const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];

    // OSRM devuelve [lng, lat] → invertimos a [lat, lng] para Leaflet
    const polyline = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    // Un "leg" = tramo entre parada i y parada i+1
    const legs = route.legs.map((leg, i) => ({
      durationMin: Math.round(leg.duration / 60),
      distanceKm: (leg.distance / 1000).toFixed(1),
      midLat: (points[i].lat + points[i + 1].lat) / 2,
      midLng: (points[i].lng + points[i + 1].lng) / 2,
    }));

    return { polyline, legs };
  } catch {
    return null;
  }
}
