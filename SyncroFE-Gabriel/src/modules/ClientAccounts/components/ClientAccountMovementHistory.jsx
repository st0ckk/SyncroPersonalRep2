import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    filterAccountMovements,
    generateAccountStatement,
} from "../../../api/clientAccount.api";

import ClientAccountMovementFilters from "../components/ClientAccountMovementFilters";
function ClientAccountMovementHistory({
    account,
    onCancel,
}) {
    // Datos
    const [movements, setMovements] = useState([]);

    // Filtros
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    //PDF
    const [loadingPdf, setLoadingPdf] = useState(null);

    //Formateo de fechas
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-CR");
    };

    //Formateo para moneda
    const formatCurrency = (amount) => {
        var fixedAmount = parseFloat(amount);
        return `₡ ${fixedAmount.toFixed(2)}`;
    }

    //Formateo de tipos de estados
    const formatType = (statusString) => {
        var status = "";
        switch (statusString) {
            case "debit":
                status = "Debito";
                break;
            case "credit":
                status = "Credito";
                break;
            default:
                status = "Sin estado"
                break;
        }
        return status;
    }

    //Descarga de PDFs
    const handlePDFDownload = async (id) => {

        setLoadingPdf(id);

        try {
            console.log(`${id} ${startDate} ${endDate} ${search} ${type}`)
            const blob = await generateAccountStatement(id, startDate, endDate, search, type);

            //Aqui creamos un url para el pdf con el fin de descargarlo y quitarlo
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Estado-Cuenta-${account.clientAccountNumber}.pdf`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (err) {
            console.error('Error al descargar PDF:', err);
        } finally {
            setLoadingPdf(null)
        }
    }

    //Cargar datos de movimientos
    const loadData = async () => {
        try {
            let response;
            if (search || type || (startDate && endDate)) {
                response = await filterAccountMovements(account.clientAccountId, startDate, endDate, search, type);
                setMovements(response.data ?? []);
            }
            else {
                setMovements(account.movements);
            }
            
        } catch (err) {
            console.error("Error cargando movimientos", err);
        }
    };

    useEffect(() => {
        loadData();
    }, [search, type, startDate, endDate]);

    //Si no hay movimientos
    if (!movements.length) {
        return createPortal(
            <div className="modal-backdrop">
                <div className="modal">

                    <h3>Historial de movimientos - Cuenta #{account.clientAccountNumber}</h3>

                    <ClientAccountMovementFilters
                        search={search}
                        type={type}
                        startDate={startDate}
                        endDate={endDate}
                        onSearchChange={setSearch}
                        onTypeChange={setType}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                    />

                    <div className="empty-state">Esta cuenta no tiene movimientos</div>;

                    <div className="caccount-movement-options">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={onCancel}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>,

            document.getElementById('modal-root')
        );
    }

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal">

                <h3>Historial de movimientos - Cuenta #{account.clientAccountNumber}</h3>

                <ClientAccountMovementFilters
                    search={search}
                    type={type}
                    startDate={startDate}
                    endDate={endDate}
                    onSearchChange={setSearch}
                    onTypeChange={setType}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />

                <div className="caccount-movement-container">
                <table className="caccount-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Referencia</th>
                            <th>Monto registrado</th>
                            <th>Balance anterior</th>
                            <th>Balance posterior</th>
                            <th>Tipo de movimiento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.map(m => (
                            <>
                                <tr key={m.clientAccountMovementId}>
                                    <td>{formatDate(m.clientAccountMovementDate)}</td>
                                    <td>{m.clientAccountMovementDescription}</td>
                                    <td>{formatCurrency(m.clientAccountMovementAmount)}</td>
                                    <td>{formatCurrency(m.clientAccountMovementOldBalance)}</td>
                                    <td>{formatCurrency(m.clientAccountMovementNewBalance)}</td>
                                    <td>
                                        <span className={`${m.clientAccountMovementType}-charge`}>{formatType(m.clientAccountMovementType)} {m.clientAccountMovementType === "debit" ? "↑" : "↓"}</span>
                                        </td>
                                </tr>
                            </>
                        ))}
                    </tbody>
                    </table>
                </div>
                <div className="caccount-movement-options">
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={onCancel}
                >
                    Cerrar
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handlePDFDownload(account.clientAccountId, search, type, startDate, endDate)}
                    >
                        {loadingPdf === account.clientAccountId ? 'Generando...' : 'Descargar estado de cuenta'}
                    </button>
                </div>

            </div>
        </div>,

        document.getElementById('modal-root')
    );
}



export default ClientAccountMovementHistory;