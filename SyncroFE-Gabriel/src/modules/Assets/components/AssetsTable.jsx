import { usePagination } from "../../../hooks/usePagination";
import Button from "../../../components/Button";
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
        <div className="table-scroll">
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
                            <Button variant="outline" onClick={() => onEdit(asset)}>
                                Editar
                            </Button>
                            <Button
                                variant={asset.isActive ? "danger" : "success"}
                                onClick={() => onToggleStatus(asset)}
                            >
                                {asset.isActive ? "Desactivar" : "Activar"}
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
        <PaginationControls {...pagination} />
        </>
    );
}
