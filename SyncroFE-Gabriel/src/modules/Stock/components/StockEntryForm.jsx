import { useState } from "react";
import Button from "../../../components/Button";
import ProductAutoComplete from "./ProductAutoComplete";
import Swal from "sweetalert2";

export default function StockEntryForm({
    submitting,
    onSubmit,
    onCancel,
}) {
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!product) {
            await Swal.fire({ icon: "warning", title: "Atención", text: "Debe seleccionar un producto" });
            return;
        }

        if (quantity <= 0) {
            await Swal.fire({ icon: "warning", title: "Atención", text: "La cantidad debe ser mayor a 0" });
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
                <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                >
                    {submitting ? "Guardando..." : "Agregar"}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
