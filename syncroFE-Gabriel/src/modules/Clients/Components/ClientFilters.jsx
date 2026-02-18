export default function ClientFilters({
    search,
    clientType,
    onSearchChange,
    onClientTypeChange
}) {
    return (
        <div className="clients-filters">
            <input
                type="text"
                placeholder="Buscar cliente o ID..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <select
                value={clientType ?? ""}
                onChange={(e) =>
                    onClientTypeChange(
                        e.target.value === "" ? null : e.target.value
                    )
                }
            >
                <option value="">Todos los tipos</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
                <option value="corporativo">Corporativo</option>
            </select>
        </div>
    );
}
