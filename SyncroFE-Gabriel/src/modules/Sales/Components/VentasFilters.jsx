export default function VentasFilters({
    search,
    statusType,
    paidStatusType,
    startDate,
    endDate,
    onSearchChange,
    onStatusTypeChange,
    onPaidStatusTypeChange,
    onStartDateChange,
    onEndDateChange
}) {
    return (
        <div className="ventas-filters">
            <input
                type="text"
                placeholder="Buscar una venta..."
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
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
            </select>

            <select
                value={paidStatusType ?? ""}
                onChange={(e) =>
                    onPaidStatusTypeChange(
                        e.target.value === "" ? null : e.target.value
                    )
                }
            >
                <option value="">Todos los estados de pago</option>
                <option value="paid">Pagados</option>
                <option value="notPaid">Pendientes de pago</option>
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
