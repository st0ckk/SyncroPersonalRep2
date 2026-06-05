import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    getProducts,
    getInactiveProducts,
    createProduct,
    updateProduct,
    activateProduct,
    deactivateProduct,
    filterStock,
    addStock,
} from "../../../api/stock.api";
import { getDistributorLookup } from "../../../api/distributors.api";

import { PageCard, Toolbar, FilterBar, DataTable, Modal, StatusBadge, Button } from "../../../components";
import StockForm from "../components/StockForm";
import StockEntryForm from "../components/StockEntryForm";

export default function StockPage() {
    const [products, setProducts] = useState([]);
    const [distributors, setDistributors] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [distributorId, setDistributorId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showStockEntry, setShowStockEntry] = useState(false);

    useEffect(() => {
        getDistributorLookup()
            .then(res => setDistributors(res.data ?? []))
            .catch(err => console.error("Error cargando distribuidores", err));
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                let response;
                if (name || distributorId) {
                    response = await filterStock({ name, distributorId });
                } else {
                    response = showInactive
                        ? await getInactiveProducts()
                        : await getProducts();
                }
                setProducts(response.data ?? []);
            } catch (err) {
                console.error("Error cargando stock", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [showInactive, name, distributorId]);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            if (editingProduct) {
                await updateProduct(editingProduct.productId, {
                    ...values,
                    productId: editingProduct.productId,
                    isActive: editingProduct.isActive,
                });
            } else {
                await createProduct(values);
            }
            setShowForm(false);
            setEditingProduct(null);
            const response = showInactive
                ? await getInactiveProducts()
                : await getProducts();
            setProducts(response.data ?? []);
        } catch (err) {
            console.error("Error guardando producto", err);
            Swal.fire({ icon: "error", title: "Error", text: "Error guardando producto" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddStockSubmit = async (values) => {
        try {
            setSubmitting(true);
            await addStock(values);
            setShowStockEntry(false);
            const response = showInactive
                ? await getInactiveProducts()
                : await getProducts();
            setProducts(response.data ?? []);
        } catch (err) {
            console.error("Error agregando mercadería", err);
            Swal.fire({ icon: "error", title: "Error", text: "Error agregando mercadería" });
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { key: "productName", header: "Nombre", render: (row) => <span className="cell-name">{row.productName}</span> },
        { key: "distributorName", header: "Proveedor" },
        { key: "productType", header: "Tipo" },
        { key: "productPrice", header: "Precio", render: (row) => <span className="cell-price">₡{row.productPrice}</span> },
        { key: "productQuantity", header: "Cantidad" },
        { key: "status", header: "Estado", render: (row) => <StatusBadge status={row.isActive ? "Activo" : "Inactivo"} /> },
        {
            key: "actions",
            header: "Acciones",
            className: "actions",
            render: (row) => (
                <>
                    <Button variant="warning" onClick={() => handleEdit(row)}>Editar</Button>
                    {row.isActive ? (
                        <Button variant="danger" onClick={() => deactivateProduct(row.productId).then(() => setProducts(prev => prev.filter(p => p.productId !== row.productId)))}>Desactivar</Button>
                    ) : (
                        <Button variant="success" onClick={() => activateProduct(row.productId).then(() => setProducts(prev => prev.filter(p => p.productId !== row.productId)))}>Activar</Button>
                    )}
                </>
            ),
        },
    ];

    return (
        <PageCard>
            <Toolbar title="Stock">
                <Button variant="outline" onClick={() => setShowInactive(prev => !prev)}>
                    {showInactive ? "Ver Activos" : "Ver Inactivos"}
                </Button>
                <Button variant="secondary" onClick={() => setShowStockEntry(true)}>
                    + Agregar mercadería
                </Button>
                <Button variant="primary" onClick={() => { setEditingProduct(null); setShowForm(true); }}>
                    + Nuevo producto
                </Button>
            </Toolbar>

            <FilterBar>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <select
                    value={distributorId ?? ""}
                    onChange={(e) => setDistributorId(e.target.value === "" ? null : Number(e.target.value))}
                >
                    <option value="">Todos los proveedores</option>
                    {distributors.map(d => (
                        <option key={d.distributorId} value={d.distributorId}>{d.name}</option>
                    ))}
                </select>
            </FilterBar>

            {loading ? (
                <div className="loading">Cargando stock...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={products}
                    rowKey="productId"
                    emptyMessage="No hay productos"
                />
            )}

            <Modal
                open={showForm}
                title={editingProduct ? "Editar producto" : "Nuevo producto"}
                onClose={() => { setShowForm(false); setEditingProduct(null); }}
            >
                <StockForm
                    initialValues={editingProduct}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingProduct(null); }}
                />
            </Modal>

            <Modal
                open={showStockEntry}
                title="Agregar mercadería"
                onClose={() => setShowStockEntry(false)}
            >
                <StockEntryForm
                    submitting={submitting}
                    onSubmit={handleAddStockSubmit}
                    onCancel={() => setShowStockEntry(false)}
                />
            </Modal>
        </PageCard>
    );
}
