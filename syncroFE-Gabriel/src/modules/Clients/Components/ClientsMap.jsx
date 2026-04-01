import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";

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

const ClientsMap = ({ clients }) => {
    const clientsWithLocation = clients.filter(
        c =>
            c.location &&
            c.location.latitude != null &&
            c.location.longitude != null
    );

    return (
        <MapContainer
            bounds={costaRicaBounds}
            minZoom={8}
            maxBounds={costaRicaBounds}
            maxBoundsViscosity={1.0}
            style={{ height: "85vh", width: "100%" }}
        >
            <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; OpenStreetMap contributors'
            />

            {clientsWithLocation.map((c) => {
                const lat = Number(c.location.latitude);
                const lng = Number(c.location.longitude);
                const address = c.location.address?.trim();

                if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

                const coords = `${lat},${lng}`;
                const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}&travelmode=driving&dir_action=navigate`;
                const wazeUrl = `https://waze.com/ul?ll=${encodeURIComponent(coords)}&navigate=yes`;

                return (
                    <Marker key={c.clientId} position={[lat, lng]}>
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
                                    <Link
                                        to={`/clientes/${c.clientId}`}
                                        style={navLinkStyle("#6366f1")}
                                    >
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
    );
};

export default ClientsMap;
