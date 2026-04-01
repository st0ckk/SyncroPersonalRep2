import { useState } from "react";
import { generateAccountStatement } from "../../../api/clientAccount.api";
import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

export default function ClientAccountTable({
    clientAccounts,
    onEdit,
    onClose,
    onHistory,
}) {

    //Informacion extendida
    const [expandedAccountId, setExpandedAccountId] = useState(null);

    // Cancelacion
    const [confirmClosedId, setConfirmClosedId] = useState(null);
    const [closing, setClosing] = useState(false);
    //PDF
    const [loadingPdf, setLoadingPdf] = useState(null);
    const pagination = usePagination(clientAccounts);

    //Formateo de fechas
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-CR");
    };

    //Formateo para moneda
    const formatCurrency = (amount) => {
        if (!amount) return "₡ 0.00";
        var fixedAmount = parseFloat(amount);
        return `₡ ${fixedAmount.toFixed(2)}`;
    }

    //Formateo de tipos de estados
    const formatStatusType = (statusString) => {
        var status = "";
        switch (statusString) {
            case "active":
                status = "Activa";
                break;
            case "suspended":
                status = "Suspendida";
                break;
            case "closed":
                status = "Cerrada";
                break;
            default:
                status = "Sin estado"
                break;
        }
        return status;
    }

    // Handler para cancelar cuentas
    const handleAccountClosure = async (id) => {
        try {
            setClosing(true);
            await onClose(id);
            setConfirmClosedId(null);
        } catch (err) {
            console.error("Error al cerrar la cuenta", err);
        } finally {
            setClosing(false);
        }
    };

    //Handler de detalles de cuenta
    const toggleMoreInfo = (id) => {
        setExpandedAccountId(prev => (prev === id ? null : id));
    };

    //Si no hay cuentas
    if (!clientAccounts.length) {
        return <div className="empty-state">No hay cuentas de credito</div>;
    }

    return (
        <>
        <table className="caccount-table">
            <thead>
                <tr>
                    <th>Numero de cuenta</th>
                    <th>Estado</th>
                    <th>Cliente</th>
                    <th>Balance actual</th>
                    <th>Tasa de interes</th>
                    <th>Limite de credito</th>
                    <th>Apertura</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {pagination.paginatedData.map(ca => (
                    <>
                        <tr key={ca.clientAccountId}>
                            <td className="number">{ca.clientAccountNumber}</td>
                            <td>
                                <span className={`${formatStatusType(ca.clientAccountStatus)}-status`}>{formatStatusType(ca.clientAccountStatus)}</span>
                            </td>
                            <td>{ca.customerName}</td>
                            <td>{formatCurrency(ca.clientAccountCurrentBalance)}</td>
                            <td>{ca.clientAccountInterestRate}%</td>
                            <td>{formatCurrency(ca.clientAccountCreditLimit)}</td>
                            <td>{formatDate(ca.clientAccountOpeningDate)}</td>
                            <td className="actions">

                                
                            <button
                                    className="btn btn-outline"
                                    onClick={() => toggleMoreInfo(ca.clientAccountId)}
                            >
                                    {expandedAccountId === ca.clientAccountId ? "Ocultar" : "Detalles"}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => onEdit(ca)}
                                    disabled={ca.clientAccountStatus == "closed"}
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => onHistory(ca)}
                                >
                                    Ver historial de movimientos
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setConfirmClosedId(ca.clientAccountId)}
                                    disabled={ca.clientAccountStatus != "closed" ? false : true}
                                >
                                    Cerrar cuenta
                                </button>
                            </td>
                        </tr>

                        {expandedAccountId === ca.clientAccountId && (
                            <tr className="caccounts-extra">
                                <td colSpan={9}>
                                    <section className="caccounts-details-flex">
                                        <span class="caccounts-details-remarks">
                                            <strong>Terminos y condiciones: </strong>
                                            <br />
                                            {ca.clientAccountConditions}
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

            {/* Modal de confirmación de cierre de cuenta */}
            {confirmClosedId && (
                <div className="modal-backdrop">
                    <div className="modal modal-confirm">
                        <h3>Confirmar cierre de cuenta</h3>
                        <p>
                            ¿Está seguro que desea cerrar esta cuenta?
                        </p>
                        <p className="hint">
                            La cuenta de credito no se podra utilizar en futuras compras.
                        </p>
                        <div className="form-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => setConfirmClosedId(null)}
                                disabled={closing}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleAccountClosure(confirmClosedId)}
                                disabled={closing}
                            >
                                {closing ? "Cerrando..." : "Sí, cerrar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <PaginationControls {...pagination} />
        </>
    );
}
