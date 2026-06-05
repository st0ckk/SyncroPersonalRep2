import { usePagination } from "../../../hooks/usePagination";
import Button from "../../../components/Button";
import PaginationControls from "../../../components/PaginationControls";

export default function StockTable({
    products,
    onEdit,
    onActivate,
    onDeactivate,
}) {
    const pagination = usePagination(products);

    if (!products.length) {
        return <div className="empty-state">No hay productos</div>;
    }

    return (
        <>
        <div className="table-scroll">
        <table className="stock-table">
            <thead>
                <tr>

                    <th>Nombre</th>
                    <th>Proveedor</th>
                    <th>Tipo</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                {pagination.paginatedData.map(p => (
                    <tr key={p.productId}>

                        <td className="name">{p.productName}</td>
                        <td>{p.distributorName}</td>
                        <td>{p.productType}</td>
                        <td className="price">₡{p.productPrice}</td>
                        <td>{p.productQuantity}</td>
                        <td>{p.isActive ? "Activo" : "Inactivo"}</td>
                        <td className="actions">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onEdit(p)}
                            >
                                Editar
                            </Button>

                            {p.isActive ? (
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={() => onDeactivate(p.productId)}
                                >
                                    Desactivar
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="success"
                                    onClick={() => onActivate(p.productId)}
                                >
                                    Activar
                                </Button>
                            )}
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
