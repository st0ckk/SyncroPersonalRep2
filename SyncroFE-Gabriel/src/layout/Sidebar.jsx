import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePermissions } from "../context/PermissionsContext";
import "./layout.css";

// Grupos colapsables del sidebar (grupos e ítems en orden alfabético)
const MENU = [
    // Dashboard siempre primero
    {
        label: "Dashboard",
        key: "dashboard",
        to: "/",
        roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"],
    },

    // Grupos ordenados A→Z
    {
        group: "Comercial",
        roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"],
        items: [
            { label: "Clientes",          key: "clientes",        to: "/clientes",        roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"] },
            { label: "Cotizaciones",      key: "cotizaciones",    to: "/cotizaciones",    roles: ["SuperUsuario", "Administrador", "Vendedor"] },
            { label: "Cuentas de crédito",key: "cuentas-credito", to: "/cuentas-credito", roles: ["SuperUsuario", "Administrador", "Vendedor"] },
            { label: "Facturación",       key: "facturacion",     to: "/facturacion",     roles: ["SuperUsuario", "Administrador", "Vendedor"] },
            { label: "Mapa de clientes",  key: "mapa-clientes",   to: "/mapa-clientes",   roles: ["SuperUsuario", "Administrador", "Vendedor", "Chofer"] },
            { label: "Mis Reportes",      key: "mis-reportes",    to: "/mis-reportes",    roles: ["SuperUsuario", "Administrador", "Vendedor"] },
            { label: "Ventas",            key: "ventas",          to: "/ventas",          roles: ["SuperUsuario", "Administrador", "Vendedor"] },
            { label: "Cajas",             key: "cajas",           to: "/cajas",           roles: ["SuperUsuario", "Administrador", "Vendedor"] },
        ],
    },

    {
        group: "Inventario",
        roles: ["SuperUsuario", "Administrador"],
        items: [
            { label: "Proveedores", key: "distributors", to: "/distributors", roles: ["SuperUsuario", "Administrador"] },
            { label: "Stock",          key: "stock",        to: "/stock",        roles: ["SuperUsuario", "Administrador"] },
        ],
    },

    {
        group: "Logística",
        roles: ["SuperUsuario", "Administrador", "Chofer"],
        items: [
            { label: "Monitoreo rutas",    key: "rutas-monitoreo",  to: "/rutas/monitoreo",   roles: ["SuperUsuario", "Administrador"] },
            { label: "Plantillas de rutas",key: "plantillas-rutas", to: "/plantillas-rutas",  roles: ["SuperUsuario", "Administrador"] },
            { label: "Rutas",              key: "rutas",            to: "/rutas",             roles: ["SuperUsuario", "Administrador", "Chofer"] },
        ],
    },

    {
        group: "Personal",
        roles: ["SuperUsuario", "Administrador"],
        items: [
            { label: "Activos",   key: "activos",   to: "/activos",   roles: ["SuperUsuario", "Administrador"] },
            { label: "Horarios",  key: "horarios",  to: "/horarios",  roles: ["SuperUsuario", "Administrador"] },
            { label: "Usuarios",  key: "usuarios",  to: "/usuarios",  roles: ["SuperUsuario", "Administrador"] },
        ],
    },

    // Reportes al final
    { label: "Reportes",        key: "reportes", to: "/reportes", roles: ["SuperUsuario", "Administrador"] },
    { label: "Logs del sistema", key: "logs",    to: "/logs",     roles: ["SuperUsuario", "Administrador"] },
];

const Sidebar = ({ open, onClose }) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user?.userRole;
    const { pathname } = useLocation();
    const { screens: grantedScreens } = usePermissions();

    // A screen is visible if the role allows it OR an extra grant covers it
    const canSee = (item) =>
        item.roles.includes(role) || grantedScreens.includes(item.key);

    // Determina qué grupo contiene la ruta activa (para abrirlo por defecto)
    const defaultOpen = MENU.filter((item) => item.group).reduce((acc, item) => {
        const hasActive = item.items.some((i) => pathname.startsWith(i.to));
        if (hasActive) acc[item.group] = true;
        return acc;
    }, {});

    const [openGroups, setOpenGroups] = useState(defaultOpen);

    const toggleGroup = (group) => {
        setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
    };

    if (!role) return null;

    return (
        <aside className={`sidebar${open ? " sidebar-open" : ""}`}>
            <button className="sidebar-close-btn" onClick={onClose}>✕</button>
            <h2 className="logo">SyncroCR</h2>

            <nav className="sidebar-nav">
                {MENU.map((item) => {
                    // Item suelto
                    if (!item.group) {
                        if (!canSee(item)) return null;
                        const isActive = pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`sidebar-link${isActive ? " sidebar-link-active" : ""}`}
                                onClick={onClose}
                            >
                                {item.label}
                            </Link>
                        );
                    }

                    // Grupo — filtrar ítems visibles por rol o permiso extra
                    const visibleItems = item.items.filter((i) => canSee(i));
                    if (visibleItems.length === 0) return null;

                    const isExpanded = !!openGroups[item.group];
                    const hasActive = visibleItems.some((i) => pathname.startsWith(i.to));

                    return (
                        <div key={item.group} className="sidebar-group">
                            <button
                                className={`sidebar-group-header${hasActive ? " sidebar-group-active" : ""}`}
                                onClick={() => toggleGroup(item.group)}
                            >
                                <span>{item.group}</span>
                                <span className={`sidebar-chevron${isExpanded ? " sidebar-chevron-open" : ""}`}>
                                    ›
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="sidebar-group-items">
                                    {visibleItems.map((i) => {
                                        const isActive = pathname.startsWith(i.to);
                                        return (
                                            <Link
                                                key={i.to}
                                                to={i.to}
                                                className={`sidebar-link sidebar-link-nested${isActive ? " sidebar-link-active" : ""}`}
                                                onClick={onClose}
                                            >
                                                {i.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;