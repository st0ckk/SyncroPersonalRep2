import { useEffect, useState } from "react";
import { getClients } from "../../../api/clients.api";
import ClientsMap from "../Components/ClientsMap";
import "./clients.css"; 


const ClientsMapPage = () => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        getClients().then(res => setClients(res.data));
    }, []);

    return (
        <div>
            <h1>Mapa de Clientes</h1>
            <ClientsMap clients={clients} />
        </div>
    );
};

export default ClientsMapPage;
