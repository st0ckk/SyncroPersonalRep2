import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getClients,
  getInactiveClients,
  deactivateClient,
  activateClient,
} from "../../../api/clients.api";
import { getLatestQuoteByClient } from "../../../api/quote.api";

import { PageCard, Toolbar, FilterBar, DataTable, StatusBadge, Button } from "../../../components";
import ClientMap from "../components/ClientMap";
import ClientStateModal from "../components/Modals/ClientStateModal";

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [quoteInfo, setQuoteInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [clientType, setClientType] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [clientState, setClientState] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.userRole;
  const isDriver = role === "Chofer";

  const loadQuote = async (id) => {
    try {
      if (id) {
        const response = await getLatestQuoteByClient(id);
        setQuoteInfo(response.data ?? null);
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
    return `₡${parseFloat(amount).toFixed(2)}`;
  };

  const formatStatusType = (statusString, date) => {
    const currentDate = new Date();
    const validDate = new Date(date);
    if (statusString === "expired" || currentDate > validDate) return "Expirada";
    switch (statusString) {
      case "pending": return "Pendiente";
      case "approved": return "Aprobada";
      case "rejected": return "Rechazada";
      default: return "Sin estado";
    }
  };

  const loadData = async () => {
    try {
      let response;
      if (search || clientType) {
        response = await getClients();
        let data = response.data ?? [];
        if (search) {
          const q = search.toLowerCase();
          data = data.filter(c => c.clientName.toLowerCase().includes(q) || c.clientId.toLowerCase().includes(q));
        }
        if (clientType) {
          data = data.filter(c => (c.clientType || "").toLowerCase() === clientType);
        }
        data = showInactive ? data.filter(c => !c.isActive) : data.filter(c => c.isActive);
        setClients(data);
      } else {
        response = showInactive ? await getInactiveClients() : await getClients();
        setClients(response.data ?? []);
      }
    } catch (err) {
      console.error("Error cargando clientes", err);
    }
  };

  useEffect(() => { loadData(); }, [showInactive, search, clientType]);

  const handleClientState = async () => {
    if (isDriver) return;
    await deactivateClient(clientState);
    setOpenModal(false);
    loadData();
  };

  const columns = [
    { key: "clientName", header: "Nombre", render: (c) => <span className="cell-name">{c.clientName}</span> },
    { key: "clientEmail", header: "Correo" },
    { key: "clientPhone", header: "Teléfono" },
    { key: "clientType", header: "Tipo", render: (c) => c.clientType || "-" },
    { key: "status", header: "Estado", render: (c) => <StatusBadge status={c.isActive ? "Activo" : "Inactivo"} /> },
    {
      key: "actions", header: "Acciones", className: "actions",
      render: (c, { toggleExpand, isExpanded }) => (
        <>
          <Button variant="info" onClick={toggleExpand}>
            {isExpanded ? "Ocultar" : "Más información"}
          </Button>
          {!isDriver && (
            <>
              <Link to={`/clientes/editar/${c.clientId}`} className="btn btn-warning">Editar</Link>
              {c.isActive ? (
                <Button variant="danger" onClick={() => { setClientState(c.clientId); setOpenModal(true); }}>Desactivar</Button>
              ) : (
                <Button variant="success" onClick={async () => { await activateClient(c.clientId); loadData(); }}>Activar</Button>
              )}
            </>
          )}
        </>
      ),
    },
  ];

  const renderExpanded = (c) => {
    loadQuote(c.clientId);
    return (
      <div className="clients-expanded-section-flex">
        <div className="clients-expanded-info">
          <h2>Detalles de cliente:</h2>
          <section>
            <strong>Cédula jurídica:</strong><br />{c.clientId}<br />
            <strong>Correo:</strong><br />{c.clientEmail || "N/A"}<br />
            <strong>Teléfono:</strong><br />{c.clientPhone || "N/A"}<br />
            <strong>Tipo:</strong><br />{c.clientType || "N/A"}<br />
          </section>
        </div>

        <div className="clients-expanded-location">
          <h2>Ubicación:</h2>
          <section>
            <strong>Provincia:</strong><br />{c.provinceName}<br />
            <strong>Cantón:</strong><br />{c.cantonName}<br />
            <strong>Distrito:</strong><br />{c.districtName}<br />
            <strong>Dirección exacta:</strong><br />{c.exactAddress || "N/A"}<br />
          </section>
        </div>

        <div className="clients-expanded-quote">
          <h2>Cotización más reciente:</h2>
          <section>
            <strong>Número de cotización:</strong><br />{quoteInfo ? quoteInfo.quoteNumber : "N/A"}<br />
            <strong>Estado:</strong><br />{quoteInfo ? formatStatusType(quoteInfo.quoteStatus, quoteInfo.quoteValidTil) : "N/A"}<br />
            <strong>Vigencia:</strong><br />{quoteInfo ? formatDate(quoteInfo.quoteValidTil) : "N/A"}<br />
            <strong>Total:</strong><br />{quoteInfo ? formatCurrency(quoteInfo.quoteTotal - quoteInfo.quoteTotal * (quoteInfo.quoteDiscountPercentage / 100)) : "N/A"}<br />
          </section>
        </div>

        {c.location ? (
          <div style={{ marginTop: 12, width: "100%" }}>
            <ClientMap location={c.location} name={c.clientName} isActive={c.isActive} />
          </div>
        ) : (
          <p><em>Cliente sin ubicación geográfica</em></p>
        )}
      </div>
    );
  };

  return (
    <PageCard>
      <Toolbar title="Clientes">
        <Button variant={!showInactive ? "primary" : "outline"} onClick={() => setShowInactive(false)}>Activos</Button>
        <Button variant={showInactive ? "primary" : "outline"} onClick={() => setShowInactive(true)}>Inactivos</Button>
        {!isDriver && <Link to="/clientes/nuevo" className="btn btn-primary">Agregar cliente</Link>}
      </Toolbar>

      <FilterBar>
        <input type="text" placeholder="Buscar cliente o ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={clientType ?? ""} onChange={(e) => setClientType(e.target.value || null)}>
          <option value="">Todos los tipos</option>
          <option value="extranjero">Extranjero</option>
          <option value="pulpero">Pulpero</option>
          <option value="rutero">Rutero</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={clients}
        rowKey="clientId"
        emptyMessage="No hay clientes"
        renderExpanded={renderExpanded}
      />

      {!isDriver && openModal && (
        <ClientStateModal closeModal={setOpenModal} confirmStateChange={handleClientState} />
      )}
    </PageCard>
  );
};

export default ClientsPage;
