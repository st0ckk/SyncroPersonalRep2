import Button from "../../../components/Button";

export default function VentasToolbar({ onNewSale }) {
    return (
        <div className="ventas-toolbar">
            <h2>Ventas</h2>
            <div className="toolbar-actions">
                <Button variant="primary" onClick={onNewSale}>
                    + Nueva venta
                </Button>
            </div>
        </div>
    );
}
