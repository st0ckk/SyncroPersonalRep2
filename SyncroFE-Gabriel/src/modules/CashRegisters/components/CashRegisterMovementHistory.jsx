import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import {
    getExpectedAmount,
    generateRegisterSummary,
    filterRegisterMovements,
    createManualRegisterMovement,
    getRegisterMovements,
} from "../../../api/cashRegisters";

import CashRegisterMovementFilters from "../components/CashRegisterMovementFilters";
import CashRegisterMovementForm from "../components/CashRegisterMovementForm";

import Button from "../../../components/Button";
function CashRegisterMovementHistory({
    register,
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

    // CRUD movimiento de cajas
    const [showMovementForm, setShowMovementForm] = useState(false);
    const [movementSubmitting, setMovementSubmitting] = useState(false);

    //Informacion extendida
    const [expandedMovementId, setExpandedMovementId] = useState(null);

    //Formateo de fechas
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("es-CR");
    };

    //Formateo para moneda
    const formatCurrency = (amount) => {
        if (!amount) {
            return "₡ 0.00";
        }
        var fixedAmount = parseFloat(amount);
        return `₡ ${fixedAmount.toFixed(2)}`;
    }

    //Formateo para la diferencia entre valores
    const formatDifferenceValues = () => {
        var value = "";
        var expected = parseFloat(register.cashRegisterExpectedAmount);
        var reported = parseFloat(register.cashRegisterReportedAmount);
        if (reported > expected) {
            value = "positive-";
        };

        if (reported < expected) {
            value = "negative-";
        };

        return value;
    }

    //Formateo de tipos de movimiento
    const formatType = (statusString) => {
        var status = "";
        switch (statusString) {
            case "expense":
                status = "Gasto";
                break;
            case "income":
                status = "Ingreso";
                break;
            default:
                status = "Sin estado"
                break;
        }
        return status;
    }

    //Formateo de insercion manual
    const formatManualInsert = (typeBool) => {
        var type = "";
        switch (typeBool) {
            case true:
                type = "Si";
                break;
            case false:
                type = "No";
                break;
            default:
                type = "Sin definir"
                break;
        }
        return type;
    }

    //Descarga de PDFs
    const handlePDFDownload = async (id) => {

        setLoadingPdf(id);

        try {
            console.log(`${id} ${startDate} ${endDate} ${search} ${type}`)
            const blob = await generateRegisterSummary(id, startDate, endDate, search, type);

            //Aqui creamos un url para el pdf con el fin de descargarlo y quitarlo
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Reporte-Caja-${register.cashRegisterNumber}.pdf`;
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

    //Agregar un movimiento manual a la caja
    const handleManualMovementSubmit = async (values) => {
        try {
            setMovementSubmitting(true);
            await createManualRegisterMovement(values);

            setShowMovementForm(false);
            const response = getRegisterMovements(register.cashRegisterId);
            setMovements(response.data ?? []);

            loadData();
        } catch (err) {
            console.error("Error guardando movimiento", err);
            Swal.fire({ icon: "error", title: "Error", text: "Error guardando movimiento" });
        } finally {
            setMovementSubmitting(false);
        }
    };

    // Nuevo movimiento
    const handleMovementCreated = () => {
        setShowMovementForm(true);
    };


    //Cargar datos de movimientos
    const loadData = async () => {
        try {
            let response;
            let refreshedAmount;
            if (search || type || (startDate && endDate)) {
                response = await filterRegisterMovements(register.cashRegisterId, startDate, endDate, search, type);
                setMovements(response.data ?? []);
            }
            else {
                response = await getRegisterMovements(Number(register.cashRegisterId));
            }
            refreshedAmount = await getExpectedAmount(Number(register.cashRegisterId));
            setMovements(response.data ?? [])
            register.cashRegisterExpectedAmount = refreshedAmount.data;
        } catch (err) {
            console.error("Error cargando movimientos", err);
        }
    };

    useEffect(() => {
        loadData();
        getExpectedAmount(register.cashRegisterId).then((res) => {
            if (register.cashRegisterExpectedAmount == null) {
                register.cashRegisterExpectedAmount = res.data
            };
        });
    }, [search, type, startDate, endDate]);

    //Si no hay movimientos
    if (!movements.length) {
        return createPortal(
            <div className="modal-backdrop">
                <div className="modal">

                    <h3>Detalle de movimientos - Caja #{register.cashRegisterNumber}</h3>

                    <div className="monitor-summary">

                        <div className="summary-item">
                            <div className="summary-label">Monto de apertura</div>
                            <div className="summary-value">{formatCurrency(register.cashRegisterOpeningAmount)}</div>
                        </div>

                        <div className="summary-item">
                            <div className="summary-label">Monto reportado por cajero</div>
                            <div className="summary-value">{formatCurrency(register.cashRegisterReportedAmount)}</div>
                        </div>

                        <div className="summary-item">
                            <div className="summary-label">Saldo final calculado por sistema</div>
                            <div className="summary-value">{formatCurrency(register.cashRegisterExpectedAmount)}</div>
                        </div>

                        <div className="summary-item">
                            <div className="summary-label">Total diferencias</div>
                            <div className={`summary-${formatDifferenceValues()}value`}>{register.cashRegisterReportedAmount ? formatCurrency(register.cashRegisterExpectedAmount - register.cashRegisterReportedAmount) : formatCurrency(null)}</div>
                        </div>

                    </div>

                    <CashRegisterMovementFilters
                        onNewMovement={handleMovementCreated}
                        registerState={register.cashRegisterStatus}
                        search={search}
                        type={type}
                        startDate={startDate}
                        endDate={endDate}
                        onSearchChange={setSearch}
                        onTypeChange={setType}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                    />

                    {/*Formulario de cierre*/}
                    {showMovementForm && (
                        <CashRegisterMovementForm
                            id={register.cashRegisterId}
                            submitting={movementSubmitting}
                            onSubmit={handleManualMovementSubmit}
                            onCancel={() => {
                                setShowMovementForm(false);
                            }}
                        />
                    )}

                    <div className="empty-state">Esta caja no tiene movimientos</div>;

                    <div className="register-movement-options">
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
            <div className="modal-history">

                <h3>Detalle de movimientos - Caja #{register.cashRegisterNumber}</h3>

                <div className="monitor-summary">

                    <div className="summary-item">
                        <div className="summary-label">Monto de apertura</div>
                        <div className="summary-value">{formatCurrency(register.cashRegisterOpeningAmount)}</div>
                    </div>

                    <div className="summary-item">
                        <div className="summary-label">Monto reportado por cajero</div>
                        <div className="summary-value">{formatCurrency(register.cashRegisterReportedAmount)}</div>
                    </div>

                    <div className="summary-item">
                        <div className="summary-label">Saldo final calculado por sistema</div>
                        <div className="summary-value">{formatCurrency(register.cashRegisterExpectedAmount)}</div>
                    </div>

                    <div className="summary-item">
                        <div className="summary-label">Total diferencias</div>
                        <div className={`summary-${formatDifferenceValues()}value`}>{register.cashRegisterReportedAmount ? formatCurrency(register.cashRegisterExpectedAmount - register.cashRegisterReportedAmount) : formatCurrency(null)}</div>
                    </div>

                </div>

                <CashRegisterMovementFilters
                    onNewMovement={handleMovementCreated}
                    registerState={register.cashRegisterStatus}
                    search={search}
                    type={type}
                    startDate={startDate}
                    endDate={endDate}
                    onSearchChange={setSearch}
                    onTypeChange={setType}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />

                {/*Formulario de cierre*/}
                {showMovementForm && (
                    <CashRegisterMovementForm
                        id={register.cashRegisterId}
                        submitting={movementSubmitting}
                        onSubmit={handleManualMovementSubmit}
                        onCancel={() => {
                            setShowMovementForm(false);
                        }}
                    />
                )}

                <div className="register-movement-container">
                    <div className="table-scroll">
                    <table className="register-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Usuario</th>
                                <th>Monto</th>
                                <th>Tipo de movimiento</th>
                                <th>Movimiento manual</th>
                                <th>Descripcion</th>

                            </tr>
                        </thead>
                        <tbody>
                            {movements.map(m => (
                                <>
                                    <tr key={m.cashRegisterMovementId}>
                                        <td>{formatDate(m.cashRegisterMovementDate)}</td>
                                        <td>{m.userName}</td>
                                        <td>{formatCurrency(m.cashRegisterMovementAmount)}</td>
                                        <td>
                                            <span className={`${m.cashRegisterMovementType}-charge`}>{formatType(m.cashRegisterMovementType)} {m.cashRegisterMovementType === "income" ? "↑" : "↓"}</span>
                                        </td>
                                        <td>{formatManualInsert(m.cashRegisterMovementManual)}</td>
                                        <td className="actions">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setExpandedMovementId(expandedMovementId === m.cashRegisterMovementId ? null : m.cashRegisterMovementId)}
                                            >
                                                {expandedMovementId === m.cashRegisterMovementId ? "Ocultar" : "Detalle"}
                                            </Button>
                                        </td>
                                    </tr>

                                    {expandedMovementId === m.cashRegisterMovementId && (
                                        <tr className="registers-extra">
                                            <td colSpan={9}>
                                                <section className="registers-details-flex">
                                                    <span class="registers-details-remarks">
                                                        <strong>Descripcion: </strong>
                                                        <br />
                                                        {m.cashRegisterMovementDescription}
                                                        <br />
                                                    </span>
                                                </section>
                                            </td>
                                        </tr>
                                    )}

                                </>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                <div className="register-movement-options">
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
                        onClick={() => handlePDFDownload(register.cashRegisterId, search, type, startDate, endDate)}
                    >
                        {loadingPdf === register.cashRegisterId ? 'Generando...' : 'Descargar reporte'}
                    </button>
                </div>

            </div>
        </div>,

        document.getElementById('modal-root')
    );
}



export default CashRegisterMovementHistory;