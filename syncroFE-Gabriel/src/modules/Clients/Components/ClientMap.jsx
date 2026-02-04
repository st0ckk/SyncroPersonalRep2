import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const ClientMap = ({ location, name }) => {
    if (!location) return <p>Sin ubicación</p>;

    return (
        <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={15}
            style={{ height: "400px" }}
        >
            <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution='&copy; <<a href="https://www.openstreetmap.org/copyright">'
            />

            <Marker position={[location.latitude, location.longitude]}>
                <Popup>{name}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default ClientMap;
