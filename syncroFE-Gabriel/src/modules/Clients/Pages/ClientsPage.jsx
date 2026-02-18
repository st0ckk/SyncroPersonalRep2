import { useEffect, useState } from "react";
import {
    getClients,
    getInactiveClients,
    deactivateClient,
    activateClient
} from "../../../api/clients.api";

import { Link } from "react-router-dom";
import "./clients.css";

import ClientFilters from "../Components/ClientFilters";
import ClientMap from "../Components/ClientMap";
import ClientStateModal from "../Components/Modals/ClientStateModal";

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [expandedClientId, setExpandedClientId] = useState(null);

    // filtros
    const [search, setSearch] = useState("");
    const [clientType, setClientType] = useState(null);

    // modal
    const [openModal, setOpenModal] = useState(false);
    const [clientState, setClientState] = useState(null);

    /* ======================
       CARGA DE DATOS 
    ====================== */
    const loadData = async () => {
        try {
            let response;

            if (search || clientType) {
                response = await getClients(search);
                let data = response.data ?? [];

                if (search) {
                    const q = search.toLowerCase();
                    data = data.filter(c =>
                        c.clientName.toLowerCase().includes(q) ||
                        c.clientId.includes(q)
                    );
                }

                if (clientType) {
                    data = data.filter(c => c.clientType.toLowerCase() === clientType);
                }

                setClients(data);
            } else {
                response = showInactive
                    ? await getInactiveClients()
                    : await getClients();

                setClients(response.data ?? []);
            }
        } catch (err) {
            console.error("Error cargando clientes", err);
        }
    };

    /* ======================
       EFECTO PRINCIPAL
    ====================== */
    useEffect(() => {
        loadData();
    }, [showInactive, search, clientType]);

    /* ======================
       HANDLERS
    ====================== */
    const toggleMoreInfo = (id) => {
        setExpandedClientId(prev => (prev === id ? null : id));
    };

    const handleClientState = async () => {
        await deactivateClient(clientState);
        setOpenModal(false);
        loadData(); 
    };

    /* ======================
       RENDER
    ====================== */
    return (
        <div className="clients-page">
            <div className="clients-card">

                {/* TOOLBAR */}
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

                {/* FILTROS */}
                <ClientFilters
                    search={search}
                    clientType={clientType}
                    onSearchChange={setSearch}
                    onClientTypeChange={setClientType}
                />

                {/* TABLA */}
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
                                                onClick={() => {
                                                    setClientState(c.clientId);
                                                    setOpenModal(true);
                                                }}
                                            >
                                                Desactivar
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success"
                                                onClick={async () => {
                                                    await activateClient(c.clientId);
                                                    loadData(); 
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
                                            <strong>Cédula jurídica:</strong> {c.clientId}<br />
                                            <strong>Correo:</strong> {c.clientEmail || "N/A"}<br />
                                            <strong>Teléfono:</strong> {c.clientPhone || "N/A"}<br />
                                            <strong>Tipo:</strong> {c.clientType || "N/A"}<br /><br />

                                            <strong>Provincia:</strong> {c.provinceName}<br />
                                            <strong>Cantón:</strong> {c.cantonName}<br />
                                            <strong>Distrito:</strong> {c.districtName}<br />
                                            <strong>Dirección exacta:</strong> {c.exactAddress || "N/A"}<br />

                                            {c.location ? (
                                                <div style={{ marginTop: 12 }}>
                                                    <ClientMap
                                                        location={c.location}
                                                        name={c.clientName}
                                                    />
                                                </div>
                                            ) : (
                                                <p><em>Cliente sin ubicación geográfica</em></p>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {openModal && (
                <ClientStateModal
                    closeModal={setOpenModal}
                    confirmStateChange={handleClientState}
                />
            )}
        </div>
    );
};

export default ClientsPage;
