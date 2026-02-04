import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ClientMap from "../Components/ClientMap";
import { getClientById } from "../../../api/clients.api";
import "./clients.css"; 


const ClientDetailPage = () => {
    const { id } = useParams();
    const [client, setClient] = useState(null);

    useEffect(() => {
        if (!id) return;

        getClientById(id).then(res => {
            setClient(res.data);
        });
    }, [id]);

    if (!client) return null;

    return (
        <div className="clients-page">
            <div className="clients-card">
                <h2>{client.clientName}</h2>

                <p><strong>Correo:</strong> {client.clientEmail}</p>
                <p><strong>Teléfono:</strong> {client.clientPhone}</p>

                <ClientMap
                    location={client.location}
                    name={client.clientName}
                />
            </div>
        </div>
    );
};

export default ClientDetailPage;
