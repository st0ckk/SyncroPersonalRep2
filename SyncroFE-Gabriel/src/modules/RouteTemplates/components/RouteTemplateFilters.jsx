export default function RouteTemplateFilters({
    search,
    includeInactive,
    onSearchChange,
    onIncludeInactiveChange,
}) {
    return (
        <div className="route-templates-filters">
            <input
                type="text"
                placeholder="Buscar plantilla, chofer o ID..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <label className="route-templates-checkbox">
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