import "./RoutesPage.css";
import { useEffect, useMemo, useState } from "react";
import {
    activateRoute,
    createRoute,
    deactivateRoute,
    getRoutes,
    updateRoute,
} from "../../../api/routes.api";
import { getUsers } from "../../../api/users.api";

import RouteToolbar from "../components/RouteToolbar";
import RouteFilters from "../components/RouteFilters";
import RouteTable from "../components/RouteTable";
import RouteForm from "../components/RouteForm";
import MyRoutesDriverView from "../components/MyRoutesDriverView";

export default function RoutesPage() {
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [routeDate, setRouteDate] = useState("");
    const [driverUserId, setDriverUserId] = useState("");
    const [includeInactive, setIncludeInactive] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user?.userRole;

    if (role === "Chofer") {
        return <MyRoutesDriverView />;
    }
    const loadDrivers = async () => {
        try {
            const response = await getUsers();
            const allUsers = response.data ?? [];
            const onlyDrivers = allUsers.filter(
                (u) => u.userRole === "Chofer"
            );
            setDrivers(onlyDrivers);
        } catch (err) {
            console.error("Error cargando choferes", err);
        }
    };

    const loadRoutes = async () => {
        try {
            setLoading(true);

            const params = {
                includeInactive,
            };

            if (routeDate) params.date = routeDate;
            if (driverUserId) params.driverUserId = Number(driverUserId);

            const response = await getRoutes(params);
            setRoutes(response.data ?? []);
        } catch (err) {
            console.error("Error cargando rutas", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDrivers();
    }, []);

    useEffect(() => {
        loadRoutes();
    }, [routeDate, driverUserId, includeInactive]);

    const filteredRoutes = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return routes;

        return routes.filter((r) =>
            (r.routeName ?? "").toLowerCase().includes(q) ||
            (r.driverName ?? "").toLowerCase().includes(q) ||
            String(r.routeId).includes(q)
        );
    }, [routes, search]);

    const handleNewRoute = () => {
        setEditingRoute(null);
        setShowForm(true);
    };

    const handleEdit = (route) => {
        setEditingRoute(route);
        setShowForm(true);
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);

            if (editingRoute) {
                await updateRoute(editingRoute.routeId, {
                    ...values,
                    routeId: editingRoute.routeId,
                });
            } else {
                await createRoute(values);
            }

            setShowForm(false);
            setEditingRoute(null);
            await loadRoutes();
        } catch (err) {
            console.error("Error guardando ruta", err);
            alert(
                err?.response?.data?.message ||
                err?.response?.data ||
                "No se pudo guardar la ruta."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async (routeId) => {
        try {
            await deactivateRoute(routeId);
            await loadRoutes();
        } catch (err) {
            console.error("Error desactivando ruta", err);
            alert("No se pudo desactivar la ruta.");
        }
    };

    const handleActivate = async (routeId) => {
        try {
            await activateRoute(routeId);
            await loadRoutes();
        } catch (err) {
            console.error("Error activando ruta", err);
            alert("No se pudo activar la ruta.");
        }
    };

    return (
        <div className="routes-page">
            <div className="routes-card">
                <RouteToolbar onNewRoute={handleNewRoute} />

                <RouteFilters
                    search={search}
                    routeDate={routeDate}
                    driverUserId={driverUserId}
                    includeInactive={includeInactive}
                    drivers={drivers}
                    onSearchChange={setSearch}
                    onRouteDateChange={setRouteDate}
                    onDriverUserIdChange={setDriverUserId}
                    onIncludeInactiveChange={setIncludeInactive}
                />

                {loading ? (
                    <div className="loading">Cargando rutas...</div>
                ) : (
                    <RouteTable
                        routes={filteredRoutes}
                        onEdit={handleEdit}
                        onDeactivate={handleDeactivate}
                        onActivate={handleActivate}
                    />
                )}

                {showForm && (
                    <RouteForm
                        initialValues={editingRoute}
                        submitting={submitting}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingRoute(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}