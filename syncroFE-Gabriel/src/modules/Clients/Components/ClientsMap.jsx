import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";

const costaRicaBounds = [
    [8.45, -85.95],
    [11.15, -82.55]
];

const ClientsMap = ({ clients }) => {
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
                attribution='&copy; <<a href="https://www.openstreetmap.org/copyright">'
            />

            {clients.map(c =>
                c.location ? (
                    <Marker
                        key={c.clientId}
                        position={[
                            c.location.latitude,
                            c.location.longitude
                        ]}
                    >
                        <Popup>
                            <strong>{c.clientName}</strong><br />
                            <Link to={`/clientes/${c.clientId}`}>
                                Ver cliente
                            </Link>
                        </Popup>
                    </Marker>
                ) : null
            )}
        </MapContainer>
    );
};

export default ClientsMap;
