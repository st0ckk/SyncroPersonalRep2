export default function VentasToolbar({ onNewSale }) {
    return (
        <div className="ventas-toolbar">
            <h2>Ventas</h2>
            <div className="toolbar-actions">
                <button className="btn-primary" onClick={onNewSale}>
                    + Nueva venta
                </button>
            </div>

        </div>
    );
}