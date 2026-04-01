import { Fragment, useEffect, useState } from "react";
import {
  getClients,
  getInactiveClients,
  deactivateClient,
  activateClient,
} from "../../../api/clients.api";

import { getLatestQuoteByClient } from "../../../api/quote.api";

import { Link } from "react-router-dom";
import "./clients.css";

import ClientFilters from "../components/ClientFilters";
import ClientMap from "../components/ClientMap";
import ClientStateModal from "../components/Modals/ClientStateModal";
import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [quoteInfo, setQuoteInfo] = useState(null);

  const [search, setSearch] = useState("");
  const [clientType, setClientType] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [clientState, setClientState] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.userRole;
  const isDriver = role === "Chofer";

  const pagination = usePagination(clients);

  const loadQuote = async (id) => {
    try {
      if (id) {
        const response = await getLatestQuoteByClient(id);
        setQuoteInfo(response.data ?? []);
      } else {
        setQuoteInfo(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-CR");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₡0.00";
    const fixedAmount = parseFloat(amount);
    return `₡${fixedAmount.toFixed(2)}`;
  };

  const formatStatusType = (statusString, date) => {
    let status = "";
    const currentDate = new Date();
    const validDate = new Date(date);

    if (statusString === "expired" || currentDate > validDate) {
      status = "Expirada";
    } else {
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
          status = "Sin estado";
          break;
      }
    }

    return status;
  };

  const loadData = async () => {
    try {
      let response;

      if (search || clientType) {
        response = await getClients();
        let data = response.data ?? [];

        if (search) {
          const q = search.toLowerCase();
          data = data.filter(
            (c) =>
              c.clientName.toLowerCase().includes(q) ||
              c.clientId.toLowerCase().includes(q)
          );
        }

        if (clientType) {
          data = data.filter(
            (c) => (c.clientType || "").toLowerCase() === clientType
          );
        }

        if (showInactive) {
          data = data.filter((c) => !c.isActive);
        } else {
          data = data.filter((c) => c.isActive);
        }

        setClients(data);
      } else {
        response = showInactive ? await getInactiveClients() : await getClients();
        setClients(response.data ?? []);
      }
    } catch (err) {
      console.error("Error cargando clientes", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [showInactive, search, clientType]);

  const toggleMoreInfo = (id) => {
    setExpandedClientId((prev) => (prev === id ? null : id));
    loadQuote(id);
  };

  const handleClientState = async () => {
    if (isDriver) return;

    await deactivateClient(clientState);
    setOpenModal(false);
    loadData();
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

            {!isDriver && (
              <Link to="/clientes/nuevo" className="btn btn-primary">
                Agregar cliente
              </Link>
            )}
          </div>
        </div>

        {isDriver && (
          <div
            style={{
              marginBottom: "14px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "#f5f7fb",
              border: "1px solid #d9e2f1",
              color: "#4b5563",
              fontSize: "14px",
            }}
          >
            Modo solo lectura: como chofer puedes ver los clientes, pero no
            puedes agregar, editar, activar ni desactivar.
          </div>
        )}

        <ClientFilters
          search={search}
          clientType={clientType}
          onSearchChange={setSearch}
          onClientTypeChange={setClientType}
        />

        <div className="table-scroll">
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
            {pagination.paginatedData.map((c) => (
              <Fragment key={c.clientId}>
                <tr>
                  <td className="name">{c.clientName}</td>
                  <td>{c.clientEmail}</td>
                  <td>{c.clientPhone}</td>
                  <td>{c.clientType || "-"}</td>
                  <td>₡ {c.totalPurchases ?? 0}</td>

                  <td>
                    <span
                      className={
                        c.isActive ? "status-active" : "status-inactive"
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
                      {expandedClientId === c.clientId
                        ? "Ocultar información"
                        : "Más información"}
                    </button>

                    {!isDriver && (
                      <>
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
                      </>
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
                          <h2>Ubicación:</h2>
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
                          <h2>Cotización más reciente:</h2>
                          <section>
                            <span>
                              <strong>Número de cotización:</strong>
                              <br />
                              {quoteInfo ? quoteInfo.quoteNumber : "N/A"}
                              <br />
                              <strong>Estado:</strong>
                              <br />
                              {quoteInfo
                                ? formatStatusType(
                                    quoteInfo.quoteStatus,
                                    quoteInfo.quoteValidTil
                                  )
                                : "N/A"}
                              <br />
                              <strong>Vigencia:</strong>
                              <br />
                              {quoteInfo
                                ? formatDate(quoteInfo.quoteValidTil)
                                : "N/A"}
                              <br />
                              <strong>Total:</strong>
                              <br />
                              {quoteInfo
                                ? formatCurrency(
                                    quoteInfo.quoteTotal -
                                      quoteInfo.quoteTotal *
                                        (quoteInfo.quoteDiscountPercentage / 100)
                                  )
                                : "N/A"}
                              <br />
                            </span>
                          </section>
                        </div>
                      </div>

                      {c.location ? (
                        <div style={{ marginTop: 12 }}>
                          <ClientMap location={c.location} name={c.clientName} isActive={c.isActive} />
                        </div>
                      ) : (
                        <p>
                          <em>Cliente sin ubicación geográfica</em>
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        </div>
        <PaginationControls {...pagination} />
      </div>

      {!isDriver && openModal && (
        <ClientStateModal
          closeModal={setOpenModal}
          confirmStateChange={handleClientState}
        />
      )}
    </div>
  );
};

export default ClientsPage;