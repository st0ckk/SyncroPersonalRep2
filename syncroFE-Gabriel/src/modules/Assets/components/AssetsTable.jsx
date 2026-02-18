export default function AssetsTable({ data, onEdit, onToggleStatus }) {
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-CR");
    };

    return (
        <table className="assets-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Serie</th>
                    <th>Asignado a</th>
                    <th>Fecha asignación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                            No hay activos registrados
                        </td>
                    </tr>
                ) : (
                    data.map((asset) => (
                        <tr key={asset.assetId}>
                            <td>{asset.assetName}</td>
                            <td>{asset.description || "-"}</td>
                            <td>{asset.serialNumber || "-"}</td>
                            <td>{asset.userName}</td>
                            <td>{formatDate(asset.assignmentDate)}</td>
                            <td>
                                <span
                                    className={
                                        asset.isActive
                                            ? "status-active"
                                            : "status-inactive"
                                    }
                                >
                                    {asset.isActive ? "Activo" : "Inactivo"}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => onEdit(asset)}
                                >
                                    Editar
                                </button>{" "}
                                <button
                                    className={`btn btn-sm ${asset.isActive
                                            ? "btn-danger"
                                            : "btn-success"
                                        }`}
                                    onClick={() => onToggleStatus(asset)}
                                >
                                    {asset.isActive ? "Desactivar" : "Activar"}
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}