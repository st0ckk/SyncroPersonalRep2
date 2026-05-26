import Button from "../../../components/Button";

export default function RouteToolbar({ onNewRoute }) {
    return (
        <div className="routes-toolbar">
            <h2>Rutas</h2>

            <div className="toolbar-actions">
                <Button variant="primary" onClick={onNewRoute}>
                    + Nueva ruta
                </Button>
            </div>
        </div>
    );
}