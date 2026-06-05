import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../../../components/Button";
import {
    filterAccountMovements,
    generateAccountStatement,
} from "../../../api/clientAccount.api";

import ClientAccountMovementFilters from "../components/ClientAccountMovementFilters";
import Swal from 'sweetalert2';
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
        if (!amount) return "₡ 0.00";
        var fixedAmount = parseFloat(amount);
        if (amount < 0) {
            return `- ₡ ${Math.abs(fixedAmount).toFixed(2)}`;
        }
        return `₡ ${Math.abs(fixedAmount).toFixed(2)}`;
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
            await waitBeforeNextLine(5000);

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
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "¡Exito!",
                text: "Se ha descargado el historial",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Error...",
                text: "No se ha podido descargar el historial",
                showConfirmButton: false,
                timer: 1500
            });
            console.error('Error al descargar PDF:', err);
        } finally {
            setLoadingPdf(null)
        }
    }

    //Espera antes de ejecutar la siguiente linea
    function waitBeforeNextLine(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
                    <div className="empty-state">Esta cuenta no tiene movimientos</div>;

                    <div className="caccount-movement-options">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>,

            document.getElementById('modal-root')
        );
    }

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-history">

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
                <div className="table-scroll">
                <table className="data-table">
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
                </div>
                <div className="form-actions">
                <Button
                    type="button"
                    variant="danger"
                    onClick={onCancel}
                >
                    Cerrar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => handlePDFDownload(account.clientAccountId, search, type, startDate, endDate)}
                    >
                        {loadingPdf === account.clientAccountId ? 'Generando...' : 'Descargar estado de cuenta'}
                    </Button>
                </div>

            </div>
        </div>,

        document.getElementById('modal-root')
    );
}



export default ClientAccountMovementHistory;