import Button from "../../../components/Button";

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

            <span className="filter-label">Desde:</span>
            <input
                type="date"
                value={startDate ?? ""}
                onChange={(e) => onStartDateChange(e.target.value)}
            />

            <span className="filter-label">Hasta:</span>
            <input
                type="date"
                value={endDate ?? ""}
                onChange={(e) => onEndDateChange(e.target.value)}
            />

            <Button variant="primary"
                disabled={registerState != "open"} onClick={onNewMovement}>
                + Agregar movimiento manual
            </Button>
        </div>
    );
}