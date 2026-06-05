import Button from "../../../components/Button";

export default function UsersToolbar({
  showInactive,
  onToggle,
  onNew,
  filters,
  onFilterChange,
}) {
  return (
    <div className="users-toolbar">
      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filters.name}
          onChange={(e) =>
            onFilterChange({ ...filters, name: e.target.value })
          }
        />

        <select
          value={filters.role}
          onChange={(e) =>
            onFilterChange({ ...filters, role: e.target.value })
          }
        >
          <option value="">Todos los roles</option>
          <option value="SuperUsuario">SuperUsuario</option>
          <option value="Administrador">Administrador</option>
          <option value="Vendedor">Vendedor</option>
          <option value="Chofer">Chofer</option>
        </select>
      </div>

      {/* Acciones */}
      <div className="toolbar-actions">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
        >
          {showInactive ? "Ver activos" : "Ver inactivos"}
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onNew}
        >
          + Nuevo empleado
        </Button>
      </div>
    </div>
  );
}
