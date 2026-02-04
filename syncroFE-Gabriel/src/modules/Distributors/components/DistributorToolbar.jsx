export default function DistributorToolbar({ showInactive, onToggle, onNew }) {
    return (
        <div className="distributors-toolbar">
            <h2>Distribuidores</h2>

            <div className="toolbar-actions">
                <button className="btn btn-outline" onClick={onToggle}>
                    {showInactive ? "Ver Activos" : "Ver Inactivos"}
                </button>

                <button className="btn btn-primary" onClick={onNew}>
                    + Nuevo distribuidor
                </button>
            </div>
        </div>
    );
}
