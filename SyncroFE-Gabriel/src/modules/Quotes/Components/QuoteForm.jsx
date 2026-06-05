import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import { getAllClients } from "../../../api/clients.api";
import { getProducts } from "../../../api/stock.api";
import { createPortal } from "react-dom";
import SearchSelect from "react-select";
import Swal from "sweetalert2";

const emptyQuote = {
    clientId: null,
    discountId: null,
    quoteNumber: "",
    quoteCustomer: "",
    quoteValidTil: null,
    quoteStatus: "",
    quoteRemarks: "",
    quoteConditions: "",
    quoteDiscountApplied: false,
    quoteDiscountPercentage: null,
    quoteDiscountReason: "",
    quoteDetails: [],
};

function QuoteForm({
    initialValues,
    submitting,
    onSubmit,
    onCancel,
}) {

    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [details, setDetails] = useState([]);
    const [form, setForm] = useState(() => {
        if (!initialValues) return emptyQuote;
        return {
            clientId: initialValues.clientId ?? "",
            discountId: initialValues.discountId ?? null,
            quoteNumber: initialValues.quoteNumber ?? "",
            quoteCustomer: initialValues.quoteCustomer ?? "",
            quoteValidTil: initialValues.quoteValidTil ?? null,
            quoteStatus: initialValues.quoteStatus ?? "",
            quoteRemarks: initialValues.quoteRemarks ?? "",
            quoteConditions: initialValues.quoteConditions ?? "",
            quoteDiscountApplied: initialValues.quoteDiscountApplied ?? false,
            quoteDiscountPercentage: initialValues.quoteDiscountPercentage ?? null,
            quoteDiscountReason: initialValues.quoteDiscountReason ?? "",
        };
    });

    // Cancelacion
    const [confirmRejection, setConfirmRejection] = useState(null);
    const [rejection, setRejection] = useState(false);

    const handleQuoteRejection = async (e) => {
        if (form.quoteStatus == "rejected") {
            setConfirmRejection(true);
        } else {
            handleSubmit(e);
        }
    }

    //Formateo de fechas
    const formatDateInput = (dateString) => {
        if (!dateString) return null;
        const [date] = dateString.split("T");
        const [years, months, days] = date.split("-");
        return `${years}-${months}-${days}`;
    };

    //Formato de moneda
    const formatCurrency = (amount) => {
        var fixedAmount = parseFloat(amount);
        return `₡ ${fixedAmount.toFixed(2)}`;
    };

    //Retorna la fecha resultante con base en la cantidad de semanas elegida
    const formatExpirationTimeInput = (weeks) => {
        if (!weeks) return null;

        var expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + (Number(weeks) * 7) + 1)
        const [months, days, years] = expirationDate.toLocaleDateString().split("/");
        return `${years}-${months}-${days}`;
    };

    //Retorna una fecha en formato local de fecha
    const formatLocalTimeInput = (input) => {
        var date = new Date(input);
        return date.toLocaleDateString();
    }

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

    const subTotal = details.reduce((sum, line) => sum + getLineSubtotal(line), 0);
    const totalDiscount = details.reduce((sum, line) => sum + getLineDiscount(line), 0);
    const total = subTotal - totalDiscount;
    const hasAnyDiscount = totalDiscount > 0;

    /* ══════════════════════════════
       OPTIONS
    ══════════════════════════════ */
    const searchSelectOptions = () => {
        return products.map((p) => ({
            value: p.productId,
            label: `${p.productName} - ${formatCurrency(getProductPrice(p))}`
        }));
    };

    const searchSelectStyle = {
        control: (provided) => ({
            ...provided,
            borderRadius: "8px",
            textAlign: "left",
            backgroundColor: "#ffffff",
            borderColor: "#e2e5ea",
            color: "#1e293b",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#1e293b",
        }),
        input: (provided) => ({
            ...provided,
            color: "#1e293b",
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "#ffffff",
            border: "1px solid #e2e5ea",
        }),
        option: (provided, state) => ({
            ...provided,
            color: "#1e293b",
            backgroundColor: state.isSelected
                ? "rgba(37, 99, 235, 0.12)"
                : state.isFocused
                    ? "#f1f3f6"
                    : "transparent",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#64748b",
        }),
    };

    /* ══════════════════════════════
       LOAD
    ══════════════════════════════ */
    const loadDetails = () => {
        if (initialValues) {
            const loadedDetails = initialValues.quoteDetails.map(d => ({
                ...d,
                discount: d.discountPercentage ?? "",
            }));
            setDetails(loadedDetails);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    /* ══════════════════════════════
       SUBMIT
    ══════════════════════════════ */
    const handleSubmit = async (e) => {
        e.preventDefault();

        var client = clients.find(c => c.clientId === form.clientId);
        var currentDate = new Date();

        currentDate.setHours(0, 0, 0, 0);

        var mininumDays = new Date();
        mininumDays.setDate(currentDate.getDate() + 7);
        mininumDays.setHours(0, 0, 0, 0);

        var expirationDate = new Date();
        initialValues ? expirationDate = new Date(formatDateInput(form.quoteValidTil)) : expirationDate = new Date(formatExpirationTimeInput(form.quoteValidTil));
        expirationDate.setHours(0, 0, 0, 0);

        //Validaciones
        if (!form.clientId || Number.isNaN(form.clientId)) {
            await Swal.fire({ icon: "warning", title: "Advertencia", text: "Debe seleccionar a un cliente válido" });
            return;
        }

        if (!client) {
            await Swal.fire({ icon: "warning", title: "Advertencia", text: "El cliente seleccionado no existe" });
            return;
        }

        if (!client.isActive) {
            await Swal.fire({ icon: "warning", title: "Advertencia", text: "El cliente seleccionado se encuentra actualmente deshabilitado" });
            return;
        }

        if (!form.quoteValidTil || expirationDate <= currentDate || expirationDate < mininumDays) {
            await Swal.fire({ icon: "warning", title: "Advertencia", text: "Debe seleccionar una fecha con más de una semana de vigencia" });
            return;
        }

        if (details.length === 0) {
            await Swal.fire({ icon: "warning", title: "Advertencia", text: "Debe tener almenos un producto agregado" });
            return;
        }

        const discountReason = form.quoteDiscountReason.trim() || "Descuento comercial";

        const overallDiscPct = subTotal > 0
            ? Number(((totalDiscount / subTotal) * 100).toFixed(2))
            : 0;

        const payload = {
            clientId: form.clientId.trim(),
            discountId: null,
            quoteNumber: "",
            quoteCustomer: client.clientName.trim(),
            quoteValidTil: expirationDate,
            quoteStatus: initialValues ? form.quoteStatus.trim() : "pending",
            quoteRemarks: form.quoteRemarks ? form.quoteRemarks.trim() : "Sin observaciones.",
            quoteConditions: form.quoteConditions ? form.quoteConditions.trim() : "Sin condiciones aplicables.",
            quoteDiscountApplied: hasAnyDiscount,
            quoteDiscountPercentage: overallDiscPct,
            quoteDiscountReason: hasAnyDiscount ? discountReason : "",
            quoteDetails: details.map((d) => {
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

        onSubmit(payload);
    };


    useEffect(() => {
        getAllClients().then((res) => {
            setClients(res.data ?? []);
        });
        getProducts().then((res) => {
            setProducts(res.data ?? []);
        });
        loadDetails();
    }, []);

    const selectedClient = clients.find(c => c.clientId === form.clientId);

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal">

                <h3>
                    {initialValues
                        ? `Cotización #${initialValues.quoteNumber}`
                        : "Nueva cotización"}
                </h3>

                <form className="quote-form" onSubmit={handleSubmit}>

                    {/* ── Cliente ── */}
                    <div className="form-group">
                        <label>Cliente</label>
                        <input
                            type="text"
                            name="clientId"
                            value={form.clientId}
                            onChange={(e) =>
                                setForm({ ...form, clientId: e.target.value === "" ? "" : e.target.value })
                            }
                            required
                            list="quote-client-list"
                            disabled={initialValues !== null}
                        />
                        <datalist id="quote-client-list">
                            {[...clients]
                                .sort((a, b) => a.clientName.localeCompare(b.clientName))
                                .map((c) => (
                                    <option key={c.clientId} value={c.clientId}>
                                        {c.clientName}
                                    </option>
                                ))}
                        </datalist>
                        {selectedClient && (
                            <span style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                {selectedClient.clientName} — Tipo: <strong style={{ textTransform: "capitalize" }}>{selectedClient.clientType || "pulpero"}</strong>
                            </span>
                        )}
                    </div>

                    {!initialValues && (
                        <div className="form-group">
                            <label>Tiempo de vigencia</label>
                            <select
                                value={form.quoteValidTil}
                                onChange={(e) =>
                                    setForm({ ...form, quoteValidTil: e.target.value === "" ? "" : e.target.value })
                                }
                                required
                            >
                                <option value="">Seleccione una opción</option>
                                <option value="1">1 Semana</option>
                                <option value="2">2 Semanas</option>
                                <option value="3">3 Semanas</option>
                                <option value="4">4 Semanas</option>
                                <option value="5">5 Semanas</option>
                            </select>

                            {form.quoteValidTil && (
                                <span style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                                    Fecha de expiración: <strong style={{ textTransform: "capitalize" }}>{formatLocalTimeInput(formatExpirationTimeInput(form.quoteValidTil))} </strong>
                                </span>
                            )}
                        </div>
                    )}

                    {initialValues && (
                        <div className="form-group">
                            <label>Fecha de expiración</label>
                            <input
                                type="date"
                                name="quoteValidTil"
                                value={formatDateInput(form.quoteValidTil) ?? ""}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Condiciones</label>
                        <textarea
                            name="quoteConditions"
                            value={form.quoteConditions}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Observaciones</label>
                        <textarea
                            name="quoteRemarks"
                            value={form.quoteRemarks}
                            onChange={handleChange}
                        />
                    </div>

                    {initialValues && (
                        <div className="form-group">
                            <label>Estado de cotización</label>
                            <select
                                value={form.quoteStatus}
                                onChange={(e) =>
                                    setForm({ ...form, quoteStatus: e.target.value === "" ? "" : e.target.value })
                                }
                                required
                                disabled={form.quoteStatus === "expired"}
                            >
                                <option value="pending">Pendiente</option>
                                <option value="approved">Aprobada</option>
                                <option value="rejected">Rechazada</option>
                            </select>
                        </div>
                    )}

                    {/* ── Products ── */}
                    <div className="form-group full-width">
                        <label>Productos</label>
                        <div className="section-header">
                            <Button type="button" variant="outline" size="sm" onClick={addLine}>
                                + Agregar producto
                            </Button>
                        </div>

                        {details.length === 0 && (
                            <p className="hint">Agregue al menos un producto a la cotización</p>
                        )}

                        {details.map((line, i) => {
                            const product = products.find((p) => p.productId === parseInt(line.productId));
                            const unitPrice = product ? getProductPrice(product) : 0;
                            const lineSubtotal = unitPrice * (line.quantity || 0);
                            const lineDiscAmt = lineSubtotal * ((parseFloat(line.discount) || 0) / 100);
                            const lineTotal = lineSubtotal - lineDiscAmt;

                            return (
                                <div key={i} style={{
                                    border: "1px solid #e2e5ea",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    marginBottom: 8,
                                    background: "rgba(255,255,255,0.04)",
                                }}>
                                    {/* Row 1: Product selector + remove */}
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                        <div id="react-select" style={{ flex: 1, minWidth: 0 }}>
                                            <SearchSelect
                                                value={searchSelectOptions().find(op => op.value === line.productId)}
                                                onChange={(e) => updateLine(i, "productId", e.value)}
                                                options={searchSelectOptions()}
                                                styles={searchSelectStyle}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeLine(i)}
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
                                            <label style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Cant:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={product ? product.productQuantity : 9999}
                                                value={line.quantity}
                                                onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 0)}
                                                required
                                                style={{ width: 60, textAlign: "center", padding: "6px", borderRadius: 4, border: "1px solid #e2e5ea", fontSize: 13, background: "#ffffff", color: "#1e293b" }}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <label style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Desc %:</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={line.discount}
                                                onChange={(e) => updateLine(i, "discount", e.target.value)}
                                                placeholder="0"
                                                style={{ width: 60, textAlign: "center", padding: "6px", borderRadius: 4, border: "1px solid #e2e5ea", fontSize: 13, background: "#ffffff", color: "#1e293b" }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 12, fontSize: 12, color: "#64748b" }}>
                                            <span>Precio: <strong style={{ color: "#1e293b" }}>{formatCurrency(unitPrice)}</strong></span>
                                            {lineDiscAmt > 0 && (
                                                <span><strong>{formatCurrency(lineDiscAmt)}</strong></span>
                                            )}
                                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
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
                                name="quoteDiscountReason"
                                value={form.quoteDiscountReason}
                                onChange={handleChange}
                                placeholder="Ej: Descuento comercial, promoción, etc."
                                maxLength={80}
                            />
                        </div>
                    )}

                    {/* ── Totals ── */}
                    {details.length > 0 && (
                        <div className="form-group full-width" style={{
                            background: "#f8f9fb",
                            border: "1px solid #e2e5ea",
                            borderRadius: 8,
                            padding: "14px 16px",
                        }}>
                            {selectedClient && (
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#64748b" }}>
                                    <span>Tipo cliente: <strong style={{ textTransform: "capitalize" }}>{selectedClient.clientType || "pulpero"}</strong></span>
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
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingTop: 8,
                                borderTop: "2px solid rgba(255,255,255,0.1)",
                                fontSize: "1.1rem",
                            }}>
                                <span>Total:</span>
                                <strong>{formatCurrency(total)}</strong>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        {!initialValues && (
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                            >
                                {submitting ? "Guardando..." : "Guardar"}
                            </Button>
                        )}
                        {initialValues && (
                            <Button
                                type="button"
                                variant="primary"
                                disabled={submitting}
                                onClick={handleQuoteRejection}
                            >
                                {submitting ? "Guardando..." : "Guardar"}
                            </Button>
                        )}
                    </div>
                </form>

                {/* Modal de confirmación de aprobación de cotización*/}
                {confirmRejection && (
                    <div className="modal-backdrop">
                        <div className="modal modal-confirm">
                            <h3>Confirmar rechazo</h3>
                            <p>
                                ¿Está seguro que desea rechazar esta cotización?
                            </p>
                            <p className="hint">
                                No se podra editar el registro luego de este cambio.
                            </p>
                            <div className="form-actions">
                                <Button
                                    variant="outline"
                                    onClick={() => setConfirmRejection(false)}
                                    disabled={rejection}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleSubmit}
                                    disabled={rejection}
                                >
                                    {rejection ? "Aplicando cambios..." : "Sí, rechazar"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.getElementById('modal-root')
    );
}

export default QuoteForm;
