import { useEffect, useState } from "react";
import { getClientLookup } from "../../../api/clients.api";
import { getProducts } from "../../../api/stock.api";
import { getCreditAccountByClient } from "../../../api/clientAccount.api";
import { createPortal } from "react-dom";
import SearchSelect from "react-select";
import { getRoutes } from "../../../api/routes.api";

const emptySale = {
    clientId: null,
    purchasePaid: null,
    purchaseOrderNumber: "",
    taxId: null,
    taxPercentage: null,
    subTotal: null,
    taxAmount: null,
    total: null,
    discountId: null,
    routeId: null,
    clientAccountId: null,
    purchaseDiscountApplied: false,
    purchaseDiscountPercentage: null,
    purchaseDiscountReason: "",
    purchasePaymentMethod: "",
    saleDetails: [],
};

function VentasForm({
    initialValues,
    submitting,
    onSubmit,
    onCancel,
}) {

    // Data
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [orderPaid, setOrderPaid] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [clientAccounts, setClientAccounts] = useState([]);

    // Form
    const [details, setDetails] = useState([]);
    const [requiresInvoice, setRequiresInvoice] = useState(false);
    const [form, setForm] = useState(() => {
        if (!initialValues) return emptySale;
        return {
            clientId: initialValues.clientId ?? "",
            purchasePaid: initialValues.purchasePaid ?? null,
            purchaseOrderNumber: initialValues.purchaseOrderNumber ?? "",
            taxId: initialValues.taxId ?? null,
            taxPercentage: initialValues.taxPercentage ?? null,
            subTotal: initialValues.subTotal ?? null,
            taxAmount: initialValues.taxAmount ?? null,
            total: initialValues.taxAmount ?? null,
            discountId: initialValues.discountId ?? null,
            routeId: initialValues.routeId ?? null,
            clientAccountId: initialValues.clientAccountId ?? null,
            purchaseDiscountApplied: initialValues.purchaseDiscountApplied ?? false,
            purchaseDiscountPercentage: initialValues.purchaseDiscountPercentage ?? null,
            purchaseDiscountReason: initialValues.purchaseDiscountReason ?? "",
            purchasePaymentMethod: initialValues.purchasePaymentMethod ?? "",
        };
    });

    // Currency format
    const formatCurrency = (amount) => {
        var fixedAmount = parseFloat(amount);
        return `₡ ${fixedAmount.toFixed(2)}`;
    };

    /* ══════════════════════════════
       LINE MANAGEMENT
    ══════════════════════════════ */
    const addLine = () => {
        setDetails([...details, { productId: "", quantity: 1, discount: "" }]);
    };

    const removeLine = (index) => {
        setDetails(details.filter((_, i) => i !== index));
    };

    const updateLine = (index, field, value) => {
        const updated = [...details];
        updated[index][field] = value;
        setDetails(updated);
    };

    /* ══════════════════════════════
       PRICING BY CLIENT TYPE
    ══════════════════════════════ */
    const getProductPrice = (product) => {
        if (!product) return 0;
        const client = clients.find(c => c.clientId === form.clientId);
        const clientType = client?.clientType ?? "pulpero";

        if (clientType === "extranjero" && product.extranjeroPrice != null) return product.extranjeroPrice;
        if (clientType === "rutero" && product.ruteroPrice != null) return product.ruteroPrice;

        // Default: pulpero price = productPrice
        return product.productPrice;
    };

    /* ══════════════════════════════
       CALCULATIONS
    ══════════════════════════════ */
    const getLineSubtotal = (line) => {
        const product = products.find(p => p.productId === line.productId);
        if (!product) return 0;
        return getProductPrice(product) * line.quantity;
    };

    const getLineDiscount = (line) => {
        const subtotal = getLineSubtotal(line);
        const disc = parseFloat(line.discount) || 0;
        return subtotal * (disc / 100);
    };

    const getLineTotal = (line) => {
        return getLineSubtotal(line) - getLineDiscount(line);
    };

    // Totals
    const subTotal = details.reduce((sum, line) => sum + getLineSubtotal(line), 0);
    const totalDiscount = details.reduce((sum, line) => sum + getLineDiscount(line), 0);
    const subTotalAfterDiscount = subTotal - totalDiscount;

    // Tax: 13% if invoice checkbox is marked, 0% otherwise
    const taxPercentage = requiresInvoice ? 13 : 0;
    const taxAmount = subTotalAfterDiscount * (taxPercentage / 100);
    const total = subTotalAfterDiscount + taxAmount;

    const hasAnyDiscount = totalDiscount > 0;


    /* ══════════════════════════════
       OPTIONS
    ══════════════════════════════ */
    const searchSelectOptions = () => {
        return products.map((p) => ({
            value: p.productId,
            label: `${p.productName} - ${formatCurrency(getProductPrice(p))} - Disp: ${p.productQuantity}`
        }));
    };

    const routeSelectOptions = () => {
        return routes.map((r) => ({
            value: r.routeId,
            label: r.routeName
        }));
    };

    const searchSelectStyle = {
        control: (provided) => ({
            ...provided,
            borderRadius: "8px",
            boxShadow: "none",
            textAlign: "left",
        }),
        option: (provided, state) => ({
            ...provided,
            color: "black",
            backgroundColor: state.isSelected ? "lightgrey" : "white",
        }),
    };

    /* ══════════════════════════════
       LOAD
    ══════════════════════════════ */
    const loadDetails = () => {
        if (initialValues) {
            // Add discount field to existing details
            const loadedDetails = initialValues.saleDetails.map(d => ({
                ...d,
                discount: d.discountPercentage ?? 0,
            }));
            setDetails(loadedDetails);
            setOrderPaid(initialValues.purchasePaid);
            if (initialValues.taxPercentage > 0) {
                setRequiresInvoice(true);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleClientChange = async (e) => {
        const value = e.target.value;
        setForm({ ...form, clientId: value === "" ? "" : value });

        await getCreditAccountByClient(value).then((res) => {
            setClientAccounts(res.data.filter(ca => ca.clientAccountStatus === "active") ?? []);
        });
    };

    const handlePaymentMethodChange = async (e) => {
        const value = e.target.value;
        const creditAccount = value.startsWith("credit-");
        const isCredit = creditAccount ? value.split("-")[1] : null;
        setForm({
            ...form,
            purchasePaymentMethod: value === "" ? "" : value,
            clientAccountId: isCredit,
        });
    };

    /* ══════════════════════════════
       SUBMIT
    ══════════════════════════════ */
    const handleSubmit = (e) => {
        e.preventDefault();


        var client = clients.find(c => c.clientId === form.clientId);
        var account = clientAccounts.find(ca => ca.clientAccountId === Number(form.clientAccountId));

        console.log(account);

        if (!form.clientId || Number.isNaN(form.clientId)) {
            alert("Debe seleccionar a un cliente válido");
            return;
        }

        if (!client) {
            alert("El cliente seleccionado no existe o no esta activado. Intente con otro cliente");
            return;
        }

        if (details.length === 0) {
            alert("Debe tener al menos un producto agregado");
            return;
        }

        if (form.purchasePaymentMethod === "") {
            alert("Seleccione un método de pago para la orden");
            return;
        }

        // Use user-entered reason, fallback to auto-generated
        const discountReason = form.purchaseDiscountReason.trim() || "Descuento comercial";
        if (account) { 
        if (account.clientAccountCurrentBalance >= account.clientAccountCreditLimit || (account.clientAccountCurrentBalance + total) >= account.clientAccountCreditLimit) {
            alert("El limite de credito fue excedido o se sobrepaso con la compra. Por favor seleccione otra cuenta de credito o metodo de pago");
            return;
            }
        }

        const payload = {
            clientId: form.clientId.trim(),
            purchasePaid: orderPaid ? true : false,
            purchaseOrderNumber: "",
            taxId: null,
            taxPercentage: taxPercentage,
            subTotal: Number(subTotal),
            taxAmount: Number(taxAmount),
            total: Number(total),
            discountId: null,
            routeId: form.routeId ? Number(form.routeId) : null,
            clientAccountId: form.clientAccountId ? Number(form.clientAccountId) : null,
            purchaseDiscountApplied: hasAnyDiscount,
            purchaseDiscountPercentage: hasAnyDiscount
                ? Number(((totalDiscount / subTotal) * 100).toFixed(2))
                : 0,
            purchaseDiscountReason: discountReason,
            purchasePaymentMethod: form.purchasePaymentMethod.trim(),
            saleDetails: details.map((d) => {
                const product = products.find(p => d.productId === p.productId);
                const price = getProductPrice(product);
                const lineSubtotal = price * d.quantity;
                const lineDisc = lineSubtotal * ((parseFloat(d.discount) || 0) / 100);
                return {
                    productId: Number(d.productId),
                    productName: product.productName.trim(),
                    quantity: Number(d.quantity),
                    unitPrice: parseFloat(price),
                    lineTotal: parseFloat(lineSubtotal - lineDisc),
                };
            }),
        };

        console.log(payload);
        onSubmit(payload);
    };

    useEffect(() => {
        getClientLookup().then((res) => {
            setClients(res.data ?? []);
        });
        getProducts().then((res) => {
            setProducts(res.data ?? []);
        });
        getRoutes().then((res) => {
            setRoutes(res.data ?? []);
        });
        getCreditAccountByClient(initialValues ? initialValues.clientId : "").then((res) => {
            setClientAccounts(res.data.filter(ca => ca.clientAccountStatus === "active") ?? []);
        });
        loadDetails();
    }, []);

    // Get selected client info for display
    const selectedClient = clients.find(c => c.clientId === form.clientId);

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal">

                <h3>
                    {initialValues
                        ? `Orden #${initialValues.purchaseOrderNumber}`
                        : "Nueva venta"}
                </h3>

                <form className="ventas-form" onSubmit={handleSubmit}>

                    {/* ── Cliente ── */}
                    <div className="form-group">
                        <label>Cliente</label>
                        <input
                            type="text"
                            name="clientId"
                            value={form.clientId}
                            onChange={handleClientChange}
                            required
                            list="ventas-client-list"
                            disabled={initialValues !== null}
                        />
                        <datalist id="ventas-client-list">
                            {[...clients]
                                .sort((a, b) => a.clientName.localeCompare(b.clientName))
                                .map((c) => (
                                    <option key={c.clientId} value={c.clientId}>
                                        {c.clientName}
                                    </option>
                                ))}
                        </datalist>
                        {selectedClient && (
                            <span style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                                {selectedClient.clientName} — Tipo: <strong>{selectedClient.clientType || "pulpero"}</strong>
                            </span>
                        )}
                    </div>

                    {/* ── Factura electrónica checkbox ── */}
                    <div className="form-group">
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                            Requiere factura electrónica
                            <input
                                type="checkbox"
                                checked={requiresInvoice}
                                onChange={(e) => setRequiresInvoice(e.target.checked)}
                                style={{ margin: 0 }}
                            />
                        </label>
                        <span style={{ fontSize: 12, color: requiresInvoice ? "#15803d" : "#6b7280" }}>
                            {requiresInvoice ? "IVA 13% aplicado" : "Sin impuesto (0%)"}
                        </span>
                    </div>

                    <div className="form-group full-width">
                        <label>Ruta de cliente</label>
                        <SearchSelect
                            value={routeSelectOptions().find(op => op.value === form.routeId)}
                            name="routeId"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    routeId: e === null || e === undefined ? null : Number(e.value),
                                })
                            }
                            options={routeSelectOptions()}
                            styles={searchSelectStyle}
                            isClearable
                        />
                    </div>

                    <div className="form-group">
                        <label>Método de pago</label>
                        <select
                            name="purchasePaymentMethod"
                            value={form.purchasePaymentMethod}
                            onChange={handlePaymentMethodChange}
                            required
                            disabled={initialValues !== null}
                        >
                            <option value="">Seleccione método de pago</option>
                            <option value="creditcard">Tarjeta de crédito</option>
                            <option value="debitcard">Tarjeta de débito</option>
                            <option value="cash">Efectivo</option>
                            <option value="sinpe">SINPE</option>
                            {[...clientAccounts]
                                .sort((a, b) => a.name?.localeCompare(b.name))
                                .map((ca) => (
                                    <option key={ca.clientAccountId} value={`credit-${ca.clientAccountId}`}>
                                        Cuenta de crédito - {ca.clientAccountNumber}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                            Pagado
                            <input
                                type="checkbox"
                                checked={orderPaid}
                                onChange={(e) => setOrderPaid(e.target.checked)}
                                disabled={!initialValues && form.clientAccountId}
                                style={{ margin: 0 }}
                            />
                        </label>
                    </div>

                    {/* ── Products ── */}
                    <div className="form-group full-width">
                        <label>Productos</label>
                        <div className="section-header">
                            <button type="button" className="btn btn-outline btn-sm" onClick={addLine} disabled={initialValues !== null}>
                                + Agregar producto
                            </button>
                        </div>

                        {details.length === 0 && (
                            <p className="hint">Agregue al menos un producto a la venta</p>
                        )}

                        {details.map((line, i) => {
                            const product = products.find((p) => p.productId === parseInt(line.productId));
                            const unitPrice = product ? getProductPrice(product) : 0;
                            const lineSubtotal = unitPrice * (line.quantity || 0);
                            const lineDiscAmt = lineSubtotal * ((parseFloat(line.discount) || 0) / 100);
                            const lineAfterDisc = lineSubtotal - lineDiscAmt;
                            const lineTax = requiresInvoice ? lineAfterDisc * 0.13 : 0;
                            const lineTotal = lineAfterDisc + lineTax;

                            return (
                                <div key={i} style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    marginBottom: 8,
                                    background: "#fafafa",
                                }}>
                                    {/* Row 1: Product selector + remove */}
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <SearchSelect
                                                value={searchSelectOptions().find(op => op.value === line.productId)}
                                                onChange={(e) => updateLine(i, "productId", e.value)}
                                                options={searchSelectOptions()}
                                                styles={searchSelectStyle}
                                                required
                                                isDisabled={initialValues !== null}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeLine(i)}
                                            disabled={initialValues !== null}
                                            style={{
                                                background: "#ef4444",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 6,
                                                width: 32,
                                                height: 32,
                                                minWidth: 32,
                                                cursor: "pointer",
                                                fontSize: 14,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Row 2: Quantity, discount, info */}
                                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <label style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Cant:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={product ? product.productQuantity : 9999}
                                                value={line.quantity}
                                                onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 0)}
                                                required
                                                disabled={initialValues !== null}
                                                style={{ width: 60, textAlign: "center", padding: "6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13 }}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <label style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Desc %:</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={line.discount}
                                                onChange={(e) => updateLine(i, "discount", e.target.value)}
                                                placeholder="0"
                                                disabled={initialValues !== null}
                                                style={{ width: 60, textAlign: "center", padding: "6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13 }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 12, fontSize: 12, color: "#6b7280" }}>
                                            <span>Precio: <strong style={{ color: "#111" }}>{formatCurrency(unitPrice)}</strong></span>
                                            {lineDiscAmt > 0 && (
                                                <span style={{ color: "#b91c1c" }}>-{formatCurrency(lineDiscAmt)}</span>
                                            )}
                                            {requiresInvoice && (
                                                <span>IVA: <strong style={{ color: "#15803d" }}>{formatCurrency(lineTax)}</strong></span>
                                            )}
                                            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                                                {formatCurrency(lineTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Discount reason ── */}
                    {hasAnyDiscount && (
                        <div className="form-group full-width">
                            <label>Razón del descuento</label>
                            <input
                                type="text"
                                name="purchaseDiscountReason"
                                value={form.purchaseDiscountReason}
                                onChange={handleChange}
                                placeholder="Ej: Descuento comercial, promoción, etc."
                                maxLength={80}
                            />
                        </div>
                    )}

                    {/* ── Totals ── */}
                    {details.length > 0 && (
                        <div className="form-group full-width" style={{
                            background: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            padding: "14px 16px",
                        }}>
                            {selectedClient && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#6b7280" }}>
                                    <span>Tipo cliente: <strong style={{ textTransform: "capitalize" }}>{selectedClient.clientType || "pulpero"}</strong></span>
                                    <span>Impuesto: <strong>{requiresInvoice ? "IVA 13%" : "Sin impuesto"}</strong></span>
                                </div>
                            )}
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span>Subtotal:</span>
                                <strong>{formatCurrency(subTotal)}</strong>
                            </div>
                            {hasAnyDiscount && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#b91c1c" }}>
                                    <span>Descuento:</span>
                                    <strong>- {formatCurrency(totalDiscount)}</strong>
                                </div>
                            )}
                            {requiresInvoice && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#6b7280" }}>
                                    <span>IVA (13%):</span>
                                    <strong>{formatCurrency(taxAmount)}</strong>
                                </div>
                            )}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingTop: 8,
                                borderTop: "2px solid #e5e7eb",
                                fontSize: "1.1rem",
                            }}>
                                <span>Total:</span>
                                <strong>{formatCurrency(total)}</strong>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>

            </div>
        </div>,
        document.getElementById('modal-root')
    );
}

export default VentasForm;
