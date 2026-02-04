import "./StockPage.css";
import { useEffect, useState } from "react";
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

import StockToolbar from "../components/StockToolbar";
import StockTable from "../components/StockTable";
import StockForm from "../components/StockForm";
import StockFilters from "../components/StockFilters";
import StockEntryForm from "../components/StockEntryForm";

export default function StockPage() {
    // data
    const [products, setProducts] = useState([]);
    const [distributors, setDistributors] = useState([]);

    // ui
    const [showInactive, setShowInactive] = useState(false);
    const [loading, setLoading] = useState(false);

    // filtros
    const [name, setName] = useState("");
    const [distributorId, setDistributorId] = useState(null);

    // CRUD producto
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // entrada de stock
    const [showStockEntry, setShowStockEntry] = useState(false);

    // 🔹 toolbar handlers
    const handleNewProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleAddStock = () => {
        setShowStockEntry(true);
    };

    // 🔹 guardar entrada de stock
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
            alert("Error agregando mercadería");
        } finally {
            setSubmitting(false);
        }
    };

    // 🔹 cargar distribuidores
    useEffect(() => {
        getDistributorLookup()
            .then(res => setDistributors(res.data ?? []))
            .catch(err =>
                console.error("Error cargando distribuidores", err)
            );
    }, []);

    // 🔹 cargar productos
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

    // 🔹 editar producto
    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    // 🔹 guardar producto (CRUD)
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
            alert("Error guardando producto");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="stock-page">
            <div className="stock-card">
                <StockToolbar
                    showInactive={showInactive}
                    onToggle={() => setShowInactive(prev => !prev)}
                    onNewProduct={handleNewProduct}
                    onAddStock={handleAddStock}
                />

                <StockFilters
                    name={name}
                    distributorId={distributorId}
                    distributors={distributors}
                    onNameChange={setName}
                    onDistributorChange={setDistributorId}
                />

                {loading && (
                    <div className="loading">Cargando stock...</div>
                )}

                {!loading && (
                    <StockTable
                        products={products}
                        onEdit={handleEdit}
                        onActivate={async (id) => {
                            await activateProduct(id);
                            setProducts(prev =>
                                prev.filter(p => p.productId !== id)
                            );
                        }}
                        onDeactivate={async (id) => {
                            await deactivateProduct(id);
                            setProducts(prev =>
                                prev.filter(p => p.productId !== id)
                            );
                        }}
                    />
                )}
            </div>

            {/* CRUD PRODUCTO */}
            {showForm && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>
                            {editingProduct
                                ? "Editar producto"
                                : "Nuevo producto"}
                        </h3>

                        <StockForm
                            initialValues={editingProduct}
                            submitting={submitting}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingProduct(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ENTRADA DE STOCK */}
            {showStockEntry && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>Agregar mercadería</h3>

                        <StockEntryForm
                            submitting={submitting}
                            onSubmit={handleAddStockSubmit}
                            onCancel={() => setShowStockEntry(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
