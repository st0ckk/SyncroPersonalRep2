import "./VentasPage.css";
import { useEffect, useState } from "react";
import {
    getSales,
    filterSale,
    deleteSale,
    createSale,
    updateSale,
} from "../../../api/sales.api";

import VentasToolbar from "../components/VentasToolbar";
import VentasTable from "../components/VentasTable";
import VentasFilters from "../components/VentasFilters";
import VentasForm from "../components/VentasForm";

export default function VentasPage() {

    // Datos
    const [sales, setSales] = useState([]);

    // Interfaz
    const [loading, setLoading] = useState(true);

    // Filtros
    const [search, setSearch] = useState("");
    const [statusType, setStatusType] = useState("");
    const [paidStatusType, setPaidStatusType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    //CRUD Ventas
    const [showForm, setShowForm] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [submitting, setSubmitting] = useState(false);


    //Cargar datos de ventas
    const loadData = async () => {
        try {
            let response;

            if (search || statusType || paidStatusType || (startDate && endDate)) {
                response = await filterSale(startDate, endDate, search, statusType, paidStatusType);
            }
            else {
                response = await getSales();
            }
            setSales(response.data ?? []);
        } catch (err) {
            console.error("Error cargando ventas", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [search, statusType, paidStatusType, startDate, endDate]);

    // Nueva venta
    const handleSaleCreated = () => {
        setEditingSale(null);
        setShowForm(true);
    };

    // Editar Venta
    const handleEdit = (sale) => {
        setEditingSale(sale);
        setShowForm(true);
    };

    //Subir nueva VENTA
    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);

            if (editingSale) {
                await updateSale(editingSale.purchaseId, {
                    ...values,
                    purchaseId: editingSale.purchaseId,
                });
            } else {
                await createSale(values);
            }

            setShowForm(false);
            setEditingSale(null);

            const response = getSales();

            setSales(response.data ?? []);
            loadData();
        } catch (err) {
            console.error("Error guardando la venta", err);
            alert("Error guardando producto");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (purchaseId) => {
        await deleteSale(purchaseId);
        loadData();
    };

    return (
        <div className="ventas-page">
            <div className="ventas-container">

                {/*Barra de acciones*/}
                <VentasToolbar
                    onNewSale={handleSaleCreated}
                />

                {/* Filtros */}
                <VentasFilters
                    search={search}
                    statusType={statusType}
                    paidStatusType={paidStatusType}
                    startDate={startDate}
                    endDate={endDate}
                    onSearchChange={setSearch}
                    onStatusTypeChange={setStatusType}
                    onPaidStatusTypeChange={setPaidStatusType}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />

                {loading && <div className="loading">Cargando ventas...</div>}

                {!loading && <VentasTable
                    sales={sales}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />}
            </div>

            {/* Formulario de creacion */}
            {showForm && (
                <VentasForm
                    initialValues={editingSale}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingSale(null);
                    }}
                />
            )}
        </div>
    );
}
