import "./QuotesPage.css";
import { useEffect, useState } from "react";
import {
    filterQuote,
    getQuotes,
} from "../../../api/quote.api";

import QuoteToolbar from "../components/QuoteToolbar";
import QuoteTable from "../components/QuoteTable";
import QuoteFilters from "../components/QuoteFilters";

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

    // Carga de cotizaciones
    useEffect(() => {
        loadData();
    }, [search, statusType,startDate,endDate]);

    return (
        <div className="quote-page">
            <div className="quote-card">

                {/*Barra de acciones*/}
                <QuoteToolbar
                /*
                    onNewProduct={handleNewProduct}
                onAddStock={handleAddStock}
                    */
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
                    />
                )}
            </div>
        </div>
    );
}
