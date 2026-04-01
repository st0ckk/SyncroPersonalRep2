import { useState } from "react";
import { generateQuoteCopy } from "../../../api/quote.api";
import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

export default function QuoteTable({
    quotes,
    onEdit,
}) {
    //PDF
    const [loadingPdf, setLoadingPdf] = useState(null);

    //Informacion extendida
    const [expandedQuoteId, setExpandedQuoteId] = useState(null);

    //Handler de detalles de cotizacion
    const toggleMoreInfo = (id) => {
        setExpandedQuoteId(prev => (prev === id ? null : id));
    };

    //Formateo de fechas
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-CR");
    };

    //Formateo para moneda
    const formatCurrency = (amount) => {
        if (!amount) return "₡ 0.00";
        var fixedAmount = parseFloat(amount);
        return `₡ ${fixedAmount.toFixed(2) }`;
    }

    //Formateo de tipos de estados
    const formatStatusType = (statusString,date) => {
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

    //Descarga de PDFs
    const handlePDFDownload = async (id, number) => {

        setLoadingPdf(id);

        try {
            const blob = await generateQuoteCopy(id);

            //Aqui creamos un url para el pdf con el fin de descargarlo y quitarlo
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Cotizacion-${number}.pdf`;
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

    const pagination = usePagination(quotes);

    //Si no hay cotizaciones
    if (!quotes.length) {
        return <div className="empty-state">No hay cotizaciones</div>;
    }

    return (
        <>
        <table className="quote-table">
            <thead>
                <tr>
                    <th>Numero de cotización</th>
                    <th>Estado</th>
                    <th>Vigencia</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Cotizador</th>
                    <th>Emisión</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {pagination.paginatedData.map(q => (
                    <>
                        <tr key={q.quoteId}>
                            <td className="number">{q.quoteNumber}</td>
                        <td>
                            <span className={`${formatStatusType(q.quoteStatus, q.quoteValidTil)}-status`}>{formatStatusType(q.quoteStatus, q.quoteValidTil)}</span>                            
                        </td>
                        <td>{formatDate(q.quoteValidTil)}</td>
                        <td>{q.clientName}</td>
                        <td>{formatCurrency(q.quoteTotal - (q.quoteTotal * (q.quoteDiscountPercentage/100)))}</td>
                        <td>{q.userName}</td>
                        <td>{formatDate(q.quoteDate)}</td>
                        <td className="actions">

                            <button
                                className="btn btn-outline"
                                onClick={() => toggleMoreInfo(q.quoteId)}
                            >
                                    {expandedQuoteId === q.quoteId ? "Ocultar" : "Detalle"}
                            </button>

                            <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => onEdit(q)}
                            >
                                Editar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => handlePDFDownload(q.quoteId, q.quoteNumber)}
                                    disabled={loadingPdf === q.quoteId ? true : false }
                                >
                                    {loadingPdf === q.quoteId ? 'Generando...' : 'Descargar copia'}
                                </button>
                        </td>
                        </tr>

                        {/*Tabla de informacion extendida*/}
                        {expandedQuoteId === q.quoteId && (
                            <tr className="quote-extra">
                                <td colSpan={8}>
                                    <section className="quote-details-flex">
                                        <span>
                                            <strong>Articulos cotizados: </strong>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Producto</th>
                                                        <th>Precio unitario</th>
                                                        <th>Cantidad</th>
                                                        <th>Total de linea</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {q.quoteDetails.map(qd =>
                                                        <>
                                                            <tr>
                                                                <td>{qd.productName}</td>
                                                                <td>{formatCurrency(qd.unitPrice)}</td>
                                                                <td>{qd.quantity}</td>
                                                                <td>{formatCurrency(qd.lineTotal)}</td>
                                                            </tr>
                                                        </>
                                                    )}
                                                </tbody>
                                            </table>
                                            <br />
                                        </span>
                                        <span class="quote-details-remarks">
                                            <strong>Subtotal: </strong>
                                            <br />
                                            {formatCurrency(q.quoteTotal)}
                                            <br />
                                            <strong>Condiciones: </strong>
                                            <br />
                                            {q.quoteConditions}
                                            <br />
                                            <strong>Observaciones: </strong>
                                            <br />
                                            {q.quoteRemarks}
                                            <br />
                                        </span>
                                        <span class="quote-details-discount">
                                            <strong>Descuento aplicable: </strong>
                                            <br />
                                            {q.quoteDiscountApplied ? "Si" : "No"}
                                            <br />
                                            <strong>Razon de descuento: </strong>
                                            <br />
                                            {q.quoteDiscountApplied ? `${q.quoteDiscountReason}` : "N/A"}
                                            <br />

                                            <strong>Porcentaje de descuento: </strong>
                                            <br />
                                            {q.quoteDiscountApplied ? `${q.quoteDiscountPercentage}%` : "N/A"}
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
        <PaginationControls {...pagination} />
        </>
    );
}
