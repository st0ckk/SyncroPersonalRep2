export default function StockTable({
    products,
    onEdit,
    onActivate,
    onDeactivate,
}) {
    if (!products.length) {
        return <div className="empty-state">No hay productos</div>;
    }

    return (
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
                {products.map(p => (
                    <tr key={p.productId}>
                        
                        <td className="name">{p.productName}</td>
                        <td>{p.distributorName}</td>
                        <td>{p.productType}</td>
                        <td className="price">₡{p.productPrice}</td>
                        <td>{p.productQuantity}</td>
                        <td>{p.isActive ? "Activo" : "Inactivo"}</td>
                        <td className="actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => onEdit(p)}
                            >
                                Editar
                            </button>

                            {p.isActive ? (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => onDeactivate(p.productId)}
                                >
                                    Desactivar
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => onActivate(p.productId)}
                                >
                                    Activar
                                </button>
                            )}
                        </td>

                    </tr>
                ))}
            </tbody>
        </table>
    );
}
