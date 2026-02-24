import { useEffect, useState } from "react";
import { getClientLookup } from "../../../api/clients.api";
import { getDiscountLookup } from "../../../api/discount.api";
import { getProducts } from "../../../api/stock.api";
import { createPortal } from "react-dom";
import SearchSelect from "react-select";

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

    //Datos
    const [clients, setClients] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [products, setProducts] = useState([]);

    //Formulario
    const [applicableDiscount, setApplicableDiscount] = useState('');
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

    //Formateo de fechas para aplicarlo a inputs
    const formatDateInput = (dateString) => {
        if (!dateString) return null;

        //Separa la fecha y el tiempo
        const [date] = dateString.split("T");

        //Separa dias, meses, y anios
        const [years, months, days] = date.split("-");

        return `${years}-${months}-${days}`;
    };

    //Formateo para moneda
    const formatCurrency = (amount) => {
        var fixedAmount = parseFloat(amount);
        return `₡${fixedAmount.toFixed(2)}`;
    }

    //Gestion de lineas de items
    const addLine = () => {
        setDetails([...details, { productId: "", quantity: 1 }]);
    };

    const removeLine = (index) => {
        setDetails(details.filter((_, i) => i !== index));
    };

    const updateLine = (index, field, value) => {
        const updated = [...details];
        updated[index][field] = value;
        setDetails(updated);
    };

    //Calculos
    const getLineTotal = (line) => {
        const product = products.find(p => p.productId === line.productId);
        if (!product) return 0;

        return product.productPrice * line.quantity;
    };

    const subTotal = details.reduce((sum, line) => sum + getLineTotal(line), 0);
    const discountPercentage = form.discountId && discounts.length > 0 ? discounts.find(d => form.discountId === d.discountId).discountPercentage : 0;
    const total = subTotal - (subTotal * (discountPercentage / 100));

    //Opciones de search select
    const searchSelectOptions = () => {
        var productList = [];
        products.forEach((p) => {
            productList.push({ value: p.productId, label: `${p.productName}` })
        });
        return productList;
    };

    //Manejo de estilo de search select
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
            backGroundColor: state.isSelected ? "lighgrey" : "white",
        }),
    };


    //Carga de detalles de cotizacion
    const loadDetails = () => {
        if (initialValues) {
            setDetails(initialValues.quoteDetails);
            if (initialValues.quoteDiscountApplied) {
                setApplicableDiscount("yes");
            }
        }
            
    };

    //Manejo de cambios
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    //Guardar informacion
    const handleSubmit = (e) => {
        e.preventDefault();

        var client = clients.find(c => c.clientId === form.clientId);
        var currentDate = new Date();
        var mininumDays = new Date().setDate(currentDate.getDate() + 15);
        var expirationDate = new Date(form.quoteValidTil);

        //Condiciones
        if (!form.clientId || Number.isNaN(form.clientId)) {
            alert("Debe seleccionar a un cliente válido");
            return;
        }

        if (!client) {
            alert("El cliente seleccionado no existe o no esta activado. Intente con otro cliente");
            return;
        }

        if (!form.quoteValidTil || (expirationDate <= currentDate || expirationDate < mininumDays)) {
            alert("Debe seleccionar una fecha valida de expiracion. Minimo 15 dias de vigencia");
            return;
        }

        if (applicableDiscount === "yes" && (!form.discountId || Number.isNaN(form.discountId))) {
            alert("Debe seleccionar un porcentaje de descuento si desea aplicarlo.");
            return;
        }

        if (applicableDiscount === "yes" && form.quoteDiscountReason === "") {
            alert("Debe especificar la razon para aplicar descuentos en la cotizacion. ");
            return;
        }

        if (details.length === 0) {
            alert("Debe tener almenos un producto agregado");
            return;
        };

        const payload = {
            clientId: form.clientId.trim(),
            discountId: form.discountId ? Number(form.discountId) : null,
            quoteNumber: "",
            quoteCustomer: client.clientName.trim(),
            quoteValidTil: form.quoteValidTil,
            quoteStatus: initialValues ? form.quoteStatus.trim() : "pending",
            quoteRemarks: form.quoteRemarks ? form.quoteRemarks.trim() : "Sin observaciones.",
            quoteConditions : form.quoteConditions ? form.quoteConditions.trim() : "Sin codiciones aplicables.",
            quoteDiscountApplied: applicableDiscount === "yes" ? true : false,
            quoteDiscountPercentage: applicableDiscount === "yes" ? Number(discounts.find(d => form.discountId === d.discountId).discountPercentage) : 0,
            quoteDiscountReason: applicableDiscount ? form.quoteDiscountReason.trim() : "",
            quoteDetails: details.map((d) => ({
                productId: Number(d.productId),
                productName: products.find(p => d.productId === p.productId).productName.trim(),
                quantity: Number(d.quantity),
                unitPrice: parseFloat(products.find(p => d.productId === p.productId).productPrice),
                lineTotal: parseFloat(d.quantity * products.find(p => d.productId === p.productId).productPrice),
            })),
        }
        console.log(payload);
        onSubmit(payload);
    };



    useEffect(() => {
        getClientLookup().then((res) => {
            setClients(res.data ?? []);
        });
        getDiscountLookup().then((res) => {
            setDiscounts(res.data ?? []);
        });
        getProducts().then((res) => {
            setProducts(res.data ?? []);
        });
        loadDetails();
    }, []);

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal">

                <h3>
                    {initialValues
                        ? `Cotizacion ${initialValues.quoteNumber}`
                        : "Nueva cotizacion"}
                </h3>

                <form className="quote-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Cliente</label>
                        <input
                            type="text"
                            name="clientId"
                            value={form.clientId}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    clientId:
                                        e.target.value === ""
                                            ? ""
                                            : e.target.value,
                                })
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
                    </div>

                    <div className="form-group">
                        <label>Fecha de expiracion</label>
                        <input
                            type="date"
                            name="quoteValidTil"
                            value={formatDateInput(form.quoteValidTil) ?? ""}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Aplicar descuento</label>
                        <select
                            value={applicableDiscount}
                            onChange={(e) =>
                                setApplicableDiscount(e.target.value)}
                            required
                        >
                            <option value="no">No</option>
                            <option value="yes">Si</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Porcentaje de descuento</label>
                        <select
                            name="discountId"
                            value={form.discountId ?? ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    discountId:
                                        e.target.value === ""
                                            ? null
                                            : Number(e.target.value),
                                })
                            }
                            required
                            disabled={applicableDiscount !== 'yes'}
                        >
                            <option value="">Seleccione porcentaje de descuento</option>
                            {[...discounts]
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((d) => (
                                    <option key={d.discountId} value={d.discountId}>
                                        Descuento - {d.discountPercentage}%
                                    </option>
                                ))}

                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Razon de descuento</label>
                        <input
                            type="text"
                            placeholder="Defina el motivo de la aplicacion del descuento..."
                            name="quoteDiscountReason"
                            onChange={handleChange}
                            value={form.quoteDiscountReason}
                            required
                            disabled={applicableDiscount !== 'yes'}
                        />
                    </div>
                    {initialValues && (
                    <div className="form-group full-width">
                        <label>Estado de cotizacion</label>
                        <select
                                value={form.quoteStatus}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        quoteStatus:
                                            e.target.value === ""
                                                ? ""
                                                : e.target.value,
                                    })
                                }
                                required
                                disabled={form.quoteStatus=="expired"}
                        >
                            <option value="pending">Pendiente</option>
                            <option value="approved">Aprobada</option>
                            <option value="rejected">Rechazada</option>
                        </select>
                    </div>
                    )}

                    <div className="form-group">
                        <label>Condiciones</label>
                        <textarea
                            name="quoteConditions"
                            value={form.quoteConditions}
                            onChange={handleChange}
                        >
                        </textarea>
                    </div>

                    <div className="form-group">
                        <label>Observaciones</label>
                        <textarea
                            name="quoteRemarks"
                            value={form.quoteRemarks}
                            onChange={handleChange}
                        >
                        </textarea>
                    </div>

                    <div className="form-group">
                        <label>Productos</label>
                        <div className="section-header">
                            <button type="button" className="btn btn-outline btn-sm" onClick={addLine}>
                                + Agregar producto
                            </button>
                        </div>

                        {details.length === 0 && (
                            <p className="hint">Agregue al menos un producto a la cotizacion</p>
                        )}

                        {details.map((line, i) => {
                            const product = products.find((p) => p.productId === parseInt(line.productId));
                            return (
                                <div key={i} class="quote-form-details-items">

                                    <SearchSelect
                                        value={searchSelectOptions().find(op => op.value === line.productId)}
                                        onChange={(e) => updateLine(i, "productId", e.value)}
                                        options={searchSelectOptions()}
                                        id="quote-items-select"
                                        style={searchSelectStyle}
                                        required
                                    >
                                    </SearchSelect>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product ? product.productQuantity : 9999}
                                        value={line.quantity}
                                        onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 0)}
                                        placeholder="Cant."
                                        required
                                    />

                                    <span className="line-total">{formatCurrency(getLineTotal(line))}</span>

                                    <button type="button" className="btn btn-danger btn-lg" onClick={() => removeLine(i)}>
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="form-group">
                        <label>Informacion de precio</label>
                        <div>Subtotal: <strong>{formatCurrency(subTotal)}</strong></div>
                        <div className="grand-total">Total: <strong>{formatCurrency(total)}</strong></div>
                    </div>

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



export default QuoteForm;