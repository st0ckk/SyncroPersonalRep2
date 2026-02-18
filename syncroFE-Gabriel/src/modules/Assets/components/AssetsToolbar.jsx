export default function AssetsToolbar({ showInactive, onToggle, onNew }) {
    return (
        <div className="assets-toolbar">
            <h2>Activos</h2>

            <div className="toolbar-actions">
                <button className="btn btn-outline" onClick={onToggle}>
                    {showInactive ? "Ver activos" : "Ver inactivos"}
                </button>

                <button className="btn btn-primary" onClick={onNew}>
                    + Nuevo activo
                </button>
            </div>
        </div>
    );
}