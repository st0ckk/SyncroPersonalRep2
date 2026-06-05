import { useEffect, useState } from "react";
import {
    filterQuote,
    getQuotes,
    createQuote,
    updateQuote,
} from "../../../api/quote.api";

import { PageCard, Toolbar, FilterBar, Button } from "../../../components";
import QuoteTable from "../components/QuoteTable";
import QuoteForm from "../components/QuoteForm";

import Swal from "sweetalert2";

export default function QuotesPage() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusType, setStatusType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingQuote, setEditingQuote] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            let response;
            if (search || statusType || (startDate && endDate)) {
                response = await filterQuote(startDate, endDate, search, statusType);
            } else {
                response = await getQuotes();
            }
            setQuotes(response.data ?? []);
        } catch (err) {
            console.error("Error cargando cotizaciones", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            if (editingQuote) {
                await updateQuote(editingQuote.quoteId, { ...values, quoteId: editingQuote.quoteId });
            } else {
                await createQuote(values);
            }
            setShowForm(false);
            setEditingQuote(null);
            loadData();
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "¡Exito!",
                text: "Se ha guardado la cotización",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            console.error("Error guardando cotizacion", err);
            Swal.fire({ icon: "error", title: "Error...", text: "Error guardando cotización" });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => { loadData(); }, [search, statusType, startDate, endDate]);

    return (
        <PageCard>
            <Toolbar title="Cotizaciones">
                <Button variant="primary" onClick={() => { setEditingQuote(null); setShowForm(true); }}>
                    + Nueva cotización
                </Button>
            </Toolbar>

            <FilterBar>
                <input
                    type="text"
                    placeholder="Buscar cotización..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={statusType} onChange={(e) => setStatusType(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobada</option>
                    <option value="rejected">Rechazada</option>
                    <option value="expired">Expirada</option>
                </select>
                <span className="filter-label">Desde:</span>
                <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value || null)} />
                <span className="filter-label">Hasta:</span>
                <input type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value || null)} />
            </FilterBar>

            {loading && <div className="loading">Cargando cotizaciones...</div>}

            {!loading && (
                <QuoteTable
                    quotes={quotes}
                    onEdit={(q) => { setEditingQuote(q); setShowForm(true); }}
                />
            )}

            {showForm && (
                <QuoteForm
                    initialValues={editingQuote}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingQuote(null); }}
                />
            )}
        </PageCard>
    );
}
