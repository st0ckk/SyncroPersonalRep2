import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    getInvoices,
    generateInvoice,
    validateInvoice,
    checkInvoiceStatus,
} from "../../../api/electronicInvoice.api";
import { getSales } from "../../../api/sales.api";

import { PageCard, Toolbar, FilterBar, Button } from "../../../components";
import FacturacionTable from "../components/FacturacionTable";
import GenerateInvoiceModal from "../components/GenerateInvoiceModal";
import ValidationResultModal from "../components/ValidationResultModal";

export default function FacturacionPage() {
    const [invoices, setInvoices] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [docTypeFilter, setDocTypeFilter] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [showValidation, setShowValidation] = useState(false);

    const loadInvoices = async () => {
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (docTypeFilter) params.documentType = docTypeFilter;
            if (startDate) params.fromDate = startDate;
            if (endDate) params.toDate = endDate;
            const response = await getInvoices(params);
            setInvoices(response.data ?? []);
        } catch (err) {
            console.error("Error cargando facturas", err);
            Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar las facturas" });
        } finally {
            setLoading(false);
        }
    };

    const loadSales = async () => {
        try {
            const response = await getSales();
            setSales(response.data ?? []);
        } catch (err) {
            console.error("Error cargando ventas", err);
            Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar las ventas disponibles" });
        }
    };

    useEffect(() => { loadInvoices(); }, [statusFilter, docTypeFilter, startDate, endDate]);
    useEffect(() => { loadSales(); }, []);

    const handleGenerate = async (purchaseId, documentType) => {
        try {
            setGenerating(true);
            const valResponse = await validateInvoice({ purchaseId, documentType });
            const valData = valResponse.data;

            if (!valData.isValid) {
                setValidationResult(valData);
                setShowValidation(true);
                return;
            }

            if (valData.warnings?.length > 0) {
                setValidationResult(valData);
                setShowValidation(true);
            }

            const confirm = await Swal.fire({
                icon: "question",
                title: "Confirmar generación",
                text: "La validación fue exitosa. ¿Desea generar la factura electrónica?",
                showCancelButton: true,
                confirmButtonText: "Sí, generar",
                cancelButtonText: "Cancelar",
            });
            if (!confirm.isConfirmed) return;

            const response = await generateInvoice({ purchaseId, documentType });
            if (response.data) {
                setShowGenerateModal(false);
                loadInvoices();
                Swal.fire({ icon: "success", title: "Éxito", text: `Factura generada exitosamente.\nClave: ${response.data.clave}`, timer: 3000, showConfirmButton: false });
            }
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.validationErrors) {
                setValidationResult({ isValid: false, errors: errorData.validationErrors, warnings: [] });
                setShowValidation(true);
            } else {
                Swal.fire({ icon: "error", title: "Error", text: `Error al generar factura: ${errorData?.error || errorData?.detail || err.message}` });
            }
        } finally {
            setGenerating(false);
        }
    };

    const handleCheckStatus = async (invoiceId) => {
        try {
            const response = await checkInvoiceStatus(invoiceId);
            loadInvoices();
            const status = response.data;
            Swal.fire({ icon: "success", title: "Éxito", text: `Estado: ${formatHaciendaStatus(status.haciendaStatus)}\n${status.haciendaMessage || ""}`, timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: `Error al consultar estado: ${err.message}` });
        }
    };

    return (
        <PageCard>
            <Toolbar title="Facturación Electrónica">
                <Button variant="outline" onClick={loadInvoices}>Actualizar</Button>
                <Button variant="primary" onClick={() => setShowGenerateModal(true)}>+ Generar factura</Button>
            </Toolbar>

            <FilterBar>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="sent">Enviada</option>
                    <option value="accepted">Aceptada</option>
                    <option value="rejected">Rechazada</option>
                    <option value="error">Error</option>
                </select>
                <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)}>
                    <option value="">Todos los tipos</option>
                    <option value="FE">Factura Electrónica</option>
                    <option value="NC">Nota de Crédito</option>
                    <option value="ND">Nota de Débito</option>
                    <option value="TE">Tiquete Electrónico</option>
                </select>
                <span className="filter-label">Desde:</span>
                <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value || null)} />
                <span className="filter-label">Hasta:</span>
                <input type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value || null)} />
            </FilterBar>

            {loading && <div className="loading">Cargando facturas...</div>}

            {!loading && (
                <FacturacionTable
                    invoices={invoices}
                    onCheckStatus={handleCheckStatus}
                    onRefresh={loadInvoices}
                />
            )}

            {showGenerateModal && (
                <GenerateInvoiceModal
                    sales={sales}
                    generating={generating}
                    onGenerate={handleGenerate}
                    onCancel={() => setShowGenerateModal(false)}
                />
            )}

            {showValidation && validationResult && (
                <ValidationResultModal
                    result={validationResult}
                    onClose={() => { setShowValidation(false); setValidationResult(null); }}
                />
            )}
        </PageCard>
    );
}

function formatHaciendaStatus(status) {
    const map = { pending: "Pendiente", sent: "Enviado", accepted: "Aceptado", rejected: "Rechazado", error: "Error" };
    return map[status] || status || "Desconocido";
}
