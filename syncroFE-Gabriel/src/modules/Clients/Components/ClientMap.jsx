import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const ClientMap = ({ location, name, isActive }) => {
    if (!location) return <p>Sin ubicación</p>;

    const lat = Number(location.latitude);
    const lng = Number(location.longitude);
    const address = location.address?.trim();
    const coords = `${lat},${lng}`;

    const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}&travelmode=driving&dir_action=navigate`;
    const wazeUrl = `https://waze.com/ul?ll=${encodeURIComponent(coords)}&navigate=yes`;

    return (
        <MapContainer
            center={[lat, lng]}
            zoom={15}
            style={{ height: "400px" }}
        >
            <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; OpenStreetMap contributors'
            />

            <Marker position={[lat, lng]}>
                <Popup>
                    <div style={{ minWidth: "200px", fontFamily: "inherit" }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                            {name}
                        </div>

                        {address && (
                            <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>
                                {address}
                            </div>
                        )}

                        {isActive !== undefined && (
                            <div style={{ marginBottom: 10 }}>
                                <span style={{
                                    background: isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                                    color: isActive ? "#15803d" : "#b91c1c",
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    fontWeight: 600,
                                }}>
                                    {isActive ? "Activo" : "Inactivo"}
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
        </MapContainer>
    );
};

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

export default ClientMap;
