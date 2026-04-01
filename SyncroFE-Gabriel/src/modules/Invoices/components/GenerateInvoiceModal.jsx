import { useState, useMemo } from "react";
import { createPortal } from "react-dom";

export default function GenerateInvoiceModal({
    sales,
    generating,
    onGenerate,
    onCancel,
}) {
    const [selectedPurchaseId, setSelectedPurchaseId] = useState("");
    const [documentType, setDocumentType] = useState("01");
    const [search, setSearch] = useState("");

    // Filter active sales that don't already have an accepted invoice
    const availableSales = useMemo(() => {
        let filtered = sales.filter((s) => s.isActive);

        if (search) {
            const term = search.toLowerCase();
            filtered = filtered.filter(
                (s) =>
                    s.purchaseOrderNumber?.toLowerCase().includes(term) ||
                    s.clientName?.toLowerCase().includes(term) ||
                    String(s.purchaseId).includes(term)
            );
        }

        return filtered.slice(0, 50); // Limit for performance
    }, [sales, search]);

    const selectedSale = sales.find(
        (s) => s.purchaseId === Number(selectedPurchaseId)
    );

    const formatCurrency = (amount) =>
        `\u20A1 ${parseFloat(amount || 0).toLocaleString("es-CR", {
            minimumFractionDigits: 2,
        })}`;

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("es-CR");
    };

    const handleSubmit = () => {
        if (!selectedPurchaseId) {
            alert("Seleccione una venta");
            return;
        }
        onGenerate(Number(selectedPurchaseId), documentType);
    };

    const modal = (
        <div className="modal-backdrop">
            <div className="modal generate-modal">
                <div className="modal-header">
                    <h3>Generar Factura Electronica</h3>
                    <button className="btn-close" onClick={onCancel}>
                        &times;
                    </button>
                </div>

                <div className="form-group">
                    <label>Tipo de Documento</label>
                    <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                    >
                        <option value="01">Factura Electronica (FE)</option>
                        <option value="04">Tiquete Electronico (TE)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Buscar Venta</label>
                    <input
                        type="text"
                        placeholder="Buscar por # orden, cliente o ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Seleccionar Venta</label>
                    <select
                        value={selectedPurchaseId}
                        onChange={(e) => setSelectedPurchaseId(e.target.value)}
                        size={6}
                        style={{ height: "auto" }}
                    >
                        <option value="">-- Seleccione una venta --</option>
                        {availableSales.map((s) => (
                            <option key={s.purchaseId} value={s.purchaseId}>
                                #{s.purchaseOrderNumber || s.purchaseId} -{" "}
                                {s.clientName} - {formatCurrency(s.total)} -{" "}
                                {formatDate(s.purchaseDate)}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedSale && (
                    <div className="sale-preview">
                        <p>
                            <strong>Orden:</strong>{" "}
                            {selectedSale.purchaseOrderNumber ||
                                selectedSale.purchaseId}
                        </p>
                        <p>
                            <strong>Cliente:</strong> {selectedSale.clientName}
                        </p>
                        <p>
                            <strong>Subtotal:</strong>{" "}
                            {formatCurrency(selectedSale.subtotal)}
                        </p>
                        <p>
                            <strong>Impuesto:</strong>{" "}
                            {selectedSale.taxName
                                ? `${selectedSale.taxName} (${selectedSale.taxPercentage}%)`
                                : "Sin impuesto"}
                        </p>
                        <p>
                            <strong>Total:</strong>{" "}
                            {formatCurrency(selectedSale.total)}
                        </p>
                        <p>
                            <strong>Metodo de pago:</strong>{" "}
                            {selectedSale.purchasePaymentMethod || "-"}
                        </p>
                        <p>
                            <strong>Articulos:</strong>{" "}
                            {selectedSale.saleDetails?.length || 0} items
                        </p>
                    </div>
                )}

                <div className="form-actions">
                    <button
                        className="btn btn-outline"
                        onClick={onCancel}
                        disabled={generating}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={generating || !selectedPurchaseId}
                    >
                        {generating
                            ? "Generando..."
                            : "Validar y Generar"}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.getElementById("modal-root"));
}
