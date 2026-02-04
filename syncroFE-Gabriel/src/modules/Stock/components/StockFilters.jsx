export default function StockFilters({
    name,
    distributorId,
    distributors,
    onNameChange,
    onDistributorChange,
}) {
    return (
        <div className="stock-filters">
            <input
                type="text"
                placeholder="Buscar producto..."
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
            />

            <select
                value={distributorId ?? ""}
                onChange={(e) =>
                    onDistributorChange(
                        e.target.value === "" ? null : Number(e.target.value)
                    )
                }
            >
                <option value="">Todos los proveedores</option>
                {distributors.map(d => (
                    <option key={d.distributorId} value={d.distributorId}>
                        {d.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
