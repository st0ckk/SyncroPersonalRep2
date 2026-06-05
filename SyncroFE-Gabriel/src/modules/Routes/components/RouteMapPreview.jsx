import { useEffect } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
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

function makeStopIcon(order) {
    return L.divIcon({
        className: "",
        html: `<div style="
            width: 28px;
            height: 28px;
            background: #2563eb;
            border: 2px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        ">${order}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
    });
}

function FitStops({ stops }) {
    const map = useMap();

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();

            if (!stops.length) {
                map.setView(DEFAULT_CENTER, 8);
                return;
            }

            if (stops.length === 1) {
                map.setView(
                    [Number(stops[0].latitude), Number(stops[0].longitude)],
                    14
                );
                return;
            }

            const bounds = stops.map((s) => [
                Number(s.latitude),
                Number(s.longitude),
            ]);

            map.fitBounds(bounds, { padding: [40, 40] });
        }, 150);
    }, [map, stops]);

    return null;
}

export default function RouteMapPreview({ stops, height = "280px" }) {
    const validStops = (stops ?? []).filter(
        (s) =>
            s.latitude != null &&
            s.longitude != null &&
            !Number.isNaN(Number(s.latitude)) &&
            !Number.isNaN(Number(s.longitude))
    );

    const routePoints = validStops.map((s) => ({
        lat: Number(s.latitude),
        lng: Number(s.longitude),
    }));

    return (
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
            <FitStops stops={validStops} />

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />

            <RouteLayer points={routePoints} color="#2563eb" />

            {validStops.map((stop) => {
                const lat = Number(stop.latitude);
                const lng = Number(stop.longitude);
                const name = stop.clientNameSnapshot || stop.clientName || stop.clientId;
                const address = stop.addressSnapshot || stop.address;
                const coords = `${lat},${lng}`;

                const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}&travelmode=driving&dir_action=navigate`;
                const wazeUrl = `https://waze.com/ul?ll=${encodeURIComponent(coords)}&navigate=yes`;

                return (
                    <Marker
                        key={`${stop.clientId}-${stop.stopOrder}`}
                        position={[lat, lng]}
                        icon={makeStopIcon(stop.stopOrder)}
                    >
                        <Popup>
                            <div style={{ minWidth: "200px", fontFamily: "inherit" }}>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                                    #{stop.stopOrder} — {name}
                                </div>

                                {address && (
                                    <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
                                        {address}
                                    </div>
                                )}

                                {stop.status && (
                                    <div style={{ marginBottom: 10 }}>
                                        <span style={{
                                            background: "rgba(37,99,235,0.12)",
                                            color: "#4338ca",
                                            padding: "2px 8px",
                                            borderRadius: 999,
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}>
                                            {stopStatusToEs(stop.status)}
                                        </span>
                                    </div>
                                )}

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
    );
}
