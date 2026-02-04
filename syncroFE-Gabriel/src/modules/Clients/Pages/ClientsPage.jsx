import { useEffect, useState } from "react";
import {
    getClients,
    getInactiveClients,
    deactivateClient,
    activateClient
} from "../../../api/clients.api";
import { Link } from "react-router-dom";
import "./clients.css"; 


const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [expandedClientId, setExpandedClientId] = useState(null);

    const loadClients = async () => {
        const res = showInactive
            ? await getInactiveClients()
            : await getClients();

        setClients(res.data);
    };

    useEffect(() => {
        loadClients();
    }, [showInactive]);

    const toggleMoreInfo = (id) => {
        setExpandedClientId(prev => (prev === id ? null : id));
    };

    return (
        <div className="clients-page">
            <div className="clients-card">

                <div className="clients-toolbar">
                    <h1>Clientes</h1>

                    <div className="toolbar-actions">
                        <button
                            className={`btn ${!showInactive ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setShowInactive(false)}
                        >
                            Activos
                        </button>

                        <button
                            className={`btn ${showInactive ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setShowInactive(true)}
                        >
                            Inactivos
                        </button>

                        <Link to="/clientes/nuevo" className="btn btn-primary">
                            Agregar cliente
                        </Link>
                    </div>
                </div>

                <table className="clients-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Teléfono</th>
                            <th>Tipo</th>
                            <th>Total compras</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {clients.map(c => (
                            <>
                                <tr key={c.clientId}>
                                    <td className="name">{c.clientName}</td>
                                    <td>{c.clientEmail}</td>
                                    <td>{c.clientPhone}</td>
                                    <td>{c.clientType || "-"}</td>
                                    <td>₡ {c.totalPurchases ?? 0}</td>

                                    <td>
                                        <span
                                            className={
                                                c.isActive
                                                    ? "status-active"
                                                    : "status-inactive"
                                            }
                                        >
                                            {c.isActive ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>

                                    <td className="actions">
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => toggleMoreInfo(c.clientId)}
                                        >
                                            Más información
                                        </button>

                                        <Link
                                            to={`/clientes/editar/${c.clientId}`}
                                            className="btn btn-outline"
                                        >
                                            Editar
                                        </Link>

                                        {c.isActive ? (
                                            <button
                                                className="btn btn-danger"
                                                onClick={async () => {
                                                    await deactivateClient(c.clientId);
                                                    loadClients();
                                                }}
                                            >
                                                Desactivar
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success"
                                                onClick={async () => {
                                                    await activateClient(c.clientId);
                                                    loadClients();
                                                }}
                                            >
                                                Activar
                                            </button>
                                        )}
                                    </td>
                                </tr>

                                {expandedClientId === c.clientId && (
                                    <tr className="client-extra">
                                        <td colSpan={7}>
                                            <strong>Provincia:</strong>{" "}
                                            {c.provinceCode || "N/A"} <br />

                                            <strong>Cantón:</strong>{" "}
                                            {c.cantonCode || "N/A"} <br />

                                            <strong>Distrito:</strong>{" "}
                                            {c.districtCode || "N/A"} <br />

                                            <strong>Dirección:</strong>{" "}
                                            {c.exactAddress || "N/A"}

                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientsPage;
