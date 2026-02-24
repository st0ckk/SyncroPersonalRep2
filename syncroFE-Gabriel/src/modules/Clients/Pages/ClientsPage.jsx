import { useEffect, useState } from "react";
import {
    getClients,
    getInactiveClients,
    deactivateClient,
    activateClient
} from "../../../api/clients.api";

import { getLatestQuoteByClient } from "../../../api/quote.api";

import { Link } from "react-router-dom";
import "./clients.css";

import ClientFilters from "../Components/ClientFilters";
import ClientMap from "../Components/ClientMap";
import ClientStateModal from "../Components/Modals/ClientStateModal";

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [expandedClientId, setExpandedClientId] = useState(null);
    const [quoteInfo, setQuoteInfo] = useState(null);

    // filtros
    const [search, setSearch] = useState("");
    const [clientType, setClientType] = useState(null);

    // modal
    const [openModal, setOpenModal] = useState(false);
    const [clientState, setClientState] = useState(null);

    const loadQuote = async (id) => {
        try {
            if (id)
            {
                const response = await getLatestQuoteByClient(id);
                setQuoteInfo(response.data ?? []);
            }
            else
            {
                setQuoteInfo(null);
            }

        } catch( err ) {
            console.log(err);
        } 
    }

    //Formateo de fechas
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-CR");
    };

    //Formateo para moneda
    const formatCurrency = (amount) => {
        if (!amount) return "₡0.00";
        var fixedAmount = parseFloat(amount);
        return `₡${fixedAmount.toFixed(2)}`;
    }

    //Formateo de tipos de estados
    const formatStatusType = (statusString, date) => {
        var status = "";
        var currentDate = new Date();
        var validDate = new Date(date);

        if (statusString == "expired" || currentDate > validDate) {
            status = "Expirada";
        }
        else {
            switch (statusString) {
                case "pending":
                    status = "Pendiente";
                    break;
                case "approved":
                    status = "Aprobada";
                    break;
                case "rejected":
                    status = "Rechazada";
                    break;
                default:
                    status = "Sin estado"
                    break;
            }
        }
        return status;
    }

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
        loadQuote(id);
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
                                            <div className="clients-expanded-section-flex">
                                            <div className="clients-expanded-info">
                                            <h2>Detalles de cliente:</h2>
                                                <section>
                                                    <span>
                                                        <strong>Cédula jurídica:</strong>
                                                        <br />
                                                        {c.clientId}
                                                        <br />
                                                        <strong>Correo:</strong>
                                                        <br />
                                                        {c.clientEmail || "N/A"}
                                                        <br />
                                                        <strong>Teléfono:</strong>
                                                        <br />
                                                        {c.clientPhone || "N/A"}
                                                        <br />
                                                        <strong>Tipo:</strong>
                                                        <br />
                                                        {c.clientType || "N/A"}
                                                        <br />
                                                    </span>
                                                </section>
                                                </div>

                                                <div className="clients-expanded-location">
                                                    <h2>Ubicacion:</h2>
                                                    <section>
                                                        <span>
                                                            <strong>Provincia:</strong>
                                                            <br />
                                                            {c.provinceName}
                                                            <br />
                                                            <strong>Cantón:</strong>
                                                            <br />
                                                            {c.cantonName}
                                                            <br />
                                                            <strong>Distrito:</strong>
                                                            <br />
                                                            {c.districtName}
                                                            <br />
                                                            <strong>Dirección exacta:</strong>
                                                            <br />
                                                            {c.exactAddress || "N/A"}
                                                            <br />
                                                        </span>
                                                    </section>
                                                </div>

                                                <div className="clients-expanded-quote">
                                                    <h2>Cotizacion mas reciente:</h2>
                                                    <section>
                                                        <span>
                                                            <strong>Numero de cotizacion:</strong>
                                                            <br />
                                                            {quoteInfo ? quoteInfo.quoteNumber : "N/A"}
                                                            <br />
                                                            <strong>Estado:</strong>
                                                            <br />
                                                            {quoteInfo ? formatStatusType(quoteInfo.quoteStatus) : "N/A"}
                                                            <br />
                                                            <strong>Vigencia:</strong>
                                                            <br />
                                                            {quoteInfo ? formatDate(quoteInfo.quoteValidTil) : "N/A"}
                                                            <br />
                                                            <strong>Total:</strong>
                                                            <br />
                                                            {quoteInfo ? formatCurrency(quoteInfo.quoteTotal - (quoteInfo.quoteTotal * (quoteInfo.quoteDiscountPercentage / 100))) : "N/A"}
                                                            <br />
                                                        </span>
                                                    </section>
                                                </div>
                                            </div>
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
