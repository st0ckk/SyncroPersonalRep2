export default function RouteToolbar({ onNewRoute }) {
    return (
        <div className="routes-toolbar">
            <h2>Rutas</h2>

            <div className="toolbar-actions">
                <button className="btn btn-primary" onClick={onNewRoute}>
                    + Nueva ruta
                </button>
            </div>
        </div>
    );
}