import "./DashboardPage.css";
import { useEffect, useState } from "react";
import { getAdminDashboard, getSellerDashboard } from "../../../api/dashboard.api";
import AdminDashboard from "../components/AdminDashboard";
import SellerDashboard from "../components/SellerDashboard";

export default function DashboardPage() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user?.userRole;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isAdmin = role === "SuperUsuario" || role === "Administrador";
    const isSeller = role === "Vendedor";

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError(null);

                if (isAdmin) {
                    const res = await getAdminDashboard();
                    setData(res.data);
                } else if (isSeller) {
                    const res = await getSellerDashboard();
                    setData(res.data);
                }
            } catch (err) {
                console.error("Error cargando dashboard", err);
                setError("Error al cargar el dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [role]);

    if (loading) {
        return <div className="dashboard-loading">Cargando dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-loading">{error}</div>;
    }

    // Chofer: vista mínima
    if (role === "Chofer") {
        return (
            <div className="dashboard-page">
                <h1 className="page-title">Bienvenido</h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    Usá el menú lateral para acceder a tus rutas y clientes.
                </p>
            </div>
        );
    }

    // Vendedor
    if (isSeller && data) {
        return <SellerDashboard data={data} userName={user?.userName} />;
    }

    // Admin / SuperUsuario
    if (isAdmin && data) {
        return <AdminDashboard data={data} />;
    }

    return null;
}
