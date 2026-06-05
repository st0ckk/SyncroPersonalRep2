import Button from "../../../components/Button";

export default function StockToolbar({
    showInactive,
    onToggle,
    onNewProduct,
    onAddStock,
}) {
    return (
        <div className="stock-toolbar">
            <h2>Stock</h2>

            <div className="toolbar-actions">
                <Button variant="outline" onClick={onToggle}>
                    {showInactive ? "Ver Activos" : "Ver Inactivos"}
                </Button>

                <Button variant="secondary" onClick={onAddStock}>
                    + Agregar mercadería
                </Button>

                <Button variant="primary" onClick={onNewProduct}>
                    + Nuevo producto
                </Button>
            </div>
        </div>
    );
}
