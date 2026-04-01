import { useEffect, useState, useCallback } from "react";
import { getDistributorLookup } from "../../../api/distributors.api";
import { searchCabys } from "../../../api/stock.api";

const emptyProduct = {
    distributorId: null,
    productName: "",
    productType: "",
    productPrice: 0,
    pulperoPrice: "",
    extranjeroPrice: "",
    ruteroPrice: "",
    productQuantity: 0,
    cabysCode: "",
    isService: false,
};

export default function StockForm({
    initialValues,
    submitting,
    onSubmit,
    onCancel,
}) {
    const [distributors, setDistributors] = useState([]);
    const [cabysQuery, setCabysQuery] = useState("");
    const [cabysResults, setCabysResults] = useState([]);
    const [cabysLoading, setCabysLoading] = useState(false);
    const [showCabys, setShowCabys] = useState(false);

    const [form, setForm] = useState(() => {
        if (!initialValues) return emptyProduct;

        return {
            distributorId: initialValues.distributorId ?? null,
            productName: initialValues.productName ?? "",
            productType: initialValues.productType ?? "",
            productPrice: Number(initialValues.productPrice ?? 0),
            pulperoPrice: initialValues.pulperoPrice ?? "",
            extranjeroPrice: initialValues.extranjeroPrice ?? "",
            ruteroPrice: initialValues.ruteroPrice ?? "",
            productQuantity: Number(initialValues.productQuantity ?? 0),
            cabysCode: initialValues.cabysCode ?? "",
            isService: initialValues.isService ?? false,
        };
    });

    useEffect(() => {
        getDistributorLookup().then((res) => {
            setDistributors(res.data ?? []);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "productPrice" ||
                      name === "pulperoPrice" ||
                      name === "extranjeroPrice" ||
                      name === "ruteroPrice" ||
                      name === "productQuantity"
                    ? value
                    : value,
        }));
    };

    /* ── CABYS search ── */
    const handleCabysSearch = useCallback(async () => {
        if (!cabysQuery.trim() || cabysQuery.trim().length < 3) return;

        setCabysLoading(true);
        try {
            const res = await searchCabys(cabysQuery, 10);
            setCabysResults(res.data?.cabys ?? []);
            setShowCabys(true);
        } catch {
            setCabysResults([]);
        } finally {
            setCabysLoading(false);
        }
    }, [cabysQuery]);

    const [selectedCabys, setSelectedCabys] = useState(null);

    const selectCabys = (item) => {
        setForm((prev) => ({
            ...prev,
            cabysCode: item.codigo,
        }));
        setSelectedCabys(item);
        setShowCabys(false);
        setCabysQuery("");
    };

    const clearCabys = () => {
        setForm((prev) => ({ ...prev, cabysCode: "" }));
        setSelectedCabys(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.distributorId || Number.isNaN(form.distributorId)) {
            alert("Debe seleccionar un distribuidor válido");
            return;
        }

        if (!form.productName.trim()) {
            alert("El nombre del producto es obligatorio");
            return;
        }

        if (Number(form.productPrice) <= 0) {
            alert("El precio debe ser mayor a 0");
            return;
        }

        if (Number(form.productQuantity) < 0) {
            alert("La cantidad no puede ser negativa");
            return;
        }

        const payload = {
            distributorId: Number(form.distributorId),
            productName: form.productName.trim(),
            productType: form.productType.trim(),
            productPrice: Number(form.productPrice),
            pulperoPrice: form.pulperoPrice !== "" ? Number(form.pulperoPrice) : null,
            extranjeroPrice: form.extranjeroPrice !== "" ? Number(form.extranjeroPrice) : null,
            ruteroPrice: form.ruteroPrice !== "" ? Number(form.ruteroPrice) : null,
            productQuantity: Number(form.productQuantity),
            cabysCode: form.cabysCode || null,
            isService: form.isService,
        };

        onSubmit(payload);
    };

    return (
        <form className="stock-form" onSubmit={handleSubmit}>
            <div className="form-group full-width">
                <label>Distribuidor</label>
                <select
                    name="distributorId"
                    value={form.distributorId ?? ""}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            distributorId:
                                e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                        })
                    }
                    required
                >
                    <option value="">Seleccione distribuidor</option>
                    {[...distributors]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((d) => (
                            <option key={d.distributorId} value={d.distributorId}>
                                {d.name}
                            </option>
                        ))}

                </select>
            </div>

            <div className="form-group">
                <label>Nombre</label>
                <input
                    type="text"
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Tipo</label>
                <input
                    type="text"
                    name="productType"
                    value={form.productType}
                    onChange={handleChange}
                />
            </div>

            {/* ── Precios ── */}
            <div className="form-group">
                <label>Precio Pulpero</label>
                <input
                    type="number"
                    name="productPrice"
                    value={form.productPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                />
            </div>

            <div className="form-group">
                <label>Precio Extranjero</label>
                <input
                    type="number"
                    name="extranjeroPrice"
                    value={form.extranjeroPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Mismo que pulpero si vacío"
                />
            </div>

            <div className="form-group">
                <label>Precio Rutero</label>
                <input
                    type="number"
                    name="ruteroPrice"
                    value={form.ruteroPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Mismo que pulpero si vacío"
                />
            </div>

            <div className="form-group">
                <label>Cantidad</label>
                <input
                    type="number"
                    name="productQuantity"
                    value={form.productQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                />
            </div>

            {/* ── Facturación electrónica ── */}
            <div className="form-group full-width" style={{ marginTop: 4 }}>
                <strong style={{ fontSize: 14, color: "#374151" }}>Facturación electrónica</strong>
            </div>

            <div className="form-group full-width">
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    Producto es un servicio
                    <input
                        type="checkbox"
                        name="isService"
                        checked={form.isService}
                        onChange={handleChange}
                        style={{ margin: 0 }}
                    />
                </label>
                <span style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    Marcar si el producto es un servicio (afecta los totales en la factura electrónica)
                </span>
            </div>

            {/* ── CABYS selected display ── */}
            {form.cabysCode && (
                <div className="form-group full-width">
                    <label>Código CABYS seleccionado</label>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: 8,
                        fontSize: 13,
                    }}>
                        <div style={{ flex: 1 }}>
                            <strong>{form.cabysCode}</strong>
                            {selectedCabys && (
                                <span style={{ marginLeft: 8, color: "#374151" }}>
                                    — {selectedCabys.descripcion}
                                    <span style={{ marginLeft: 8, color: "#15803d", fontWeight: 500 }}>
                                        (IVA {selectedCabys.impuesto}%)
                                    </span>
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={clearCabys}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#b91c1c",
                                cursor: "pointer",
                                fontSize: 16,
                                fontWeight: 600,
                                padding: "0 4px",
                            }}
                            title="Quitar CABYS"
                        >
                            x
                        </button>
                    </div>
                </div>
            )}

            {/* ── CABYS search ── */}
            <div className="form-group full-width" style={{ position: "relative" }}>
                <label>Buscar CABYS en Hacienda</label>
                <input
                    type="text"
                    value={cabysQuery}
                    onChange={(e) => setCabysQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleCabysSearch();
                        }
                    }}
                    placeholder="Buscar por descripción del producto..."
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #dcdcdc", fontSize: 14, color: "#111", background: "#fff" }}
                />
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCabysSearch}
                    disabled={cabysLoading || cabysQuery.trim().length < 3}
                    style={{ marginTop: 8, padding: "10px 0", fontSize: 13, width: "100%" }}
                >
                    {cabysLoading ? "Buscando..." : "Buscar CABYS"}
                </button>

                {showCabys && cabysResults.length > 0 && (
                    <div style={{
                        marginTop: 8,
                        border: "1px solid #dcdcdc",
                        borderRadius: 8,
                        maxHeight: 250,
                        overflowY: "auto",
                        background: "#fff",
                        zIndex: 10,
                    }}>
                        {cabysResults.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => selectCabys(item)}
                                style={{
                                    padding: "10px 14px",
                                    borderBottom: "1px solid #f0f0f0",
                                    cursor: "pointer",
                                    fontSize: 13,
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = "#f5f6fa"}
                                onMouseOut={(e) => e.currentTarget.style.background = "#fff"}
                            >
                                <strong>{item.codigo}</strong>
                                <span style={{ marginLeft: 8, color: "#6b7280" }}>
                                    {item.descripcion}
                                </span>
                                <span style={{ marginLeft: 8, color: "#15803d", fontWeight: 500 }}>
                                    IVA {item.impuesto}%
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {showCabys && cabysResults.length === 0 && !cabysLoading && (
                    <span style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
                        No se encontraron resultados
                    </span>
                )}
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting ? "Guardando..." : "Guardar"}
                </button>

                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
