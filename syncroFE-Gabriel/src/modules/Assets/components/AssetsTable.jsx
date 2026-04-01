import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

export default function AssetsTable({ data, onEdit, onToggleStatus }) {
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-CR");
    };

    const pagination = usePagination(data);

    if (!data.length) {
        return <div className="empty-state">No hay activos</div>;
    }

    return (
        <>
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
                {pagination.paginatedData.map(asset => (
                    <tr key={asset.assetId}>
                        <td className="number">{asset.assetName}</td>
                        <td>{asset.description || "-"}</td>
                        <td>{asset.serialNumber || "-"}</td>
                        <td>{asset.userName}</td>
                        <td>{formatDate(asset.assignmentDate)}</td>
                        <td>
                            <span className={asset.isActive ? "Activo-status" : "Inactivo-status"}>
                                {asset.isActive ? "Activo" : "Inactivo"}
                            </span>
                        </td>
                        <td className="actions">
                            <button className="btn btn-outline" onClick={() => onEdit(asset)}>
                                Editar
                            </button>
                            <button
                                className={`btn ${asset.isActive ? "btn-danger" : "btn-success"}`}
                                onClick={() => onToggleStatus(asset)}
                            >
                                {asset.isActive ? "Desactivar" : "Activar"}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <PaginationControls {...pagination} />
        </>
    );
}
