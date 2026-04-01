export default function FacturacionFilters({
    statusFilter,
    docTypeFilter,
    startDate,
    endDate,
    onStatusChange,
    onDocTypeChange,
    onStartDateChange,
    onEndDateChange,
}) {
    return (
        <div className="facturacion-filters">
            <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
            >
                <option value="">Todos los estados</option>
                <option value="accepted">Aceptado</option>
                <option value="sent">Enviado</option>
                <option value="pending">Pendiente</option>
                <option value="rejected">Rechazado</option>
                <option value="error">Error</option>
            </select>

            <select
                value={docTypeFilter}
                onChange={(e) => onDocTypeChange(e.target.value)}
            >
                <option value="">Todos los tipos</option>
                <option value="01">Factura Electronica</option>
                <option value="03">Nota de Credito</option>
                <option value="02">Nota de Debito</option>
                <option value="04">Tiquete Electronico</option>
            </select>

            <p>Desde:</p>
            <input
                type="date"
                value={startDate ?? ""}
                onChange={(e) => onStartDateChange(e.target.value || null)}
            />

            <p>Hasta:</p>
            <input
                type="date"
                value={endDate ?? ""}
                onChange={(e) => onEndDateChange(e.target.value || null)}
            />
        </div>
    );
}
