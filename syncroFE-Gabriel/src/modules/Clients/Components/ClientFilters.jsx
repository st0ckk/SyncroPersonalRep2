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
                <option value="extranjero">Extranjero</option>
                <option value="pulpero">Pulpero</option>
                <option value="rutero">Rutero</option>
            </select>
        </div>
    );
}
