import { useState } from "react";
import ProductAutoComplete from "./ProductAutoComplete";

export default function StockEntryForm({
    submitting,
    onSubmit,
    onCancel,
}) {
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!product) {
            alert("Debe seleccionar un producto");
            return;
        }

        if (quantity <= 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
        }

        onSubmit({
            productId: product.productId,
            quantity,
        });
    };

    return (
        <form className="stock-entry-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Producto</label>
                <ProductAutoComplete onSelect={setProduct} />
                {product && (
                    <small className="hint">
                        Stock actual: {product.productQuantity}
                    </small>
                )}
            </div>

            <div className="form-group">
                <label>Cantidad a agregar</label>
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                />
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting ? "Guardando..." : "Agregar"}
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
