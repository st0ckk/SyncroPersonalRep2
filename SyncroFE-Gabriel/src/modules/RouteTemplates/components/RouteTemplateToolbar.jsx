export default function RouteTemplateToolbar({ onNew }) {
    return (
        <div className="route-templates-toolbar">
            <h2>Plantillas de rutas</h2>

            <div className="toolbar-actions">
                <button className="btn btn-primary" onClick={onNew}>
                    + Nueva plantilla
                </button>
            </div>
        </div>
    );
}