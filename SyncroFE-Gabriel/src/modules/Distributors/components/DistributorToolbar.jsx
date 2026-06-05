import Button from "../../../components/Button";

export default function DistributorToolbar({ showInactive, onToggle, onNew }) {
    return (
        <div className="distributors-toolbar">
            <h2>Proveedores</h2>

            <div className="toolbar-actions">
                <Button variant="outline" onClick={onToggle}>
                    {showInactive ? "Ver Activos" : "Ver Inactivos"}
                </Button>

                <Button variant="primary" onClick={onNew}>
                    + Nuevo proveedor
                </Button>
            </div>
        </div>
    );
}
