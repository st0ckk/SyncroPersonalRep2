import { useState } from "react";
//import { generateAccountStatement } from "../../../api/clientAccount.api";
import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

export default function CashRegisterTable({
    registers,
    onClose,
    onHistory,
}) {

    //Informacion extendida
    const [expandedRegisterId, setExpandedRegisterId] = useState(null);

    //PDF
    const [loadingPdf, setLoadingPdf] = useState(null);
    const pagination = usePagination(registers);

    //Formateo de fechas
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("es-CR");
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
            case "open":
                status = "Abierta";
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

    //Handler de detalles de cuenta
    const toggleMoreInfo = (id) => {
        setExpandedRegisterId(prev => (prev === id ? null : id));
    };

    //Si no hay cuentas
    if (!registers.length) {
        return <div className="empty-state">No hay cuentas cajas registradas</div>;
    }

    return (
        <>
        <div className="table-scroll">
        <table className="caccount-table">
            <thead>
                <tr>
                    <th>Numero de caja</th>
                    <th>Estado</th>
                    <th>Creador</th>
                    <th>Tiempo de apertura</th>
                    <th>Tiempo de cierre</th>
                    <th>Saldo final</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {pagination.paginatedData.map(cr => (
                    <>
                        <tr key={cr.cashRegisterId}>
                            <td className="number">{cr.cashRegisterNumber}</td>
                            <td>
                                <span className={`${formatStatusType(cr.cashRegisterStatus)}-status`}>{formatStatusType(cr.cashRegisterStatus)}</span>
                            </td>
                            <td>{cr.userName}</td>
                            <td>{formatDate(cr.cashRegisterOpeningDate)}</td>
                            <td>{cr.cashRegisterClosingDate ? formatDate(cr.cashRegisterClosingDate) : "Por definir"}</td>
                            <td>{formatCurrency(cr.cashRegisterExpectedAmount)}</td>
                            <td className="actions">

                                {/*
                            <button
                                    className="btn btn-outline"
                                    onClick={() => toggleMoreInfo(cr.clientAccountId)}
                            >
                                    {expandedRegisterId === cr.cashRegisterId ? "Ocultar" : "Detalles"}
                                </button>
                                */}

                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => onHistory(cr)}
                                >
                                    Ver reporte de movimientos
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => onClose(cr)}
                                    disabled={cr.cashRegisterStatus != "closed" ? false : true}
                                >
                                    Cerrar caja
                                </button>
                            </td>
                        </tr>

                        {expandedRegisterId === cr.cashRegisterId && (
                            <tr className="registers-extra">
                                <td colSpan={9}>
                                    <section className="registers-details-flex">
                                        <span class="registers-details-remarks">
                                            <strong>Razon para diferencia de montos: </strong>
                                            <br />
                                            {cr.cashRegisterDifferenceReason}
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
            <PaginationControls {...pagination} />
        </>
    );
}
