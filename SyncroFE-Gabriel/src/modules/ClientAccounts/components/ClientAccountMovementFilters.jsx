export default function ClientAccountMovementFilters({
    search,
    type,
    startDate,
    endDate,
    onSearchChange,
    onTypeChange,
    onStartDateChange,
    onEndDateChange
}) {
    return (
        <div className="caccounts-filters">
            <input
                type="text"
                placeholder="Buscar movimiento..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <select
                value={type ?? ""}
                onChange={(e) =>
                    onTypeChange(
                        e.target.value === "" ? null : e.target.value
                    )
                }
            >
                <option value="">Todos los tipos</option>
                <option value="debit">Debitos</option>
                <option value="credit">Creditos</option>

            </select>

            {/*Fecha inicial*/}
            <p>Desde:</p>
            <input
                type="date"
                value={startDate ?? ""}
                onChange={(e) => onStartDateChange(e.target.value)}
            />
            {/*Fecha final*/}
            <p>Hasta:</p>
            <input
                type="date"
                value={endDate ?? ""}
                onChange={(e) => onEndDateChange(e.target.value)}
            />
        </div>
    );
}
