import { useEffect, useState } from "react";
import { getSales } from "../../../api/sales.api";
import VentasTable from "../components/VentasTable";
import VentasForm from "../components/VentasForm";
import "./VentasPage.css";

export default function VentasPage() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getSales();
            setSales(res.data ?? []);
        } catch (err) {
            console.error("Error cargando ventas", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaleCreated = () => {
        setShowForm(false);
        loadData();
    };

    return (
        <div className="ventas-page">
            <div className="ventas-container">
                <div className="ventas-header">
                    <h2>Ventas</h2>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        + Agregar venta
                    </button>
                </div>

                {loading && <div className="loading">Cargando ventas...</div>}

                {!loading && <VentasTable sales={sales} />}
            </div>

            {showForm && (
                <div className="modal-backdrop">
                    <div className="modal modal-lg">
                        <div className="modal-header">
                            <h3>Nueva Venta</h3>
                            <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <VentasForm onSuccess={handleSaleCreated} onCancel={() => setShowForm(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}