export default function RouteFilters({
    search,
    routeDate,
    driverUserId,
    includeInactive,
    drivers,
    onSearchChange,
    onRouteDateChange,
    onDriverUserIdChange,
    onIncludeInactiveChange,
}) {
    return (
        <div className="routes-filters">
            <input
                type="text"
                placeholder="Buscar ruta, chofer o ID..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <input
                type="date"
                value={routeDate}
                onChange={(e) => onRouteDateChange(e.target.value)}
            />

            <select
                value={driverUserId}
                onChange={(e) => onDriverUserIdChange(e.target.value)}
            >
                <option value="">Todos los choferes</option>
                {drivers.map((d) => (
                    <option key={d.userId} value={d.userId}>
                        {d.userName} {d.userLastname}
                    </option>
                ))}
            </select>

            <label className="routes-checkbox">
                <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => onIncludeInactiveChange(e.target.checked)}
                />
                Incluir inactivas
            </label>
        </div>
    );
}