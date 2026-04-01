import "./QuotesPage.css";
import { useEffect, useState } from "react";
import {
    filterQuote,
    getQuotes,
    createQuote,
    updateQuote,
} from "../../../api/quote.api";

import QuoteToolbar from "../components/QuoteToolbar";
import QuoteTable from "../components/QuoteTable";
import QuoteFilters from "../components/QuoteFilters";
import QuoteForm from "../components/QuoteForm";

export default function QuotesPage() {

    // Datos
    const [quotes, setQuotes] = useState([]);

    // Interfaz
    const [loading, setLoading] = useState(false);

    // Filtros
    const [search, setSearch] = useState("");
    const [statusType, setStatusType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // CRUD cotizaciones
    const [showForm, setShowForm] = useState(false);
    const [editingQuote, setEditingQuote] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    //Cargar datos de quotes
    const loadData = async () => {
        try {
            let response;
            if (search || statusType || (startDate && endDate)) {
                response = await filterQuote(startDate, endDate, search, statusType);
            }
            else {
                response = await getQuotes();
            }
            setQuotes(response.data ?? []);
        } catch (err) {
            console.error("Error cargando cotizaciones", err);
        } finally {
            setLoading(false);
        }
    };

    // Nueva cotizacion
    const handleNewQuote = () => {
        setEditingQuote(null);
        setShowForm(true);
    };

    // Editar cotizacion
    const handleEdit = (quote) => {
        setEditingQuote(quote);
        setShowForm(true);
    };


    //Subir nueva cotizacion
    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);

            if (editingQuote) {
                await updateQuote(editingQuote.quoteId, {
                    ...values,
                    quoteId: editingQuote.quoteId,
                });
            } else {
                await createQuote(values);
            }

            setShowForm(false);
            setEditingQuote(null);

            const response = getQuotes();

            setQuotes(response.data ?? []);
            loadData();
        } catch (err) {
            console.error("Error guardando cotizacion", err);
            alert("Error guardando producto");
        } finally {
            setSubmitting(false);
        }
    };

    // Carga de cotizaciones
    useEffect(() => {
        loadData();
    }, [search, statusType,startDate,endDate]);

    return (
        <div className="quote-page">
            <div className="quote-card">

                {/*Barra de acciones*/}
                <QuoteToolbar
                    onNewQuote={handleNewQuote}
                />

                {/* Filtros */}
                <QuoteFilters
                    search={search}
                    statusType={statusType}
                    startDate={startDate}
                    endDate={endDate}
                    onSearchChange={setSearch}
                    onStatusTypeChange={setStatusType}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />

                {/*Efecto de carga*/}
                {loading && (
                    <div className="loading">Cargando cotizaciones...</div>
                )}

                {/*Tabla de registros*/}
                {!loading && (
                    <QuoteTable
                        quotes={quotes}
                        onEdit={handleEdit}
                    />
                )}

                {/* Formulario de creacion */}
                {showForm && (
                            <QuoteForm
                                initialValues={editingQuote}
                                submitting={submitting}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingQuote(null);
                                }}
                            />
                )}
            </div>
        </div>
    );
}
