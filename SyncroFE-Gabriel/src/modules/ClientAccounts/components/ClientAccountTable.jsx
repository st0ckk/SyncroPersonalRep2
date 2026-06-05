import { useState } from "react";
import Button from "../../../components/Button";
import { usePagination } from "../../../hooks/usePagination";
import { getSalesByAccount } from "../../../api/sales.api"
import PaginationControls from "../../../components/PaginationControls";
import Swal from "sweetalert2";
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

    const pagination = usePagination(clientAccounts);

    //Formateo de fechas
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-CR");
    };

    //Formateo para moneda
    const formatCurrency = (amount) => {
        var fixedAmount = parseFloat(amount);
        if (amount < 0) {
            return `- ₡ ${Math.abs(fixedAmount).toFixed(2)}`;
        }
        return `₡ ${Math.abs(fixedAmount).toFixed(2)}`;
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
        var query
        var purchases;
        try {
            query = await getSalesByAccount(id);
            purchases = query.data;
            if (purchases.length != 0) {
                await Swal.fire({ icon: "warning", title: "Advertencia", text: "Esta cuenta no se puede cerrar por tener ventas activas" });
                return;
            }
            setClosing(true);
            await onClose(id);
            setConfirmClosedId(null);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "¡Exito!",
                text: "Se ha cerrado la cuenta de crédito",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Error...",
                text: "No se ha podido cerrar la cuenta",
                showConfirmButton: false,
                timer: 1500
            });
            console.error("Error al cerrar la cuenta", err);
        } finally {
            setClosing(false);
        }
    };

    //Handler de detalles de cuenta.
    const toggleMoreInfo = (id) => {
        setExpandedAccountId(prev => (prev === id ? null : id));
    };

    //Si no hay cuentas
    if (!clientAccounts.length) {
        return <div className="empty-state">No hay cuentas de crédito</div>;
    }

    return (
        <>
        <div className="table-scroll">
        <table className="data-table">
            <thead>
                <tr>
                    <th>Número de cuenta</th>
                    <th>Estado</th>
                    <th>Cliente</th>
                    <th>Balance actual</th>
                    <th>Tasa de interes</th>
                    <th>Límite de crédito</th>
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

                                
                            <Button
                                    variant="info"
                                    onClick={() => toggleMoreInfo(ca.clientAccountId)}
                            >
                                    {expandedAccountId === ca.clientAccountId ? "Ocultar" : "Detalles"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="warning"
                                    onClick={() => onEdit(ca)}
                                    disabled={ca.clientAccountStatus == "closed"}
                                >
                                    Editar
                                </Button>
                                <Button
                                    type="button"
                                    variant="info"
                                    onClick={() => onHistory(ca)}
                                >
                                    Ver historial de movimientos
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => setConfirmClosedId(ca.clientAccountId)}
                                    disabled={ca.clientAccountStatus != "closed" ? false : true}
                                >
                                    Cerrar cuenta
                                </Button>
                            </td>
                        </tr>

                        {expandedAccountId === ca.clientAccountId && (
                            <tr className="caccounts-extra">
                                <td colSpan={9}>
                                    <section className="caccounts-details-flex">
                                        <span class="caccounts-details-remarks">
                                            <strong>Términos y condiciones: </strong>
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
            </div>

            {/* Modal de confirmación de cierre de cuenta */}
            {confirmClosedId && (
                <div className="modal-backdrop">
                    <div className="modal modal-confirm">
                        <h3>Confirmar cierre de cuenta</h3>
                        <p>
                            ¿Está seguro que desea cerrar esta cuenta?
                        </p>
                        <p className="hint">
                            La cuenta de crédito no se podra utilizar en futuras compras.
                        </p>
                        <div className="form-actions">
                            <Button
                                variant="outline"
                                onClick={() => setConfirmClosedId(null)}
                                disabled={closing}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleAccountClosure(confirmClosedId)}
                                disabled={closing}
                            >
                                {closing ? "Cerrando..." : "Sí, cerrar"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <PaginationControls {...pagination} />
        </>
    );
}
