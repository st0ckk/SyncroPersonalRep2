import { useEffect, useState } from "react";
import {
    getSales,
    filterSale,
    deleteSale,
    createSale,
    updateSale,
} from "../../../api/sales.api";

import { PageCard, Toolbar, FilterBar, Button } from "../../../components";
import VentasTable from "../components/VentasTable";
import VentasForm from "../components/VentasForm";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export default function VentasPage() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusType, setStatusType] = useState("");
    const [paidStatusType, setPaidStatusType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const SwalAlert = withReactContent(Swal);

    const loadData = async () => {
        try {
            let response;
            if (search || statusType || paidStatusType || (startDate && endDate)) {
                response = await filterSale(startDate, endDate, search, statusType, paidStatusType);
            } else {
                response = await getSales();
            }
            setSales(response.data ?? []);
        } catch (err) {
            console.error("Error cargando ventas", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [search, statusType, paidStatusType, startDate, endDate]);

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            if (editingSale) {
                await updateSale(editingSale.purchaseId, { ...values, purchaseId: editingSale.purchaseId });
            } else {
                await createSale(values);
            }
            setShowForm(false);
            setEditingSale(null);
            loadData();
        } catch (err) {
            console.error("Error guardando la venta", err);
            SwalAlert.fire({ icon: "error", title: "Error...", text: "Error guardando venta" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (purchaseId) => {
        await deleteSale(purchaseId);
        loadData();
    };

    return (
        <PageCard>
            <Toolbar title="Ventas">
                <Button variant="primary" onClick={() => { setEditingSale(null); setShowForm(true); }}>
                    + Nueva venta
                </Button>
            </Toolbar>

            <FilterBar>
                <input type="text" placeholder="Buscar una venta..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <select value={statusType} onChange={(e) => setStatusType(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="active">Activa</option>
                    <option value="inactive">Cancelada</option>
                </select>
                <select value={paidStatusType} onChange={(e) => setPaidStatusType(e.target.value)}>
                    <option value="">Pago: Todos</option>
                    <option value="paid">Pagada</option>
                    <option value="notPaid">No pagada</option>
                </select>
                <span className="filter-label">Desde:</span>
                <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value || null)} />
                <span className="filter-label">Hasta:</span>
                <input type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value || null)} />
            </FilterBar>

            {loading && <div className="loading">Cargando ventas...</div>}

            {!loading && (
                <VentasTable sales={sales} onDelete={handleDelete} onEdit={(s) => { setEditingSale(s); setShowForm(true); }} />
            )}

            {showForm && (
                <VentasForm
                    initialValues={editingSale}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingSale(null); }}
                />
            )}
        </PageCard>
    );
}
