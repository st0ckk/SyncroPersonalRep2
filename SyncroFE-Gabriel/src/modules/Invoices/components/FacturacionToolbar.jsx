export default function FacturacionToolbar({ onNewInvoice, onRefresh }) {
    return (
        <div className="facturacion-toolbar">
            <h2>Facturacion Electronica</h2>
            <div className="toolbar-actions">
                <button className="btn btn-outline" onClick={onRefresh}>
                    Actualizar
                </button>
                <button className="btn-primary" onClick={onNewInvoice}>
                    + Generar Factura
                </button>
            </div>
        </div>
    );
}
