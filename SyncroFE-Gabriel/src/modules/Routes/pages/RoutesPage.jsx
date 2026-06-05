import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
    activateRoute,
    createRoute,
    deactivateRoute,
    getRoutes,
    updateRoute,
} from "../../../api/routes.api";
import { getUsers } from "../../../api/users.api";

import { PageCard, Toolbar, FilterBar, Button } from "../../../components";
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
            setDrivers((response.data ?? []).filter(u => u.userRole === "Chofer"));
        } catch (err) {
            console.error("Error cargando choferes", err);
        }
    };

    const loadRoutes = async () => {
        try {
            setLoading(true);
            const params = { includeInactive };
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

    useEffect(() => { loadDrivers(); }, []);
    useEffect(() => { loadRoutes(); }, [routeDate, driverUserId, includeInactive]);

    const filteredRoutes = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return routes;
        return routes.filter(r =>
            (r.routeName ?? "").toLowerCase().includes(q) ||
            (r.driverName ?? "").toLowerCase().includes(q) ||
            String(r.routeId).includes(q)
        );
    }, [routes, search]);

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            if (editingRoute) {
                await updateRoute(editingRoute.routeId, { ...values, routeId: editingRoute.routeId });
            } else {
                await createRoute(values);
            }
            setShowForm(false);
            setEditingRoute(null);
            await loadRoutes();
        } catch (err) {
            console.error("Error guardando ruta", err);
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || err?.response?.data || "No se pudo guardar la ruta." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageCard>
            <Toolbar title="Rutas">
                <Button variant="primary" onClick={() => { setEditingRoute(null); setShowForm(true); }}>
                    + Nueva ruta
                </Button>
            </Toolbar>

            <FilterBar>
                <input type="text" placeholder="Buscar ruta, chofer o ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <input type="date" value={routeDate} onChange={(e) => setRouteDate(e.target.value)} />
                <select value={driverUserId} onChange={(e) => setDriverUserId(e.target.value)}>
                    <option value="">Todos los choferes</option>
                    {drivers.map(d => <option key={d.userId} value={d.userId}>{d.userName} {d.userLastname}</option>)}
                </select>
                <label>
                    <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
                    Incluir inactivas
                </label>
            </FilterBar>

            {loading ? (
                <div className="loading">Cargando rutas...</div>
            ) : (
                <RouteTable
                    routes={filteredRoutes}
                    onEdit={(r) => { setEditingRoute(r); setShowForm(true); }}
                    onDeactivate={async (id) => { await deactivateRoute(id); loadRoutes(); }}
                    onActivate={async (id) => { await activateRoute(id); loadRoutes(); }}
                />
            )}

            {showForm && (
                <RouteForm
                    initialValues={editingRoute}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingRoute(null); }}
                />
            )}
        </PageCard>
    );
}
