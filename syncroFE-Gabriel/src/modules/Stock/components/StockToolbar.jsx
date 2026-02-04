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
                <button className="btn-outline" onClick={onToggle}>
                    {showInactive ? "Ver Activos" : "Ver Inactivos"}
                </button>

                <button className="btn-secondary" onClick={onAddStock}>
                    + Agregar mercadería
                </button>

                <button className="btn-primary" onClick={onNewProduct}>
                    + Nuevo producto
                </button>
            </div>
        </div>
    );
}
