import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";

const costaRicaBounds = [
    [8.45, -85.95],
    [11.15, -82.55]
];

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

// Icono resaltado para el cliente seleccionado desde el buscador.
const highlightIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Vuela al cliente seleccionado desde el buscador
function FlyToClient({ target }) {
    const map = useMap();
    useEffect(() => {
        if (target) map.flyTo([target.lat, target.lng], 16, { duration: 1 });
    }, [target, map]);
    return null;
}

const ClientsMap = ({ clients }) => {
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [flyTarget, setFlyTarget] = useState(null);
    const [highlightId, setHighlightId] = useState(null);
    const searchRef = useRef(null);

    const clientsWithLocation = clients.filter(
        c =>
            c.location &&
            c.location.latitude != null &&
            c.location.longitude != null
    );

    const searchResults = search.trim().length >= 2
        ? clients.filter(c =>
            c.clientName?.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 8)
        : [];

    const handleSelectFromSearch = (client) => {
        setSearch(client.clientName);
        setShowDropdown(false);
        setHighlightId(client.clientId);

        if (client.location?.latitude != null && client.location?.longitude != null) {
            setFlyTarget({ lat: Number(client.location.latitude), lng: Number(client.location.longitude) });
        }
    };

    return (
        <div style={{ position: "relative" }}>
            {/* ── Buscador flotante ── */}
            <div
                style={{
                    position: "absolute",
                    top: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1000,
                    width: "min(360px, 90vw)",
                }}
                ref={searchRef}
            >
                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: showDropdown && searchResults.length ? "8px 8px 0 0" : 8,
                        border: "none",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                />
                {showDropdown && searchResults.length > 0 && (
                    <div style={{
                        background: "#fff",
                        borderRadius: "0 0 8px 8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        overflow: "hidden",
                    }}>
                        {searchResults.map(c => (
                            <div
                                key={c.clientId}
                                onMouseDown={() => handleSelectFromSearch(c)}
                                style={{
                                    padding: "9px 14px",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    borderBottom: "1px solid #f0f0f0",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                                <span>{c.clientName}</span>
                                {!c.location?.latitude && (
                                    <span style={{ fontSize: 11, color: "#999" }}>Sin ubicación</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <MapContainer
                bounds={costaRicaBounds}
                minZoom={8}
                maxBounds={costaRicaBounds}
                maxBoundsViscosity={1.0}
                style={{ height: "85vh", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                <FlyToClient target={flyTarget} />

                {clientsWithLocation.map((c) => {
                    const lat = Number(c.location.latitude);
                    const lng = Number(c.location.longitude);
                    const address = c.location.address?.trim();

                    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

                    const coords = `${lat},${lng}`;
                    const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}&travelmode=driving&dir_action=navigate`;
                    const wazeUrl = `https://waze.com/ul?ll=${encodeURIComponent(coords)}&navigate=yes`;

                    const isHighlighted = highlightId === c.clientId;

                    return (
                        <Marker
                            key={c.clientId}
                            position={[lat, lng]}
                            icon={isHighlighted ? highlightIcon : new L.Icon.Default()}
                        >
                            <Popup>
                                <div style={{ minWidth: "220px", fontFamily: "inherit" }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                                        {c.clientName}
                                    </div>

                                    {address && (
                                        <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
                                            {address}
                                        </div>
                                    )}

                                    <div style={{ marginBottom: 10 }}>
                                        <span style={{
                                            background: c.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                                            color: c.isActive ? "#15803d" : "#b91c1c",
                                            padding: "2px 8px",
                                            borderRadius: 999,
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}>
                                            {c.isActive ? "Activo" : "Inactivo"}
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <Link to={`/clientes/${c.clientId}`} style={navLinkStyle("#2563eb")}>
                                            👤 Ver cliente
                                        </Link>
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
};

export default ClientsMap;
