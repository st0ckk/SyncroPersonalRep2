import { useEffect, useState } from "react";
import { getDistributorLookup } from "../../../api/distributors.api";

const emptyProduct = {
    distributorId: null,
    productName: "",
    productType: "",
    productPrice: 0,
    productQuantity: 0,
};

export default function StockForm({
    initialValues,
    submitting,
    onSubmit,
    onCancel,
}) {
    const [distributors, setDistributors] = useState([]);

    const [form, setForm] = useState(() => {
        if (!initialValues) return emptyProduct;

        return {
            distributorId: initialValues.distributorId ?? null,
            productName: initialValues.productName ?? "",
            productType: initialValues.productType ?? "",
            productPrice: Number(initialValues.productPrice ?? 0),
            productQuantity: Number(initialValues.productQuantity ?? 0),
        };
    });

    useEffect(() => {
        getDistributorLookup().then((res) => {
            setDistributors(res.data ?? []);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "productPrice" || name === "productQuantity"
                    ? Number(value)
                    : value,
        }));
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

        if (form.productPrice <= 0) {
            alert("El precio debe ser mayor a 0");
            return;
        }

        if (form.productQuantity < 0) {
            alert("La cantidad no puede ser negativa");
            return;
        }

        const payload = {
            distributorId: Number(form.distributorId),
            productName: form.productName.trim(),
            productType: form.productType.trim(),
            productPrice: Number(form.productPrice),
            productQuantity: Number(form.productQuantity),
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

            <div className="form-group">
                <label>Precio</label>
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
