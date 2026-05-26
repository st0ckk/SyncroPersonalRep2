import Button from "../../../components/Button";

export default function AssetsToolbar({ showInactive, onToggle, onNew, users, selectedUserId, onUserFilter }) {
    return (
        <div className="assets-toolbar">
            <h2>Activos</h2>

            <div className="toolbar-actions">
                <select
                    value={selectedUserId}
                    onChange={(e) => onUserFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos los usuarios</option>
                    {users.map((u) => (
                        <option key={u.userId} value={u.userId}>
                            {u.userName} {u.userLastname ?? ""}
                        </option>
                    ))}
                </select>

                <Button variant="outline" onClick={onToggle}>
                    {showInactive ? "Ver activos" : "Ver inactivos"}
                </Button>

                <Button variant="primary" onClick={onNew}>
                    + Nuevo activo
                </Button>
            </div>
        </div>
    );
}
