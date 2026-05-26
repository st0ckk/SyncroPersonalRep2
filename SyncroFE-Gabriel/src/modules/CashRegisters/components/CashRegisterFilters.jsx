export default function CashRegisterFilters({
    search,
    statusType,
    startDate,
    endDate,
    onSearchChange,
    onStatusTypeChange,
    onStartDateChange,
    onEndDateChange
}) {
    return (
        <div className="registers-filters">
            <input
                type="text"
                placeholder="Buscar caja..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <select
                value={statusType ?? ""}
                onChange={(e) =>
                    onStatusTypeChange(
                        e.target.value === "" ? null : e.target.value
                    )
                }
            >
                <option value="">Todos los estados</option>
                <option value="open">Abierta</option>
                <option value="closed">Cerrada</option>
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
