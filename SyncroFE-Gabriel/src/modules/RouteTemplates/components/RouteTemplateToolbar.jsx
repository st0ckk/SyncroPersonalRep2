import Button from "../../../components/Button";

export default function RouteTemplateToolbar({ onNew }) {
    return (
        <div className="route-templates-toolbar">
            <h2>Plantillas de rutas</h2>

            <div className="toolbar-actions">
                <Button variant="primary" onClick={onNew}>
                    + Nueva plantilla
                </Button>
            </div>
        </div>
    );
}