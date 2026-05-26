import Button from "../../../components/Button";

export default function FacturacionToolbar({ onNewInvoice, onRefresh }) {
    return (
        <div className="facturacion-toolbar">
            <h2>Facturacion Electronica</h2>
            <div className="toolbar-actions">
                <Button variant="outline" onClick={onRefresh}>
                    Actualizar
                </Button>
                <Button variant="primary" onClick={onNewInvoice}>
                    + Generar Factura
                </Button>
            </div>
        </div>
    );
}
