export default function CashRegisterMovementFilters({
    onNewMovement,
    registerState,
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
        <div className="registers-filters">
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
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>

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

            {/*Movimientos manuales*/}
            <button className="btn-manual-movement"
                disabled={registerState != "open"} onClick={onNewMovement}>
                + Agregar movimiento manual
            </button>
        </div>
    );
}