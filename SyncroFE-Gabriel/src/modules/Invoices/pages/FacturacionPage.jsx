import "./FacturacionPage.css";
import { useEffect, useState } from "react";
import {
    getInvoices,
    generateInvoice,
    validateInvoice,
    checkInvoiceStatus,
} from "../../../api/electronicInvoice.api";
import { getSales } from "../../../api/sales.api";

import FacturacionToolbar from "../components/FacturacionToolbar";
import FacturacionFilters from "../components/FacturacionFilters";
import FacturacionTable from "../components/FacturacionTable";
import GenerateInvoiceModal from "../components/GenerateInvoiceModal";
import ValidationResultModal from "../components/ValidationResultModal";

export default function FacturacionPage() {
    // Data
    const [invoices, setInvoices] = useState([]);
    const [sales, setSales] = useState([]);

    // UI
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState("");
    const [docTypeFilter, setDocTypeFilter] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Generate modal
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Validation modal
    const [validationResult, setValidationResult] = useState(null);
    const [showValidation, setShowValidation] = useState(false);

    // Load invoices
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
        } finally {
            setLoading(false);
        }
    };

    // Load sales for the generate modal
    const loadSales = async () => {
        try {
            const response = await getSales();
            setSales(response.data ?? []);
        } catch (err) {
            console.error("Error cargando ventas", err);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, [statusFilter, docTypeFilter, startDate, endDate]);

    useEffect(() => {
        loadSales();
    }, []);

    // Generate invoice
    const handleGenerate = async (purchaseId, documentType) => {
        try {
            setGenerating(true);

            // Validate first
            const valResponse = await validateInvoice({ purchaseId, documentType });
            const valData = valResponse.data;

            if (!valData.isValid) {
                setValidationResult(valData);
                setShowValidation(true);
                return;
            }

            // Show warnings if any, but proceed
            if (valData.warnings?.length > 0) {
                setValidationResult(valData);
                setShowValidation(true);
            }

            // Generate
            const response = await generateInvoice({ purchaseId, documentType });
            if (response.data) {
                setShowGenerateModal(false);
                loadInvoices();
                alert(`Factura generada exitosamente. Clave: ${response.data.clave}`);
            }
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.validationErrors) {
                setValidationResult({
                    isValid: false,
                    errors: errorData.validationErrors,
                    warnings: [],
                });
                setShowValidation(true);
            } else {
                alert(
                    `Error al generar factura: ${errorData?.error || errorData?.detail || err.message}`
                );
            }
        } finally {
            setGenerating(false);
        }
    };

    // Check status
    const handleCheckStatus = async (invoiceId) => {
        try {
            const response = await checkInvoiceStatus(invoiceId);
            loadInvoices();
            const status = response.data;
            alert(
                `Estado: ${formatHaciendaStatus(status.haciendaStatus)}\n${status.haciendaMessage || ""}`
            );
        } catch (err) {
            alert(`Error al consultar estado: ${err.message}`);
        }
    };

    return (
        <div className="facturacion-page">
            <div className="facturacion-container">
                <FacturacionToolbar
                    onNewInvoice={() => setShowGenerateModal(true)}
                    onRefresh={loadInvoices}
                />

                <FacturacionFilters
                    statusFilter={statusFilter}
                    docTypeFilter={docTypeFilter}
                    startDate={startDate}
                    endDate={endDate}
                    onStatusChange={setStatusFilter}
                    onDocTypeChange={setDocTypeFilter}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />

                {loading && <div className="loading">Cargando facturas...</div>}

                {!loading && (
                    <FacturacionTable
                        invoices={invoices}
                        onCheckStatus={handleCheckStatus}
                        onRefresh={loadInvoices}
                    />
                )}
            </div>

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
                    onClose={() => {
                        setShowValidation(false);
                        setValidationResult(null);
                    }}
                />
            )}
        </div>
    );
}

function formatHaciendaStatus(status) {
    const map = {
        pending: "Pendiente",
        sent: "Enviado",
        accepted: "Aceptado",
        rejected: "Rechazado",
        error: "Error",
    };
    return map[status] || status || "Desconocido";
}
